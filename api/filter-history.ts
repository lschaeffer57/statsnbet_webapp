import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  if (!req.query.bankroll) {
    return res.status(400).json({ error: 'Bankroll is required' });
  }

  const getStringValue = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return value || '';
  };

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

  const bankrollStr = getStringValue(req.query.bankroll);
  const bankroll = Number(bankrollStr);

  try {
    const result = await runFilterForUser({
      mongoUri: process.env.MONGODB_URI,
      userId,
      liquidity_min,
      payout_min,
      ev_min,
      sports,
      bookmakers,
      bankroll,
      date_max,
      date_field: 'date',
      page_size,
      page_number,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

interface UserHistoryDocument {
  _id: any;
  bet: string[];
  bet_id: number[];
  bookmaker: string[];
  competition: string[];
  date: string[];
  ev: number[];
  liquidity: number[];
  match: string[];
  odds: string[];
  payout_rate: number[];
  sport: string[];
  stake: number[];
  status: string[];
  theorical_gain: number[];
  pnl?: number[];
  user_id?: string;
  counts?: Record<string, number>;
  total_rows?: number;
  generated_at?: Date;
  created_at?: Date;
  [key: string]: any;
}

interface FilteredDocument {
  [key: string]: any;
  liquidity: number[];
  payout_rate: number[];
  ev?: number[];
  sport?: string[];
  bookmaker?: string[];
  pnl: (number | null)[];
  settled_count: number;
  settled_stake_sum: number;
  total_profit: number;
  bankroll: number;
  roi: number;
  source_id: any;
  filtered_at: Date;
  total_rows: number;
  applied_filters: {
    liquidity_min: number | null;
    payout_min: number | null;
    ev_min: number | null;
    sports: string[] | null;
    bookmakers: string[] | null;
    date_min: string | null;
    date_max: string | null;
    date_field: string;
  };
  counts?: Record<string, number>;
}

interface BetRow {
  idx: number;
  pnl?: number | null;
  [key: string]: any;
}

interface FilterOptions {
  mongoUri: string;
  userId?: string | null;
  collection?: string | null;
  bankroll: number;
  liquidity_min?: number | null;
  payout_min?: number | null;
  ev_min?: number | null;
  sports?: string[] | null;
  bookmakers?: string[] | null;
  date_max?: string | null;
  date_field?: string;
  page_size?: number;
  page_number?: number;
}

interface PnLResult {
  pnl: (number | null)[];
  settled_count: number;
  settled_stake_sum: number;
  total_profit: number;
}

interface FilterResult {
  page_rows: BetRow[];
  pagination: {
    page_number: number;
    page_size: number;
    page_count: number;
    total_rows: number;
  };
  metrics: {
    total_profit: number;
    settled_count: number;
    settled_stake_sum: number;
    roi: number;
  };
  bankroll: number;
  filters: FilteredDocument['applied_filters'];
  source_id: any;
}

async function runFilterForUser(options: FilterOptions): Promise<FilterResult> {
  const {
    mongoUri,
    userId = null,
    bankroll,
    liquidity_min = null,
    payout_min = null,
    ev_min = null,
    sports = null,
    bookmakers = null,
    date_max = null,
    date_field = 'date',
    page_size = 20,
    page_number = 1,
  } = options;

  function sixMonthsAgo(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() - 6, d.getDate());
  }
  const enforced_date_min = sixMonthsAgo(new Date());

  function toDate(obj: string | Date | null | undefined): Date | null {
    if (obj == null) return null;
    if (obj instanceof Date)
      return new Date(obj.getFullYear(), obj.getMonth(), obj.getDate());
    if (typeof obj === 'string') {
      const tryParse = (str: string, fmt: string): Date | null => {
        let rx: RegExp;
        if (fmt === 'YYYY-MM-DD') rx = /^(\d{4})-(\d{2})-(\d{2})$/;
        else if (fmt === 'DD/MM/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        else if (fmt === 'DD-MM-YYYY') rx = /^(\d{2})-(\d{2})-(\d{4})$/;
        else if (fmt === 'MM/DD/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        else if (fmt === 'YYYY-MM-DD HH:mm:ss')
          rx = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;
        else if (fmt === 'YYYY-MM-DD HH:mm:ss.SSS')
          rx =
            /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})\.(\d{1,3})$/;
        else if (fmt === 'YYYY-MM-DDTHH:mm:ss.SSSZ')
          rx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{1,3})Z$/;
        else return null;

        const m = rx.exec(str);
        if (!m) return null;
        const y = +m[1],
          mo = +m[2],
          d = +m[3];
        const dt = new Date(y, mo - 1, d);
        if (
          dt.getFullYear() === y &&
          dt.getMonth() === mo - 1 &&
          dt.getDate() === d
        )
          return dt;
        return null;
      };
      const fmts = [
        'YYYY-MM-DD',
        'DD/MM/YYYY',
        'DD-MM-YYYY',
        'MM/DD/YYYY',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm:ss.SSS',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
      ];
      for (let i = 0; i < fmts.length; i++) {
        const d = tryParse(obj, fmts[i]);
        if (d) return d;
      }
      const t = Date.parse(obj);
      if (!isNaN(t)) {
        const nd = new Date(t);
        return new Date(nd.getFullYear(), nd.getMonth(), nd.getDate());
      }
      return null;
    }
    return null;
  }

  function safeGetArray(obj: Record<string, any>, key: string): any[] | null {
    return obj &&
      Object.prototype.hasOwnProperty.call(obj, key) &&
      Array.isArray(obj[key])
      ? obj[key]
      : null;
  }

  function filterBetsDoc(
    doc: UserHistoryDocument,
    return_format: 'doc' | 'rows',
  ): Record<string, any> | BetRow[] {
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
        const evVal = doc.ev![i];
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
      const rows: BetRow[] = [];
      for (let r = 0; r < keep.length; r++) {
        const idx = keep[r];
        const row: BetRow = { idx: idx };
        for (let lf2 = 0; lf2 < list_fields.length; lf2++) {
          const key = list_fields[lf2];
          if (doc[key].length > idx) row[key] = doc[key][idx];
        }
        rows.push(row);
      }
      return rows;
    }

    const out: Record<string, any> = {};
    for (const key2 in doc) {
      if (!Object.prototype.hasOwnProperty.call(doc, key2)) continue;
      const v2 = doc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (let lf3 = 0; lf3 < list_fields.length; lf3++) {
      const key3 = list_fields[lf3];
      const a3: any[] = [];
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
          if (Array.isArray(out[field])) out.counts[ck] = out[field].length;
        }
      }
      if (Object.prototype.hasOwnProperty.call(out, 'total_rows')) {
        let maxLen = 0;
        for (const k2 in out)
          if (Array.isArray(out[k2]) && out[k2].length > maxLen)
            maxLen = out[k2].length;
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

  function dedupeFirstByMatchAndDate(
    filteredDoc: Record<string, any>,
  ): Record<string, any> {
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

    const seen: Record<string, boolean> = {};
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

    const out: Record<string, any> = {};
    for (const key2 in filteredDoc) {
      if (!Object.prototype.hasOwnProperty.call(filteredDoc, key2)) continue;
      const v2 = filteredDoc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (let lf2 = 0; lf2 < list_fields.length; lf2++) {
      const key3 = list_fields[lf2];
      const a3: any[] = [];
      for (let j = 0; j < keepIdx.length; j++)
        a3.push(filteredDoc[key3][keepIdx[j]]);
      out[key3] = a3;
    }
    out.total_rows = keepIdx.length;
    return out;
  }

  function computePnL(
    filtered: Record<string, any>,
    bankroll_value: number,
  ): PnLResult {
    function pick(cands: string[]): string | null {
      for (let i = 0; i < cands.length; i++) {
        const k = cands[i];
        if (Array.isArray(filtered[k])) return k;
      }
      return null;
    }
    function norm(s: any): string {
      if (s == null) return '';
      return String(s).trim().toLowerCase().replace(/[-_]/g, ' ');
    }
    const stakeKey = pick([
      'stake',
      'stakes',
      'mise',
      'amount_pct',
      'bet_amount_pct',
      'kelly_pct',
    ]);
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
      const stake = (+bankroll_value * +stakePct) / 100;
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

  function sortRowsDesc(rows: BetRow[]): BetRow[] {
    function keyOf(row: BetRow): number {
      let d: Date | null = null;
      if (Object.prototype.hasOwnProperty.call(row, date_field))
        d = toDate(row[date_field]);
      if (!d && Object.prototype.hasOwnProperty.call(row, 'created_at'))
        d = toDate(row['created_at']);
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
    const bilanCol = client
      .db('Bilan')
      .collection<UserHistoryDocument>('bilan');
    const q: Record<string, any> = {};
    if (userId != null) q.user_id = userId;
    const src = await bilanCol
      .find(q)
      .sort({ generated_at: -1, created_at: -1, _id: -1 })
      .limit(1)
      .next();
    if (!src) throw new Error('Aucun document trouvé dans Bilan.bilan');
    const source_id = src._id;

    let filtered_doc = filterBetsDoc(src, 'doc') as Record<string, any>;
    filtered_doc = dedupeFirstByMatchAndDate(filtered_doc);

    const rows = (function makeRowsFromFiltered(
      doc: Record<string, any>,
    ): BetRow[] {
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
      const out: BetRow[] = [];
      for (let i = 0; i < n; i++) {
        const row: BetRow = { idx: i };
        for (let j = 0; j < list_fields.length; j++)
          row[list_fields[j]] = doc[list_fields[j]][i];
        out.push(row);
      }
      return out;
    })(filtered_doc);

    const pnlRes = computePnL(filtered_doc, bankroll);
    filtered_doc.pnl = pnlRes.pnl;
    filtered_doc.settled_count = pnlRes.settled_count;
    filtered_doc.settled_stake_sum = pnlRes.settled_stake_sum;
    filtered_doc.total_profit = pnlRes.total_profit;
    filtered_doc.bankroll = bankroll;
    const roi =
      pnlRes.settled_stake_sum > 0
        ? (pnlRes.total_profit / pnlRes.settled_stake_sum) * 100
        : 0;
    filtered_doc.roi = roi;
    filtered_doc.source_id = source_id;
    filtered_doc.filtered_at = new Date();

    for (let i = 0; i < rows.length; i++)
      rows[i].pnl =
        i < pnlRes.pnl.length &&
        pnlRes.pnl[i] !== null &&
        isFinite(pnlRes.pnl[i]!)
          ? pnlRes.pnl[i]
          : null;
    sortRowsDesc(rows);

    const total_rows = rows.length;
    const page_count = Math.max(1, Math.ceil(total_rows / page_size));
    const p = Math.min(
      Math.max(1, parseInt(String(page_number), 10) || 1),
      page_count,
    );
    const start = (p - 1) * page_size;
    const end = Math.min(start + page_size, total_rows);
    const page_rows = rows.slice(start, end);

    return {
      page_rows: page_rows,
      pagination: {
        page_number: p,
        page_size: page_size,
        page_count: page_count,
        total_rows: total_rows,
      },
      metrics: {
        total_profit: pnlRes.total_profit,
        settled_count: pnlRes.settled_count,
        settled_stake_sum: pnlRes.settled_stake_sum,
        roi: roi,
      },
      bankroll: bankroll,
      filters: filtered_doc.applied_filters,
      source_id: source_id,
    };
  } finally {
    await client.close();
  }
}
