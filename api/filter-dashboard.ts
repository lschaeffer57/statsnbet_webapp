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

  const collection = getStringValue(req.query.collection) || 'userhistory';

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

  const date_min = getStringValue(req.query.date_min) || null;
  const date_max = getStringValue(req.query.date_max) || null;

  try {
    const result = await runFilterForUser({
      mongoUri: process.env.MONGODB_URI,
      dbName: 'userhistory',
      collection,
      userId,
      liquidity_min,
      payout_min,
      ev_min,
      sports,
      bookmakers,
      date_min,
      date_max,
      date_field: 'date',
      return_rows: true,
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
    dbName,
    collection,
    userId = null,
    liquidity_min = null,
    payout_min = null,
    ev_min = null,
    sports = null,
    bookmakers = null,
    date_min = null,
    date_max = null,
    date_field = 'date',
    return_rows = true,
    writeBack = false,
    out_id = '__summary__:filtered',
    summary_flag_key = '__summary__',
  } = options;

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
      throw new Error('Format de date non reconnu: ' + JSON.stringify(obj));
    }
    throw new Error('Type de date non supporté: ' + typeof obj);
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
    for (const k in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, k) && Array.isArray(doc[k]))
        list_fields.push(k);
    }
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
    let dmin: Date | null = null,
      dmax: Date | null = null;
    if (date_min != null || date_max != null) {
      if (!Array.isArray(doc[date_field]))
        throw new Error(
          "Filtre date demandé mais champ '" +
            date_field +
            "' absent ou non-list.",
        );
      dmin = date_min != null ? toDate(date_min) : null;
      dmax = date_max != null ? toDate(date_max) : null;
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
        // eslint-disable-next-line no-var
        var dv;
        try {
          dv = toDate(raw);
        } catch {
          continue;
        }
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
        for (const k2 in out) {
          if (Array.isArray(out[k2]) && (out[k2] as unknown[]).length > maxLen)
            maxLen = (out[k2] as unknown[]).length;
        }
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

  function computePnL(filtered) {
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
      let stake = filtered[stakeKey][i];
      let odds = filtered[oddsKey][i];
      const rs = norm(filtered[resKey][i]);
      if (
        stake == null ||
        odds == null ||
        !isFinite(+stake) ||
        !isFinite(+odds)
      ) {
        pnl.push(null);
        continue;
      }
      stake = +stake;
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

  const client = new MongoClient(mongoUri, { maxPoolSize: 5 });
  await client.connect();
  try {
    const db = client.db(dbName);
    const col = db.collection(collection);
    const q: Record<string, unknown> = {};
    q[summary_flag_key] = true;
    if (userId != null) q.user_id = userId;
    const cursor = col
      .find(q)
      .sort({ generated_at: -1, created_at: -1 })
      .limit(1);
    const src = await cursor.next();
    if (!src)
      throw new Error(
        'Aucun document ' +
          summary_flag_key +
          '=True trouvé dans ' +
          dbName +
          '.' +
          collection +
          ' (user_id=' +
          (userId == null ? 'ANY' : userId) +
          ')',
      );
    const source_id = src._id;
    const filtered_doc = filterBetsDoc(src, 'doc') as Record<string, unknown>;
    const rows = return_rows
      ? (filterBetsDoc(src, 'rows') as Record<string, unknown>[])
      : null;
    const pnlRes = computePnL(filtered_doc);
    filtered_doc.pnl = pnlRes.pnl;
    filtered_doc.settled_count = pnlRes.settled_count;
    filtered_doc.settled_stake_sum = pnlRes.settled_stake_sum;
    filtered_doc.total_profit = pnlRes.total_profit;
    filtered_doc.source_id = source_id;
    filtered_doc.filtered_at = new Date();
    if (rows) {
      for (let i = 0; i < rows.length; i++) {
        rows[i].pnl =
          i < pnlRes.pnl.length && isFinite(pnlRes.pnl[i] as number)
            ? (pnlRes.pnl[i] as number)
            : null;
      }
    }
    if (writeBack) {
      const payload: Record<string, unknown> = {};
      for (const key in filtered_doc)
        if (Object.prototype.hasOwnProperty.call(filtered_doc, key))
          payload[key] = filtered_doc[key];
      payload._id = out_id;
      payload[summary_flag_key] = 'filtered';
      await col.replaceOne({ _id: out_id }, payload, { upsert: true });
    }
    const result = {
      filtered_doc: filtered_doc,
      metrics: {
        total_profit: pnlRes.total_profit,
        settled_count: pnlRes.settled_count,
        settled_stake_sum: pnlRes.settled_stake_sum,
      },
      source_id: source_id,
      bets: null as unknown as Record<string, unknown>[],
    };
    if (rows) result.bets = rows;
    return result;
  } finally {
    await client.close();
  }
}
