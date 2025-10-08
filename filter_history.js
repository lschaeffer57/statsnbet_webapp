import { MongoClient } from 'mongodb';

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
    var list_fields = [];
    for (var k in doc)
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

    var dmin = enforced_date_min;
    var dmax = date_max != null ? toDate(date_max) : null;
    if ((dmin || dmax) && !Array.isArray(doc[date_field])) {
      throw new Error(
        "Filtre date demandé mais champ '" +
          date_field +
          "' absent ou non-list.",
      );
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
      if (liquidity_min != null && +liq < liquidity_min) continue;
      if (payout_min != null && +pay < payout_min) continue;

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
        var dv = toDate(raw);
        if (!dv) continue;
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
        for (var k2 in out)
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

  function dedupeFirstByMatchAndDate(filteredDoc) {
    var list_fields = [];
    for (var k in filteredDoc)
      if (
        Object.prototype.hasOwnProperty.call(filteredDoc, k) &&
        Array.isArray(filteredDoc[k])
      )
        list_fields.push(k);
    var matchKey = null;
    var candidates = ['match', 'event', 'fixture', 'game'];
    for (var i = 0; i < candidates.length; i++) {
      if (Array.isArray(filteredDoc[candidates[i]])) {
        matchKey = candidates[i];
        break;
      }
    }
    if (!matchKey || !Array.isArray(filteredDoc[date_field]))
      return filteredDoc;

    var n = Infinity;
    for (var lf = 0; lf < list_fields.length; lf++) {
      var arr = filteredDoc[list_fields[lf]];
      if (arr.length < n) n = arr.length;
    }

    var seen = {};
    var keepIdx = [];
    for (var i = 0; i < n; i++) {
      var m = filteredDoc[matchKey][i];
      var d = toDate(filteredDoc[date_field][i]);
      var dkey = d
        ? d.getFullYear() +
          '-' +
          String(d.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(d.getDate()).padStart(2, '0')
        : 'NA';
      var key = String(m).toLowerCase() + '||' + dkey;
      if (!Object.prototype.hasOwnProperty.call(seen, key)) {
        seen[key] = true;
        keepIdx.push(i);
      }
    }

    var out = {};
    for (var key2 in filteredDoc) {
      if (!Object.prototype.hasOwnProperty.call(filteredDoc, key2)) continue;
      var v2 = filteredDoc[key2];
      if (!Array.isArray(v2)) out[key2] = v2;
    }
    for (var lf2 = 0; lf2 < list_fields.length; lf2++) {
      var key3 = list_fields[lf2];
      var a3 = [];
      for (var j = 0; j < keepIdx.length; j++)
        a3.push(filteredDoc[key3][keepIdx[j]]);
      out[key3] = a3;
    }
    out.total_rows = keepIdx.length;
    return out;
  }

  function computePnL(filtered, bankroll_reference) {
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
      var stakePct = filtered[stakeKey][i];
      var odds = filtered[oddsKey][i];
      var rs = norm(filtered[resKey][i]);
      if (
        stakePct == null ||
        odds == null ||
        !isFinite(+stakePct) ||
        !isFinite(+odds)
      ) {
        pnl.push(null);
        continue;
      }
      var stake = (+bankroll_reference * +stakePct) / 100;
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

  function sortRowsDesc(rows) {
    function keyOf(row) {
      var d = null;
      if (row.hasOwnProperty(date_field)) d = toDate(row[date_field]);
      if (!d && row.hasOwnProperty('created_at')) d = toDate(row['created_at']);
      if (d) return d.getTime();
      return row.idx != null ? row.idx : -Infinity;
    }
    rows.sort(function (a, b) {
      return keyOf(b) - keyOf(a);
    });
    return rows;
  }

  var client = new MongoClient(mongoUri, { maxPoolSize: 5 });
  await client.connect();
  try {
    var bilanCol = client.db('Bilan').collection('bilan');
    var q = {};
    q[summary_flag_key] = true;
    if (userId != null) q.user_id = userId;
    var src = await bilanCol
      .find(q)
      .sort({ generated_at: -1, created_at: -1 })
      .limit(1)
      .next();
    if (!src)
      throw new Error('Aucun document __summary__ trouvé dans Bilan.bilan');
    var source_id = src._id;

    var refColName = 'user_' + String(collection);
    var refDoc = await client
      .db('Client_Data')
      .collection(refColName)
      .findOne({});
    var bankroll_reference =
      refDoc && typeof refDoc.bankroll_reference === 'number'
        ? refDoc.bankroll_reference
        : 100;

    var filtered_doc = filterBetsDoc(src, 'doc');
    filtered_doc = dedupeFirstByMatchAndDate(filtered_doc); // <-- garder uniquement le 1er pari par (match, date)
    var rows = (function makeRowsFromFiltered(doc) {
      var list_fields = [];
      for (var k in doc)
        if (
          Object.prototype.hasOwnProperty.call(doc, k) &&
          Array.isArray(doc[k])
        )
          list_fields.push(k);
      var n = Infinity;
      for (var i = 0; i < list_fields.length; i++)
        if (doc[list_fields[i]].length < n) n = doc[list_fields[i]].length;
      var out = [];
      for (var i = 0; i < n; i++) {
        var row = { idx: i };
        for (var j = 0; j < list_fields.length; j++)
          row[list_fields[j]] = doc[list_fields[j]][i];
        out.push(row);
      }
      return out;
    })(filtered_doc);

    var pnlRes = computePnL(filtered_doc, bankroll_reference);
    filtered_doc.pnl = pnlRes.pnl;
    filtered_doc.settled_count = pnlRes.settled_count;
    filtered_doc.settled_stake_sum = pnlRes.settled_stake_sum;
    filtered_doc.total_profit = pnlRes.total_profit;
    filtered_doc.bankroll_reference = bankroll_reference;
    var roi =
      pnlRes.settled_stake_sum > 0
        ? (pnlRes.total_profit / pnlRes.settled_stake_sum) * 100
        : 0;
    filtered_doc.roi = roi;
    filtered_doc.source_id = source_id;
    filtered_doc.filtered_at = new Date();

    for (var i = 0; i < rows.length; i++)
      rows[i].pnl =
        i < pnlRes.pnl.length && isFinite(pnlRes.pnl[i]) ? pnlRes.pnl[i] : null;
    sortRowsDesc(rows);

    var total_rows = rows.length;
    var page_count = Math.max(1, Math.ceil(total_rows / page_size));
    var p = Math.min(Math.max(1, parseInt(page_number, 10) || 1), page_count);
    var start = (p - 1) * page_size;
    var end = Math.min(start + page_size, total_rows);
    var page_rows = rows.slice(start, end);

    if (writeBack) {
      var payload = {};
      for (var key in filtered_doc)
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
      filters: filtered_doc.applied_filters,
      source_id: source_id,
    };
  } finally {
    await client.close();
  }
}

(async function () {
  try {
    const out = await runFilterForUser({
      mongoUri:
        'mongodb+srv://monstre57:double_monstre@international-fr.xfbkc9i.mongodb.net/user_history',
      collection: '2097730097',
      userId: null,
      liquidity_min: 2000,
      payout_min: 100,
      ev_min: 30,
      sports: ['football'],
      bookmakers: [],
      date_max: null,
      date_field: 'date',
      page_size: 20,
      page_number: 1,
    });
    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
