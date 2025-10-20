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
  dbName: string;
  collection: string;
  userId?: string | null;
  liquidity_min?: number | null;
  payout_min?: number | null;
  ev_min?: number | null;
  sports?: string[] | null;
  bookmakers?: string[] | null;
  date_min?: string | null;
  date_max?: string | null;
  date_field?: string;
  return_rows?: boolean;
  writeBack?: boolean;
}

interface FilterResult {
  filtered_doc: FilteredDocument;
  metrics: {
    total_profit: number;
    settled_count: number;
    settled_stake_sum: number;
    roi: number;
  };
  source_id: any;
  bets?: BetRow[];
}

interface PnLResult {
  pnl: (number | null)[];
  settled_count: number;
  settled_stake_sum: number;
  total_profit: number;
  roi: number;
}

async function runFilterForUser(options: FilterOptions): Promise<FilterResult> {
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
  } = options;

  function toDate(obj: string | Date | null | undefined): Date | null {
    if (obj == null) return null;
    if (obj instanceof Date)
      return new Date(obj.getFullYear(), obj.getMonth(), obj.getDate());
    if (typeof obj === 'string') {
      function tryParse(str: string, fmt: string): Date | null {
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
      }
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
      throw new Error('Format de date non reconnu: ' + JSON.stringify(obj));
    }
    throw new Error('Type de date non supporté: ' + typeof obj);
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
  ): FilteredDocument | BetRow[] {
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
      if (liquidity_min !== null && +liq < liquidity_min) continue;
      if (payout_min !== null && +pay < payout_min) continue;
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
        let dv: Date | null;
        try {
          dv = toDate(raw);
        } catch {
          continue;
        }
        if (dmin && dv && dv < dmin) continue;
        if (dmax && dv && dv > dmax) continue;
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
        for (const k2 in out) {
          if (Array.isArray(out[k2]) && out[k2].length > maxLen)
            maxLen = out[k2].length;
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
    return out as FilteredDocument;
  }

  function computePnL(filtered: FilteredDocument): PnLResult {
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
    const roi =
      settled_stake_sum > 0 ? (total_profit / settled_stake_sum) * 100 : 0;

    return {
      pnl: pnl,
      settled_count: settled_count,
      settled_stake_sum: settled_stake_sum,
      total_profit: total_profit,
      roi: roi,
    };
  }

  const client = new MongoClient(mongoUri, { maxPoolSize: 5 });
  await client.connect();
  try {
    const db = client.db(dbName);
    const col = db.collection<UserHistoryDocument>(collection);
    const q: Record<string, any> = {};
    if (userId != null) q.user_id = userId;
    const cursor = col
      .find(q)
      .sort({ generated_at: -1, created_at: -1, _id: -1 })
      .limit(1);
    const src = await cursor.next();
    if (!src)
      throw new Error(
        'Aucun document trouvé dans ' +
          dbName +
          '.' +
          collection +
          ' (user_id=' +
          (userId == null ? 'ANY' : userId) +
          ')',
      );
    const source_id = src._id;
    const filtered_doc = filterBetsDoc(src, 'doc') as FilteredDocument;
    const rows = return_rows ? (filterBetsDoc(src, 'rows') as BetRow[]) : null;
    const pnlRes = computePnL(filtered_doc);
    filtered_doc.pnl = pnlRes.pnl;
    filtered_doc.settled_count = pnlRes.settled_count;
    filtered_doc.settled_stake_sum = pnlRes.settled_stake_sum;
    filtered_doc.total_profit = pnlRes.total_profit;
    filtered_doc.roi = pnlRes.roi;
    filtered_doc.source_id = source_id;
    filtered_doc.filtered_at = new Date();
    if (rows) {
      for (let i = 0; i < rows.length; i++) {
        rows[i].pnl =
          i < pnlRes.pnl.length &&
          pnlRes.pnl[i] !== null &&
          isFinite(pnlRes.pnl[i]!)
            ? pnlRes.pnl[i]
            : null;
      }
    }
    const result: FilterResult = {
      filtered_doc: filtered_doc,
      metrics: {
        total_profit: pnlRes.total_profit,
        settled_count: pnlRes.settled_count,
        settled_stake_sum: pnlRes.settled_stake_sum,
        roi: pnlRes.roi,
      },
      source_id: source_id,
    };
    if (rows) result.bets = rows;
    return result;
  } finally {
    await client.close();
  }
}
