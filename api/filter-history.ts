import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const getStringValue = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return value || '';
  };

  const collectionStr = getStringValue(req.query.collection);
  const collection = collectionStr || null;

  const userIdStr = getStringValue(req.query.userId);
  const userId = userIdStr || null;

  const liquidityMinStr = getStringValue(req.query.liquidity_min);
  const liquidity_min = liquidityMinStr ? Number(liquidityMinStr) : null;

  const payoutMinStr = getStringValue(req.query.payout_min);
  const payout_min = payoutMinStr ? Number(payoutMinStr) : null;

  const evMinStr = getStringValue(req.query.ev_min);
  const ev_min = evMinStr ? Number(evMinStr) : null;

  const sportsStr = getStringValue(req.query.sports);
  const sports = sportsStr ? sportsStr.split(',') : null;

  const bookmakersStr = getStringValue(req.query.bookmakers);
  const bookmakers = bookmakersStr ? bookmakersStr.split(',') : null;

  const date_max = getStringValue(req.query.date_max) || null;

  const pageSizeStr = getStringValue(req.query.page_size);
  const page_size = pageSizeStr ? Number(pageSizeStr) : 20;

  const pageNumberStr = getStringValue(req.query.page_number);
  const page_number = pageNumberStr ? Number(pageNumberStr) : 1;

  try {
    const result = await runFilterForUser({
      mongoUri: process.env.MONGODB_URI,
      collection,
      userId,
      liquidity_min,
      payout_min,
      ev_min,
      sports,
      bookmakers,
      date_max,
      date_field: 'date',
      page_size,
      page_number,
      writeBack: false,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function runFilterForUser(options) {
  const {
    mongoUri,
    userId = null,
    collection,
    liquidity_min = null,
    payout_min = null,
    ev_min = null,
    sports = null,
    bookmakers = null,
    date_max = null,
    date_field = 'date',
    writeBack = false,
    out_id = '__summary__:filtered',
    summary_flag_key = '__summary__',
    page_size = 20,
    page_number = 1,
  } = options;

  function sixMonthsAgo(d) {
    return new Date(d.getFullYear(), d.getMonth() - 6, d.getDate());
  }
  const enforced_date_min = sixMonthsAgo(new Date());

  function toDate(obj) {
    if (obj == null) return null;
    if (obj instanceof Date)
      return new Date(obj.getFullYear(), obj.getMonth(), obj.getDate());
    if (typeof obj === 'string') {
      const tryParse = (str, fmt) => {
        let rx;
        if (fmt === 'YYYY-MM-DD') rx = /^(\d{4})-(\d{2})-(\d{2})$/;
        else if (fmt === 'DD/MM/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        else if (fmt === 'DD-MM-YYYY') rx = /^(\d{2})-(\d{2})-(\d{4})$/;
        else if (fmt === 'MM/DD/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const m = rx.exec(str);
        if (!m) return null;
        let y, mo, d;
        if (fmt === 'YYYY-MM-DD') {
          y = +m[1];
          mo = +m[2];
          d = +m[3];
        } else if (fmt === 'DD/MM/YYYY' || fmt === 'DD-MM-YYYY') {
          y = +m[3];
          mo = +m[2];
          d = +m[1];
        } else if (fmt === 'MM/DD/YYYY') {
          y = +m[3];
          mo = +m[1];
          d = +m[2];
        }
        const dt = new Date(y, mo - 1, d);
        if (
          dt.getFullYear() === y &&
          dt.getMonth() === mo - 1 &&
          dt.getDate() === d
        )
          return dt;
        return null;
      };
      const fmts = ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY'];
      for (let i = 0; i < fmts.length; i++) {
        const d = tryParse(obj, fmts[i]);
        if (d) return d;
      }
      return null;
    }
    return null;
  }

  function safeGetArray(obj, key) {
    return obj &&
      Object.prototype.hasOwnProperty.call(obj, key) &&
      Array.isArray(obj[key])
      ? obj[key]
      : null;
  }

  function filterBetsDoc(doc, return_format) {
    const list_fields: string[] = [];
    for (const k in doc)
      if (Object.prototype.hasOwnProperty.call(doc, k) && Array.isArray(doc[k]))
        list_fields.push(k);
    if (!list_fields.length)
      throw new Error('Le document ne contient pas de champs liste à filtrer.');
    if (!Array.isArray(doc.liquidity))
      throw new Error('Champ manquant ou non-list: liquidity');
    if (!Array.isArray(doc.payout_rate))
      throw new Error('Champ manquant ou non-list: payout_rate');
    if (ev_min != null && !Array.isArray(doc.ev))
      throw new Error(
        "Filtre ev_min demandé mais champ 'ev' absent ou non-list.",
      );

    let sportsSet: Record<string, boolean> | null = null;
    if (Array.isArray(sports) && sports.length) {
      sportsSet = {};
      for (let si = 0; si < sports.length; si++)
        sportsSet[String(sports[si]).toLowerCase()] = true;
    }

    let bookSet: Record<string, boolean> | null = null;
    if (Array.isArray(bookmakers) && bookmakers.length) {
      if (!Array.isArray(doc.bookmaker))
        throw new Error(
          "Filtre bookmakers demandé mais champ 'bookmaker' absent ou non-list.",
        );
      bookSet = {};
      for (let bi = 0; bi < bookmakers.length; bi++)
        bookSet[String(bookmakers[bi]).toLowerCase()] = true;
    }

    const dmin = enforced_date_min;
    const dmax = date_max != null ? toDate(date_max) : null;
    if ((dmin || dmax) && !Array.isArray(doc[date_field])) {
      throw new Error(
        "Filtre date demandé mais champ '" +
          date_field +
          "' absent ou non-list.",
      );
    }

    let n = Infinity;
    for (let lf = 0; lf < list_fields.length; lf++) {
      const arr = doc[list_fields[lf]];
      if (arr.length < n) n = arr.length;
    }

    const keep: number[] = [];
    for (let i = 0; i < n; i++) {
      const liq = doc.liquidity[i];
      const pay = doc.payout_rate[i];
      if (liq == null || pay == null) continue;
      if (liquidity_min != null && +liq < liquidity_min) continue;
      if (payout_min != null && +pay < payout_min) continue;

      if (ev_min != null) {
        const evVal = doc.ev[i];
        if (evVal == null || +evVal < ev_min) continue;
      }

      if (sportsSet) {
        const sArr = safeGetArray(doc, 'sport');
        let sval = sArr && i < sArr.length ? sArr[i] : '';
        sval = String(sval).toLowerCase();
        if (!sportsSet[sval]) continue;
      }

      if (bookSet) {
        const bArr = safeGetArray(doc, 'bookmaker');
        let bval = bArr && i < bArr.length ? bArr[i] : '';
        bval = String(bval).toLowerCase();
        if (!bookSet[bval]) continue;
      }

      if (dmin || dmax) {
        const raw = doc[date_field][i];
        const dv = toDate(raw);
        if (!dv) continue;
        if (dmin && dv < dmin) continue;
        if (dmax && dv > dmax) continue;
      }

      keep.push(i);
    }

    if (return_format === 'rows') {
      const rows: { idx: number }[] = [];
      for (let r = 0; r < keep.length; r++) {
        const idx = keep[r];
        const row = { idx: idx };
        for (let lf2 = 0; lf2 < list_fields.length; lf2++) {
          const key = list_fields[lf2];
          if (doc[key].length > idx) row[key] = doc[key][idx];
        }
        rows.push(row);
      }
      return rows;
    }

    const out: Record<string, unknown> = {};
    for (const key2 in doc) {
      if (!Object.prototype.hasOwnProperty.call(doc, key2)) continue;
      const v2 = doc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (let lf3 = 0; lf3 < list_fields.length; lf3++) {
      const key3 = list_fields[lf3];
      const a3: unknown[] = [];
      for (let j = 0; j < keep.length; j++) a3.push(doc[key3][keep[j]]);
      out[key3] = a3;
    }

    if (typeof out.counts === 'object' && out.counts) {
      for (const ck in out.counts) {
        if (
          Object.prototype.hasOwnProperty.call(out.counts, ck) &&
          ck.slice(-6) === '_count'
        ) {
          const field = ck.slice(0, -6);
          if (Array.isArray(out[field]))
            out.counts[ck] = (out[field] as unknown[]).length;
        }
      }
      if (Object.prototype.hasOwnProperty.call(out, 'total_rows')) {
        let maxLen = 0;
        for (const k2 in out)
          if (Array.isArray(out[k2]) && (out[k2] as unknown[]).length > maxLen)
            maxLen = (out[k2] as unknown[]).length;
        out.total_rows = maxLen;
      }
    } else {
      out.total_rows = keep.length;
    }

    out.applied_filters = {
      liquidity_min: liquidity_min,
      payout_min: payout_min,
      ev_min: ev_min,
      sports: sports,
      bookmakers: bookmakers,
      date_min: dmin ? dmin.toISOString().slice(0, 10) : null,
      date_max: dmax ? dmax.toISOString().slice(0, 10) : null,
      date_field: date_field,
    };
    return out;
  }

  function dedupeFirstByMatchAndDate(filteredDoc) {
    const list_fields: string[] = [];
    for (const k in filteredDoc)
      if (
        Object.prototype.hasOwnProperty.call(filteredDoc, k) &&
        Array.isArray(filteredDoc[k])
      )
        list_fields.push(k);
    let matchKey: string | null = null;
    const candidates = ['match', 'event', 'fixture', 'game'];
    for (let i = 0; i < candidates.length; i++) {
      if (Array.isArray(filteredDoc[candidates[i]])) {
        matchKey = candidates[i];
        break;
      }
    }
    if (!matchKey || !Array.isArray(filteredDoc[date_field]))
      return filteredDoc;

    let n = Infinity;
    for (let lf = 0; lf < list_fields.length; lf++) {
      const arr = filteredDoc[list_fields[lf]];
      if (arr.length < n) n = arr.length;
    }

    const seen = {};
    const keepIdx: number[] = [];
    for (let i = 0; i < n; i++) {
      const m = filteredDoc[matchKey][i];
      const d = toDate(filteredDoc[date_field][i]);
      const dkey = d
        ? d.getFullYear() +
          '-' +
          String(d.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(d.getDate()).padStart(2, '0')
        : 'NA';
      const key = String(m).toLowerCase() + '||' + dkey;
      if (!Object.prototype.hasOwnProperty.call(seen, key)) {
        seen[key] = true;
        keepIdx.push(i);
      }
    }

    const out: Record<string, unknown> = {};
    for (const key2 in filteredDoc) {
      if (!Object.prototype.hasOwnProperty.call(filteredDoc, key2)) continue;
      const v2 = filteredDoc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (let lf2 = 0; lf2 < list_fields.length; lf2++) {
      const key3 = list_fields[lf2];
      const a3: unknown[] = [];
      for (let j = 0; j < keepIdx.length; j++)
        a3.push(filteredDoc[key3][keepIdx[j]]);
      out[key3] = a3;
    }
    out.total_rows = keepIdx.length;
    return out;
  }

  function computePnL(filtered, bankroll_reference) {
    function pick(cands) {
      for (let i = 0; i < cands.length; i++) {
        const k = cands[i];
        if (Array.isArray(filtered[k])) return k;
      }
      return null;
    }
    function norm(s) {
      if (s == null) return '';
      return String(s).trim().toLowerCase().replace(/[-_]/g, ' ');
    }
    const stakeKey = pick(['stake', 'stakes', 'mise', 'amount', 'bet_amount']);
    const oddsKey = pick(['odds', 'cote', 'decimal_odds']);
    const resKey = pick(['result', 'status', 'settlement']);
    if (!stakeKey || !oddsKey || !resKey)
      throw new Error(
        'Champs stake/odds/result introuvables dans le document filtré.',
      );
    const n = Math.min(
      filtered[stakeKey].length,
      filtered[oddsKey].length,
      filtered[resKey].length,
    );
    const pnl: (number | null)[] = [];
    let settled_count = 0,
      settled_stake_sum = 0,
      total_profit = 0;
    for (let i = 0; i < n; i++) {
      const stakePct = filtered[stakeKey][i];
      let odds = filtered[oddsKey][i];
      const rs = norm(filtered[resKey][i]);
      if (
        stakePct == null ||
        odds == null ||
        !isFinite(+stakePct) ||
        !isFinite(+odds)
      ) {
        pnl.push(null);
        continue;
      }
      const stake = (+bankroll_reference * +stakePct) / 100;
      odds = +odds;
      let val = 0,
        settled = false;
      if (rs === 'win') {
        val = stake * (odds - 1);
        settled = true;
      } else if (rs === 'lose') {
        val = -stake;
        settled = true;
      } else if (rs === 'void') {
        val = 0;
        settled = true;
      } else if (rs === 'half win' || rs === 'halfwin') {
        val = (stake * (odds - 1)) / 2;
        settled = true;
      } else if (rs === 'half lose' || rs === 'halflose') {
        val = -stake / 2;
        settled = true;
      } else if (rs === 'pending') {
        val = 0;
        settled = false;
      } else {
        val = 0;
        settled = false;
      }
      pnl.push(val);
      if (settled && rs !== 'pending') {
        settled_count += 1;
        settled_stake_sum += stake;
        total_profit += val;
      }
    }
    return {
      pnl: pnl,
      settled_count: settled_count,
      settled_stake_sum: settled_stake_sum,
      total_profit: total_profit,
    };
  }

  function sortRowsDesc(rows) {
    function keyOf(row) {
      let d: Date | null = null;
      if (Object.prototype.hasOwnProperty.call(row, date_field))
        d = toDate(row[date_field]);
      if (!d && Object.prototype.hasOwnProperty.call(row, 'created_at'))
        d = toDate(row.created_at);
      if (d) return d.getTime();
      return row.idx != null ? row.idx : -Infinity;
    }
    rows.sort(function (a, b) {
      return keyOf(b) - keyOf(a);
    });
    return rows;
  }

  const client = new MongoClient(mongoUri, { maxPoolSize: 5 });
  await client.connect();
  try {
    const bilanCol = client.db('Bilan').collection('bilan');
    const q: Record<string, unknown> = {};
    q[summary_flag_key] = true;
    if (userId != null) q.user_id = userId;
    const src = await bilanCol
      .find(q)
      .sort({ generated_at: -1, created_at: -1 })
      .limit(1)
      .next();
    if (!src)
      throw new Error('Aucun document __summary__ trouvé dans Bilan.bilan');
    const source_id = src._id;

    const refColName = 'user_' + String(collection);
    const refDoc = await client
      .db('Client_Data')
      .collection(refColName)
      .findOne({});
    const bankroll_reference =
      refDoc && typeof refDoc.bankroll_reference === 'number'
        ? refDoc.bankroll_reference
        : 100;

    let filtered_doc = filterBetsDoc(src, 'doc');
    filtered_doc = dedupeFirstByMatchAndDate(filtered_doc); // <-- garder uniquement le 1er pari par (match, date)
    const rows = (function makeRowsFromFiltered(doc) {
      const list_fields: string[] = [];
      for (const k in doc)
        if (
          Object.prototype.hasOwnProperty.call(doc, k) &&
          Array.isArray(doc[k])
        )
          list_fields.push(k);
      let n = Infinity;
      for (let i = 0; i < list_fields.length; i++)
        if (doc[list_fields[i]].length < n) n = doc[list_fields[i]].length;
      const out: { idx: number; [key: string]: unknown }[] = [];
      for (let i = 0; i < n; i++) {
        const row = { idx: i };
        for (let j = 0; j < list_fields.length; j++)
          row[list_fields[j]] = doc[list_fields[j]][i];
        out.push(row);
      }
      return out;
    })(filtered_doc);

    const pnlRes = computePnL(filtered_doc, bankroll_reference);
    (filtered_doc as Record<string, unknown>).pnl = pnlRes.pnl;
    (filtered_doc as Record<string, unknown>).settled_count =
      pnlRes.settled_count;
    (filtered_doc as Record<string, unknown>).settled_stake_sum =
      pnlRes.settled_stake_sum;
    (filtered_doc as Record<string, unknown>).total_profit =
      pnlRes.total_profit;
    (filtered_doc as Record<string, unknown>).bankroll_reference =
      bankroll_reference;
    const roi =
      pnlRes.settled_stake_sum > 0
        ? (pnlRes.total_profit / pnlRes.settled_stake_sum) * 100
        : 0;
    (filtered_doc as Record<string, unknown>).roi = roi;
    (filtered_doc as Record<string, unknown>).source_id = source_id;
    (filtered_doc as Record<string, unknown>).filtered_at = new Date();

    for (let i = 0; i < rows.length; i++)
      rows[i].pnl =
        i < pnlRes.pnl.length && isFinite(pnlRes.pnl[i] as number)
          ? (pnlRes.pnl[i] as number)
          : null;
    sortRowsDesc(rows);

    const total_rows = rows.length;
    const page_count = Math.max(1, Math.ceil(total_rows / page_size));
    const p = Math.min(Math.max(1, parseInt(page_number, 10) || 1), page_count);
    const start = (p - 1) * page_size;
    const end = Math.min(start + page_size, total_rows);
    const page_rows = rows.slice(start, end);

    if (writeBack) {
      const payload: Record<string, unknown> = {};
      for (const key in filtered_doc)
        if (Object.prototype.hasOwnProperty.call(filtered_doc, key))
          payload[key] = filtered_doc[key];
      payload._id = out_id;
      payload[summary_flag_key] = 'filtered';
      await bilanCol.replaceOne({ _id: out_id }, payload, { upsert: true });
    }

    return {
      page_rows: page_rows,
      page_number: p,
      page_size: page_size,
      page_count: page_count,
      total_rows: total_rows,
      metrics: {
        total_profit: pnlRes.total_profit,
        settled_count: pnlRes.settled_count,
        settled_stake_sum: pnlRes.settled_stake_sum,
        roi: roi,
      },
      bankroll_reference: bankroll_reference,
      filters: (filtered_doc as Record<string, unknown>).applied_filters,
      source_id: source_id,
    };
  } finally {
    await client.close();
  }
}
