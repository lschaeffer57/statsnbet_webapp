import { MongoClient } from 'mongodb';

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
      function tryParse(str, fmt) {
        var rx;
        if (fmt === 'YYYY-MM-DD') rx = /^(\d{4})-(\d{2})-(\d{2})$/;
        else if (fmt === 'DD/MM/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        else if (fmt === 'DD-MM-YYYY') rx = /^(\d{2})-(\d{2})-(\d{4})$/;
        else if (fmt === 'MM/DD/YYYY') rx = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        var m = rx.exec(str);
        if (!m) return null;
        var y, mo, d;
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
        var dt = new Date(y, mo - 1, d);
        if (
          dt.getFullYear() === y &&
          dt.getMonth() === mo - 1 &&
          dt.getDate() === d
        )
          return dt;
        return null;
      }
      var fmts = ['YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY'];
      for (var i = 0; i < fmts.length; i++) {
        var d = tryParse(obj, fmts[i]);
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
    var list_fields = [];
    for (var k in doc) {
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
    var sportsSet = null;
    if (Array.isArray(sports) && sports.length) {
      sportsSet = {};
      for (var si = 0; si < sports.length; si++)
        sportsSet[String(sports[si]).toLowerCase()] = true;
    }
    var bookSet = null;
    if (Array.isArray(bookmakers) && bookmakers.length) {
      if (!Array.isArray(doc.bookmaker))
        throw new Error(
          "Filtre bookmakers demandé mais champ 'bookmaker' absent ou non-list.",
        );
      bookSet = {};
      for (var bi = 0; bi < bookmakers.length; bi++)
        bookSet[String(bookmakers[bi]).toLowerCase()] = true;
    }
    var dmin = null,
      dmax = null;
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
    var n = Infinity;
    for (var lf = 0; lf < list_fields.length; lf++) {
      var arr = doc[list_fields[lf]];
      if (arr.length < n) n = arr.length;
    }
    var keep = [];
    for (var i = 0; i < n; i++) {
      var liq = doc.liquidity[i];
      var pay = doc.payout_rate[i];
      if (liq == null || pay == null) continue;
      if (+liq < liquidity_min || +pay < payout_min) continue;
      if (ev_min != null) {
        var evVal = doc.ev[i];
        if (evVal == null || +evVal < ev_min) continue;
      }
      if (sportsSet) {
        var sArr = safeGetArray(doc, 'sport');
        var sval = sArr && i < sArr.length ? sArr[i] : '';
        sval = String(sval).toLowerCase();
        if (!sportsSet[sval]) continue;
      }
      if (bookSet) {
        var bArr = safeGetArray(doc, 'bookmaker');
        var bval = bArr && i < bArr.length ? bArr[i] : '';
        bval = String(bval).toLowerCase();
        if (!bookSet[bval]) continue;
      }
      if (dmin || dmax) {
        var raw = doc[date_field][i];
        var dv;
        try {
          dv = toDate(raw);
        } catch (e) {
          continue;
        }
        if (dmin && dv < dmin) continue;
        if (dmax && dv > dmax) continue;
      }
      keep.push(i);
    }
    if (return_format === 'rows') {
      var rows = [];
      for (var r = 0; r < keep.length; r++) {
        var idx = keep[r];
        var row = { idx: idx };
        for (var lf2 = 0; lf2 < list_fields.length; lf2++) {
          var key = list_fields[lf2];
          if (doc[key].length > idx) row[key] = doc[key][idx];
        }
        rows.push(row);
      }
      return rows;
    }
    var out = {};
    for (var key2 in doc) {
      if (!Object.prototype.hasOwnProperty.call(doc, key2)) continue;
      var v2 = doc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (var lf3 = 0; lf3 < list_fields.length; lf3++) {
      var key3 = list_fields[lf3];
      var a3 = [];
      for (var j = 0; j < keep.length; j++) a3.push(doc[key3][keep[j]]);
      out[key3] = a3;
    }
    if (typeof out.counts === 'object' && out.counts) {
      for (var ck in out.counts) {
        if (
          Object.prototype.hasOwnProperty.call(out.counts, ck) &&
          ck.slice(-6) === '_count'
        ) {
          var field = ck.slice(0, -6);
          if (Array.isArray(out[field])) out.counts[ck] = out[field].length;
        }
      }
      if (Object.prototype.hasOwnProperty.call(out, 'total_rows')) {
        var maxLen = 0;
        for (var k2 in out) {
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
    return out;
  }

  function computePnL(filtered) {
    function pick(cands) {
      for (var i = 0; i < cands.length; i++) {
        var k = cands[i];
        if (Array.isArray(filtered[k])) return k;
      }
      return null;
    }
    function norm(s) {
      if (s == null) return '';
      return String(s).trim().toLowerCase().replace(/[-_]/g, ' ');
    }
    var stakeKey = pick(['stake', 'stakes', 'mise', 'amount', 'bet_amount']);
    var oddsKey = pick(['odds', 'cote', 'decimal_odds']);
    var resKey = pick(['result', 'status', 'settlement']);
    if (!stakeKey || !oddsKey || !resKey)
      throw new Error(
        'Champs stake/odds/result introuvables dans le document filtré.',
      );
    var n = Math.min(
      filtered[stakeKey].length,
      filtered[oddsKey].length,
      filtered[resKey].length,
    );
    var pnl = [];
    var settled_count = 0,
      settled_stake_sum = 0,
      total_profit = 0;
    for (var i = 0; i < n; i++) {
      var stake = filtered[stakeKey][i];
      var odds = filtered[oddsKey][i];
      var rs = norm(filtered[resKey][i]);
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
      var val = 0,
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

  var client = new MongoClient(mongoUri, { maxPoolSize: 5 });
  await client.connect();
  try {
    var db = client.db(dbName);
    var col = db.collection(collection);
    var q = {};
    q[summary_flag_key] = true;
    if (userId != null) q.user_id = userId;
    var cursor = col
      .find(q)
      .sort({ generated_at: -1, created_at: -1 })
      .limit(1);
    var src = await cursor.next();
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
    var source_id = src._id;
    var filtered_doc = filterBetsDoc(src, 'doc');
    var rows = return_rows ? filterBetsDoc(src, 'rows') : null;
    var pnlRes = computePnL(filtered_doc);
    filtered_doc.pnl = pnlRes.pnl;
    filtered_doc.settled_count = pnlRes.settled_count;
    filtered_doc.settled_stake_sum = pnlRes.settled_stake_sum;
    filtered_doc.total_profit = pnlRes.total_profit;
    filtered_doc.source_id = source_id;
    filtered_doc.filtered_at = new Date();
    if (rows) {
      for (var i = 0; i < rows.length; i++) {
        rows[i].pnl =
          i < pnlRes.pnl.length && isFinite(pnlRes.pnl[i])
            ? pnlRes.pnl[i]
            : null;
      }
    }
    if (writeBack) {
      var payload = {};
      for (var key in filtered_doc)
        if (Object.prototype.hasOwnProperty.call(filtered_doc, key))
          payload[key] = filtered_doc[key];
      payload._id = out_id;
      payload[summary_flag_key] = 'filtered';
      await col.replaceOne({ _id: out_id }, payload, { upsert: true });
    }
    var result = {
      filtered_doc: filtered_doc,
      metrics: {
        total_profit: pnlRes.total_profit,
        settled_count: pnlRes.settled_count,
        settled_stake_sum: pnlRes.settled_stake_sum,
      },
      source_id: source_id,
    };
    if (rows) result.bets = rows;
    return result;
  } finally {
    await client.close();
  }
}

(async function () {
  try {
    const out = await runFilterForUser({
      mongoUri:
        'mongodb+srv://monstre57:double_monstre@international-fr.xfbkc9i.mongodb.net/user_history',
      dbName: 'userhistory',
      collection: '2097730097',
      userId: null,
      liquidity_min: 2000,
      payout_min: 100,
      ev_min: 30,
      sports: ['football'],
      bookmakers: [],
      date_min: '09/10/2024',
      date_max: null,
      date_field: 'date',
      return_rows: true,
      writeBack: false,
    });
    console.log('BÉNÉFICE:', out.metrics.total_profit);
    console.log('NB PARIS HORS PENDING:', out.metrics.settled_count);
    console.log('SOMME MISES HORS PENDING:', out.metrics.settled_stake_sum);
    console.log('NOMBRE PARIS FILTRÉS:', out.filtered_doc.total_rows);
    console.log('APERÇU:', (out.bets || []).slice(0, 5));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
