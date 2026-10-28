// v1.69 職業類別：輸入職業查類別、D／拒保擋商品
// 資料：data/occupation_class.csv（欄位 code,category,subcategory,job,class,note；換新版職業分類表只要覆蓋此檔）
// 來源：通則_職業分類表_DIU專用_1140328.xlsx 封面「職類【D】者，即為傷害險不承保之工作性質」「壽險或傷害險不承保之職業，醫療險亦不承保」
//       通則_投保規定_1150930.pdf 貳(十)「被保險人職業或職務拒保之範圍…非屬承保範圍，歉難承保」
window.OCC = (() => {
  const SRC = 'data/occupation_class.csv?v=1';
  // 通則(十) 14 項拒保職務（[職業分類, 工作性質]）
  const REJ = [
    ['礦業採石業_海上礦業採石作業','海上作業潛水人員'],['礦業採石業_砂石開採業','採石爆破人員'],
    ['建築工程業_造修船業','船體切割人員(海上)'],['建築工程業_海事工程','潛水工作人員(潛水工程人員)'],
    ['建築工程業_爆破工程','爆破工作人員(爆破工程人員)'],['製造業_水泥業','爆破工'],
    ['製造業_化學原料業','硫酸、鹽酸、硝酸製造工、有毒物品製造工'],['娛樂業_電影業、電視業','特技演員'],
    ['一般商業_軍火買賣','軍火商'],['娛樂業_特種營業','保鑣'],['公共事業_電信及電力','電力高壓電工程設施人員'],
    ['服務業_職業潛水夫','職業潛水夫'],['治安人員_警政相關','防爆小組'],['軍人_軍人','武器或彈藥製造人員']];
  // 投保規則載明「壽險或傷害險不承保之職業，本險種亦不承保」者（各商品最新投保規則 pdftotext 比對）
  const CLAUSE = new Set('SDP SDG SDH SDN SDJ SDKA SDKB SWB5 SWD1 SWW XDZ FDC SIE SWI AJC1 AJI AJJ HJK HKR5 HLR2 SJR1 HSV HSY HTA SWZ UCR LTU ADH ADM ADN FDE FDF FDG WPH WP WPA WPF1 HAC HIY1 HIZ HJA4 HJB3 HJD HJE HJH HJI HJJ HJL HJM HSZ HTB LTP LTQ LTT LTV XDN2 XDP XDV XDW XDX'.split(' '));
  const ACC = new Set('ADG ADH ADM ADN TMR AJC1 AJI AJJ AJK ALA MPA MPB'.split(' '));
  let rows = [];
  const norm = s => (s||'').replace(/[\s、，,．.]/g,'').replace(/（/g,'(').replace(/）/g,')').replace(/鏢/g,'鑣').toLowerCase();
  const REJJ = REJ.flatMap(([c, j]) => [j, ...j.split('、')].flatMap(x => [x, x.replace(/[(（].*[)）]/,'')]).map(x => [c.split('_')[0], norm(x)]));
  const isRej = r => REJJ.some(([c, j]) => r.cat.startsWith(c.slice(0,2)) && (norm(r.job) === j));
  function parse(t){
    const L = t.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean), H = L.shift().split(',');
    const ix = n => H.indexOf(n);
    return L.map(l => { const c = l.split(','); return {code:c[ix('code')], cat:(c[ix('category')]||'').replace(/^\d+\s*/,''), sub:(c[ix('subcategory')]||'').replace(/^\d+\s*/,''), job:c[ix('job')], cls:(c[ix('class')]||'').trim(), note:c.slice(ix('note')).join(',').trim()}; });
  }
  const ready = fetch(SRC).then(r => r.text()).then(t => {
    rows = parse(t);
    rows.forEach(r => { if (isRej(r)) r.rej = 1; });
    REJ.forEach(([c, j]) => rows.some(r => r.rej && norm(j).includes(norm(r.job))) || rows.push({code:'', cat:c.split('_')[0], sub:c.split('_')[1], job:j, cls:'X', rej:1, note:'通則拒保職業'}));
  }).catch(() => {});
  function score(r, q){
    const j = norm(r.job), s = norm(r.sub + r.cat);
    if (j === q) return 100; if (j.startsWith(q)) return 90; if (j.includes(q)) return 80;
    let i = 0, hit = 0; for (const ch of j){ if (ch === q[i]){ i++; hit++; } } if (i === q.length) return 60 - j.length/10;
    if (s.includes(q)) return 40;
    const qs = [...q].filter(ch => j.includes(ch)).length; return qs >= Math.max(2, q.length*0.7) ? 20 + qs : 0;
  }
  function search(q, n=8){ q = norm(q); if (!q) return []; return rows.map(r => [score(r, q), r]).filter(x => x[0] > 0).sort((a,b) => b[0]-a[0]).slice(0, n).map(x => x[1]); }
  const typeOf = r => r.rej ? 'X' : r.cls === 'D' ? 'D' : '';
  // t：'' | 'D' | 'X'
  function block(code, cat, t){
    if (t === 'X') return {ok:false, why:'拒保職業'};
    if (t !== 'D') return null;
    code = String(code||'').replace(/@.*/,'');
    if (ACC.has(code) || /傷害/.test(cat||'')) return {ok:false, why:'D 類：傷害險不承保'};
    if (/醫療|實支/.test(cat||'')) return {ok:false, why:'D 類：醫療險不承保'};
    if (CLAUSE.has(code)) return {ok:false, why:'D 類：本險種不承保'};
    return null;
  }
  return {ready, search, typeOf, block, rows:() => rows};
})();
