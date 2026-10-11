/* 富邦個人險快速報價 v1.8 — 計算引擎 + UI（純前端，無外部相依） */
(function(){
const P = window.PRODUCTS, RT = window.RATES;
const fmt = n => n==null ? '-' : Math.round(n).toLocaleString('zh-TW');
const pick = (tbl, age) => { for (const [up, v] of tbl) if (age <= up) return v; return null; };
const UNIT = {day:'元／日', wan:'萬元', unit:'單位'};

// ---------- 規則 ----------
function termsFor(p, age, plan){
  const t = (plan && plan.startsWith('HAD')) ? p.terms80 : p.terms;
  return Object.keys(t).map(Number).filter(k => age >= t[k][0] && age <= t[k][1]);
}
function eligible(p, age){
  if (p.plans) return termsFor(p, age, 'HAC1').length + termsFor(p, age, 'HAD1').length > 0;
  return termsFor(p, age).length > 0;
}
function ageRangeText(p){
  const f = t => Object.entries(t).map(([k,[a,b]]) => `${k==0?'躉繳':k==1?'一年期':k+'年期'} ${a}–${b}歲`).join('、');
  return p.plans ? `HAC(75歲啟動) ${f(p.terms)}；HAD(80歲啟動) ${f(p.terms80)}` : f(p.terms);
}
function limits(p, age, occ, hsv){
  // 回傳以「輸入單位」計的 [min, max, step]；day=元/日、wan=萬元、unit=單位
  if (p.unit === 'unit') return [1, 1, 1];
  if (p.fixed) { const v = pick(p.fixed.age, age); return [v, v, 1]; }
  let mn = typeof p.min === 'object' ? pick(p.min.age, age) : p.min;
  if (hsv && p.minHSV) mn = p.minHSV;   // XWS5：同時附加 HSV 系列住院附約時最低 5 萬
  let mx;
  const m = p.max;
  if (m.all != null) mx = m.all;
  else if (m.occ) mx = m.occ[occ-1];
  else if (m.age) mx = pick(m.age, age);
  else if (m.occage) mx = pick(m.occage, age)[occ-1];
  const step = p.unit === 'day' ? 100 : (p.step || 1);
  return [mn, mx, step];
}

// ---------- 計算（對齊建議書 OP 公式） ----------
// 原始年繳 = ROUND(保額單位數 × 費率, 1)；繳別保費 = ROUND(年繳 × 繳別係數, 0)；實繳 = ROUND(繳別保費 × (1 − 折扣), 0)
function quote(p, q){
  const errs = [];
  if (!eligible(p, q.age)) errs.push(`投保年齡不符：${ageRangeText(p)}`);
  const plan = p.plans ? q.plan : p.code;
  const terms = termsFor(p, q.age, plan);
  if (!terms.includes(q.term)) errs.push(`此年齡不可選 ${q.term} 年期（可選：${terms.map(t=>t==0?'躉繳':t+'年').join('、')||'無'}）`);
  const [mn, mx, step] = limits(p, q.age, q.occ, q.hsv);
  const S = q.sum;
  if (!(S >= mn - 1e-9)) errs.push(`保額低於最低 ${mn.toLocaleString()} ${UNIT[p.unit]}` + (p.minHSV && !q.hsv ? `（HSV 附約附加於本主約時可投保 ${p.minHSV} 萬）` : ''));
  else if (p.minHSV && q.hsv && S > p.minHSV + 1e-9 && S < p.min - 1e-9) errs.push(`附加 HSV 時可投保 ${p.minHSV} 萬整；超過 ${p.minHSV} 萬須達最低 ${p.min} 萬`);
  if (!(S <= mx + 1e-9)) errs.push(`保額超過上限 ${mx.toLocaleString()} ${UNIT[p.unit]}`);
  if (Math.abs(Math.round(S/step)*step - S) > 1e-6) errs.push(`保額需以 ${step} ${UNIT[p.unit]} 為單位`);
  if (errs.length) return {errs};
  const row = RT[p.code][`${plan}|${q.term}|${q.sex}`];
  const rate = row && row[1][q.age - row[0]];
  if (rate == null) return {errs:['查無費率（此組合不在費率表內）']};
  const units = p.unit === 'day' ? S/100 : S;
  const annual = Math.round(units * rate * 10 + 1e-7) / 10;
  const f = p.mf[q.mode] || 1;
  const modal = Math.round(annual * f + 1e-7);
  let bp = 0; const dl = [];
  if (q.payDisc && p.pay) { bp += p.pay*10000; dl.push(`繳費方式 ${p.pay*100}%`); }
  if (p.hi) for (const [th, r] of p.hi) if (S >= th) { bp += r*10000; dl.push(`高保額 ${r*100}%`); break; }
  bp = Math.min(bp, Math.round((p.cap||0)*10000));
  const paid = Math.round(modal * (10000 - bp) / 10000 + 1e-7);
  const n = {年繳:1,躉繳:1,半年繳:2,季繳:4,月繳:12}[q.mode];
  const firstYear = q.mode === '月繳' ? paid*12 : paid*n;  // 月繳首年實繳＝首期2個月＋續期10個月，首續期折扣相同時即 ×12
  const warn = p.warn && p.warn[`${q.term}|${q.sex}|${q.age}`];
  return {rate, units, annual, modal, paid, bp, dl, firstYear, n, warn};
}
// ---------- 常用優先排序：1 XWS5 → 2 OLA／OLA6 → 3 SDG → 4 男女癌（CLZ／CLX 男女平權皆列出；性別不符標示） ----------
const PRI = code => /^XWS5/.test(code) ? 1 : /^OLA/.test(code) ? 2 : code === 'SDG' ? 3 : (code === 'CLZ' || code === 'CLX') ? 4 : 99;
const FAV = code => PRI(code) <= 2;   // 標「常用」
// ---------- 主約／附約目錄（尚未收錄費率者：只做投保年齡／性別／職業篩選＋商品說明） ----------
const CAT = window.CATALOG || [];
const KIND = {main:'主約', rider:'附約', waiver:'豁免附約'};
function catElig(c, age, sex, occ, pAge){
  if (c.sex && c.sex !== sex) return {ok:false, why:c.sex===1?'男性專屬商品':'女性專屬商品'};
  if (c.occx && c.occx.includes(occ)) return {ok:false, why:`職業第 ${c.occx.join('、')} 類不可附加`};
  const par = c.ages.filter(x => x.who === 'parent');
  if (par.length){
    if ((pAge == null || pAge === '') && age + 15 > Math.max(...par.map(x=>x.b))) return {ok:false, why:`被保險人 ${age} 歲，父母（要保人）年齡必超過 ${Math.max(...par.map(x=>x.b))} 歲上限`};
    if (pAge == null || pAge === '') return {ok:'cond', why:`看要保人（父母）年齡 ${par.map(x=>x.a+'–'+x.b).join('、')} 歲`};
    const hit = par.some(x => pAge >= x.a && pAge <= x.b);
    return hit ? {ok:true, terms:[`要保人 ${pAge} 歲`]} : {ok:false, why:`要保人（父母）年齡需 ${par.map(x=>x.a+'–'+x.b).join('、')} 歲`};
  }
  const prim = c.ages.filter(x => !x.who);
  const hit = prim.filter(x => age >= x.a && age <= x.b);
  if (hit.length) return {ok:true, terms:hit.map(x=>x.t)};
  const kid = c.ages.filter(x => x.who === '子女' && age >= x.a && age <= x.b);
  if (kid.length) return {ok:true, terms:['以子女身分附加'], child:true};
  return {ok:false, why:'投保年齡 '+agesText(c)};
}
function agesText(c){ return c.ages.map(x => `${x.t} ${x.a}–${x.b}歲`).join('、'); }

// ---------- 主約 → 附約 可附加關係（依各附約投保規則「附加條件」整理；硬性擋下 ok:false，其餘以提醒 warn 呈現） ----------
function mInfo(code){
  const p = P.find(x => x.code === code);
  if (p) return {code, name:p.name, cat:p.cat, cover:p.cover, whole:/終身/.test(p.cover), single:p.modes.length===1 && p.modes[0]==='躉繳',
    cancer:false, ci:/重疾|重大傷病/.test(p.cat), acc:false, fx:false, noRider:false, v1:true};
  const c = CAT.find(x => x.code === code);
  if (!c) return null;
  return {code, name:c.name, cat:c.cat, cover:c.cover, whole:/終身/.test(c.cover), single:false, cancer:/防癌/.test(c.cat), ci:/重疾|重大傷病/.test(c.cat),
    acc:/傷害/.test(c.cat), fx:c.code==='FDC', noRider:/不可附加附約/.test(c.other||'') ? '此主約不可附加附約' : c.code==='SDKA' ? 'SDKA 僅可附加 AOR、CLR' : false, v1:false};
}
const SDGS = ['SDG','SDH','SDJ','SDN'];
// 附約 r 能否附加在主約 m 上
function riderOnMain(r, m){
  if (m.noRider) return {ok:false, why:`${m.code}：${m.noRider}`};
  const fxR = /^FD[EFG]$/.test(r);
  if (fxR && !m.fx) return {ok:false, why:'僅可附加同幣別外幣主約（如 FDC）'};
  if (!fxR && m.fx) return {ok:false, why:'外幣主約只能附加同幣別外幣附約'};
  const W = () => (r==='CWR4'||r==='PCC5') ? (m.whole && !m.cancer) : true;
  switch (r){
    case 'HLR2': return m.code==='HIY1' ? {ok:true} : {ok:false, why:'限附加於 HIY1 金享福保本'};
    case 'ADN': return m.code==='LTP' ? {ok:true} : {ok:false, why:'限附加於 LTP 憶心相守'};
    case 'CWR4': case 'PCC5': return W() ? {ok:true} : {ok:false, why:'僅可附加終身型主約（不含癌症險）'};
    case 'SDL': return m.whole && !m.ci ? {ok:true} : {ok:false, why:'僅可附加終身型主約（不含重大傷病）'};
    case 'SWZ': return !m.ci && !m.cancer ? {ok:true} : {ok:false, why:'不可附加重疾／重大傷病／癌症主約'};
    case 'LTU': return m.whole ? {ok:true} : m.code==='HAC' ? {ok:true, warn:'HAC 至 95 歲不夠長，須選 HAD（至 100 歲）'} : {ok:false, why:'主約保障期間不可短於 LTU（99 歲屆滿）→ 需終身型主約'};
    case 'ADG': return !m.acc || ['AJC1','AJI'].includes(m.code) ? {ok:true} : {ok:false, why:'不得附加於傷害險主約（AJC1、AJI 除外）'};
    case 'WPH': case 'WP': case 'WPA': case 'WPF1': return m.single ? {ok:false, why:'不可附加躉繳主約'} : {ok:true};
  }
  return {ok:true};
}
// 附約 r 在目前勾選下的狀態：{ok, why, hosts:[可附加的已勾主約]}
function riderState(r, mains, riders){
  if (!mains.length) return {ok:false, why:'請先勾選主約'};
  const res = mains.map(code => ({code, r:riderOnMain(r, mInfo(code))}));
  const hosts = res.filter(x => x.r.ok).map(x => x.code);
  if (!hosts.length) return {ok:false, why:res.map(x => x.r.why).filter((v,i,a)=>a.indexOf(v)===i).join('；')};
  const has = c => riders.includes(c);
  if (r==='TMR' && !has('ADG')) return {ok:false, why:'須同時勾選 ADG', hosts};
  if ((r==='CMR'||r==='CNR') && !mains.some(c => SDGS.includes(c)) && !['CWR4','PCC5','HSV','HSY'].some(has)) return {ok:false, why:'須搭 SDG／SDH／SDJ／SDN 主約，或同時勾 CWR4／PCC5／HSV／HSY', hosts};
  if (r==='FDE' && has('FDF')) return {ok:false, why:'不可與 FDF 同附一主約', hosts};
  if (r==='FDF' && has('FDE')) return {ok:false, why:'不可與 FDE 同附一主約', hosts};
  if (r!=='WPH' && /^WP/.test(r) && has('WPH')) return {ok:false, why:'已勾 WPH（不可再附加其他豁免附約）', hosts};
  if (r==='WPH' && riders.some(x => x!=='WPH' && /^WP/.test(x))) return {ok:false, why:'已勾其他豁免附約，WPH 不可再併附', hosts};
  const warns = res.filter(x => x.r.ok && x.r.warn).map(x => x.r.warn);
  return {ok:true, hosts, warns};
}

// ---------- 附約／豁免附約試算（費率：riders_rates.js，自各附約「保險費費率表」PDF 抽取，不推估） ----------
const RR = window.RIDER_RATES || {};
const RMF = {年繳:1, 半年繳:0.52, 季繳:0.262, 月繳:0.088};
const RMF_HLR2 = {年繳:1, 半年繳:0.5, 季繳:0.25, 月繳:0.08333333};   // HLR2 費率表註：半年×0.5、季×0.25、月×0.08333333
const WAIVERS = ['WP','WPA','WPF1','WPH'];
const isW = c => WAIVERS.includes(c);
// u：day＝元／日（每百元費率）、wan＝萬元、yuan＝元、unit＝單位、plan＝計劃別（限 1 單位）、usd＝萬美元、waiver＝豁免
// per：費率單位（wan 時每 per 萬元一個費率單位）
const RCFG = {
  HJK:{u:'day', min:()=>500, max:(a,o)=>o<=3?3000:2500, yrt:1},
  HKR5:{u:'day', min:()=>100, max:(a,o)=>o<=3?2000:1500},
  HLR2:{u:'day', min:(a,o)=>o===6&&a>=56?500:800, max:(a,o)=>o<=3?(a<=55?2500:2000):(a<=55?2000:1500), terms:()=>[20], mf:RMF_HLR2, hostX2:1},
  SJR1:{u:'day', min:()=>800, max:()=>3000},
  ADM:{u:'day', min:()=>500, max:()=>2000, yrt:1},
  HSV:{u:'plan', plans:(a,o)=>o<=3?[1,2,3]:[1,2], yrt:1, pn:'HSV'},
  HSY:{u:'plan', plans:()=>[1,2], yrt:1, pn:'HSY'},
  HSW:{u:'plan', plans:()=>[1,2,3], yrt:1, pn:'HSW'},
  HTA:{u:'unit', min:()=>1, max:()=>2},
  PCC5:{u:'unit', min:()=>1, max:()=>6},
  CWR4:{u:'unit', min:()=>1, max:()=>5, terms:()=>[10,15,20]},
  CWR3:{u:'unit', min:()=>1, max:a=>a<14?2:3, terms:a=>a<=60?[15,20]:[15]},
  CMR:{u:'wan', per:10, step:10, min:()=>30, max:()=>60},
  CNR:{u:'wan', per:15, step:15, min:()=>15, max:()=>15},
  SDL:{u:'wan', per:10, min:()=>30, max:()=>200, yr:1, yrt:1, def:50},
  SWZ:{u:'wan', per:1, min:()=>10, max:()=>200},
  UCR:{u:'wan', per:1, min:()=>10, max:()=>200, yr:1, yrt:1},
  ADH:{u:'wan', per:1, min:()=>10, max:()=>200, yrt:1},
  ADG:{u:'wan', per:1, min:(a,o,m)=>a<15?(m==='月繳'?2:1):30, max:a=>a<15?200:a<=60?2000:600, yrt:1, def:100},
  TMR:{u:'wan', per:1, min:()=>3, max:()=>20, yrt:1, tmr:1},
  ADN:{u:'wan', per:10, step:10, min:()=>100, max:()=>300, yrt:1},
  LTU:{u:'yuan', per:10000, step:1000, min:()=>3000, max:()=>25000},
  FDE:{u:'usd', step:0.1, min:()=>1, max:()=>10, terms:()=>[20]},
  FDF:{u:'usd', step:0.1, min:()=>1, max:()=>10, terms:()=>[20]},
  FDG:{u:'usd', step:0.1, min:()=>1, max:()=>10, terms:()=>[20]},
  WP:{u:'waiver'}, WPA:{u:'waiver', parent:1}, WPF1:{u:'waiver', parent:1}, WPH:{u:'waiver'},
};
const RUNIT = {day:'元／日', wan:'萬元', yuan:'元', unit:'單位', usd:'萬美元'};
const RPER = c => { const g = RCFG[c]; return g.u==='day'?'每百元日額':g.u==='unit'?'每單位':g.u==='plan'?'每 1 單位（計劃別）':g.u==='usd'?'每萬美元':g.u==='yuan'?'每萬元保額':g.u==='waiver'?'每萬元投保金額（應繳保費）':g.tmr?'前 3 萬＋每加 1 萬':`每${g.per===1?'':g.per}萬元`; };
function rTable(code, q, renew){
  const R = RR[code]; if (!R) return null;
  const parts = R.kf.map(k => k==='sex' ? q.sex : k==='occ' ? q.occ : k==='plan' ? q.plan : k==='term' ? q.term : k==='yr' ? (renew?'r':'f') : '');
  const T = (renew && R.renew) ? R.renew : R.t;
  const row = T[parts.join('|')]; if (!row) return null;
  if (R.flat) return row[1][0];
  const v = row[1][q.age - row[0]];
  return v == null ? null : v;
}
function rLim(code, age, occ, mode, hostSum){
  const g = RCFG[code]; if (!g) return null;
  const L = {u:g.u, terms:g.terms ? g.terms(age) : null, plans:g.plans ? g.plans(age, occ) : null};
  if (g.min){ L.min = g.min(age, occ, mode); L.max = g.max(age, occ, mode); L.step = g.step || (g.u==='day'?100:1); }
  if (g.hostX2 && hostSum != null) L.max = Math.min(L.max, hostSum*2);        // HLR2 ≦ 主約日額 2 倍
  if (g.tmr && hostSum != null) L.max = Math.min(L.max, Math.floor(hostSum*0.1)); // TMR ≦ ADG 保額 10%
  return L;
}
// q：{age, sex, occ, plan, term, sum, mode, payDisc, covered(豁免：被豁免保費年繳合計), hostSum}
function rQuote(code, q){
  const g = RCFG[code], R = RR[code];
  if (!g || !R) return {errs:['此附約費率尚未收錄']};
  const errs = [], L = rLim(code, q.age, q.occ, q.mode, q.hostSum);
  if (L.plans && !L.plans.includes(+q.plan)) errs.push(`此職業類別可選計劃：${L.plans.map(p=>g.pn+p).join('、')}`);
  if (L.terms && !L.terms.includes(+q.term)) errs.push(`此年齡可選年期：${L.terms.join('／')} 年`);
  let units;
  if (g.u === 'waiver'){
    if (q.covered == null) return {errs:[q.coverWhy || '無法計算被豁免保費']};
    units = q.covered / 10000;
  } else if (g.u === 'plan') units = 1;
  else {
    const S = +q.sum;
    if (!(S >= L.min - 1e-9)) errs.push(`保額低於最低 ${L.min.toLocaleString()} ${RUNIT[g.u]}`);
    if (!(S <= L.max + 1e-9)) errs.push(`保額超過上限 ${L.max.toLocaleString()} ${RUNIT[g.u]}` + (g.hostX2 && q.hostSum!=null ? `（≦主約日額 ${q.hostSum.toLocaleString()} × 2）` : g.tmr && q.hostSum!=null ? `（≦ADG ${q.hostSum} 萬 × 10%）` : ''));
    if (Math.abs(Math.round(S/L.step)*L.step - S) > 1e-6) errs.push(`保額需以 ${L.step.toLocaleString()} ${RUNIT[g.u]} 為單位`);
    units = g.u==='day' ? S/100 : g.u==='yuan' ? S/g.per : g.u==='usd' ? S : g.u==='unit' ? S : g.tmr ? 1 : S/g.per;
  }
  if (errs.length) return {errs};
  let rate = rTable(code, q);
  if (rate == null) return {errs:[R.kf.includes('occ') && q.age <= 14 && q.occ > 1 ? '費率表 14 歲（含）以下只有職業第 1 類費率' : `查無費率（${q.age} 歲${g.parent?'（要保人）':''}此組合不在費率表內）`]};
  let rateTxt = rate;
  if (g.tmr){ const add = R.add[String(q.occ)]; rateTxt = `${rate}＋${add}×${(+q.sum-3)}`; rate = rate + add*(+q.sum-3); }
  const annual = Math.round(units * rate * 10 + 1e-7) / 10;
  const f = (g.mf || RMF)[q.mode] || 1;
  const modal = Math.round(annual * f + 1e-7);
  const bp = q.payDisc ? 100 : 0;   // 繳費方式 1%＝總應收保費（主約＋附約）1%，依主約保費規定
  const paid = Math.round(modal * (10000 - bp) / 10000 + 1e-7);
  const n = {年繳:1,躉繳:1,半年繳:2,季繳:4,月繳:12}[q.mode] || 1;
  const out = {rate, rateTxt, units, annual, modal, paid, bp, n, firstYear: paid*n, cur: g.u==='usd' ? 'USD' : 'TWD'};
  if (g.yr || R.renew){ const rn = rTable(code, Object.assign({}, q, {age:q.age+1}), true); if (rn != null) out.renew = Math.round(units*rn*10+1e-7)/10; }
  return out;
}

window.QuoteEngine = {quote, limits, termsFor, eligible, catElig, PRI, riderOnMain, riderState, mInfo, rQuote, rLim, RCFG};
if (typeof document === 'undefined') return;

// ---------- UI ----------
const $ = s => document.querySelector(s);
const st = {age:30, sex:1, occ:1, pAge:null, pSex:1, open:null, sel:{}, rsel:{}, mains:[], riders:{}, dropped:[], gopen:{}, fold:{}};
try { const o = JSON.parse(localStorage.getItem('fbq2')||'{}'); Object.assign(st, o, {open:null, dropped:[], fold:{}}); st.gopen = st.gopen || {}; st.rsel = st.rsel || {}; st.pSex = st.pSex || 1; } catch(e){}
const save = () => localStorage.setItem('fbq2', JSON.stringify({age:st.age,sex:st.sex,occ:st.occ,pAge:st.pAge,pSex:st.pSex,mains:st.mains,riders:st.riders,sel:st.sel,rsel:st.rsel,gopen:st.gopen}));
const riderCodes = () => Object.keys(st.riders);
const termTxt = t => t==0?'躉繳':t==1?'一年期':t+'年';

function insAge(bd){
  const b = new Date(bd), t = new Date();
  let y = t.getFullYear()-b.getFullYear(), m = t.getMonth()-b.getMonth(), d = t.getDate()-b.getDate();
  if (d < 0) m -= 1; if (m < 0) { y -= 1; m += 12; }
  const extra = (m > 6 || (m === 6 && d > 0)) ? 1 : 0;   // 零數超過六個月加一歲
  return y + extra;
}
function defaultsFor(p){
  const s = st.sel[p.code] || {};
  const plan = p.plans ? (s.plan || 'HAC1') : p.code;
  const terms = termsFor(p, st.age, plan);
  const hsv = !!p.minHSV && hsvOn(p.code);   // 只有 HSV 實際附加於此主約才算
  const [mn, mx] = limits(p, st.age, st.occ, hsv);
  let term = terms.includes(s.term) ? s.term : terms[terms.length-1];
  let sum = s.sum != null ? s.sum : (p.unit==='day' ? Math.min(Math.max(1000,mn),mx) : mn);
  const mode = p.modes.includes(s.mode) ? s.mode : p.modes[0];
  return Object.assign({plan, term, sum, mode, hsv, payDisc: s.payDisc !== false}, {terms});
}
const qOf = p => { const s = defaultsFor(p); return {s, r:quote(p, Object.assign({age:st.age, sex:st.sex, occ:st.occ}, s))}; };

// 合格判斷（主約／附約共用）
function mainOk(code){ const p = P.find(x=>x.code===code); if (p) return eligible(p, st.age); const c = CAT.find(x=>x.code===code); return !!c && c.kind==='main' && !!catElig(c, st.age, st.sex, st.occ, st.pAge).ok; }
function riderOk(code){ const c = CAT.find(x=>x.code===code); return !!c && c.kind!=='main' && !!catElig(c, st.age, st.sex, st.occ, st.pAge).ok; }
// 條件改變後清掉不合格的勾選；再清掉失去可附加主約的附約
function prune(){
  const drop = [];
  st.mains = st.mains.filter(c => mainOk(c) || (drop.push(c), false));
  for (let pass = 0; pass < 3; pass++) for (const r of riderCodes()){
    const s = riderOk(r) ? riderState(r, st.mains, riderCodes().filter(x=>x!==r)) : {ok:false};
    if (!s.ok){ delete st.riders[r]; drop.push(r); }
    else if (!s.hosts.includes(st.riders[r])) st.riders[r] = s.hosts[0];
  }
  if (drop.length) st.dropped = drop;
}

// ---------- 附約試算（UI 端）：附約繳別／繳費方式折扣跟著所附加的主約 ----------
function rDefaults(code){
  const g = RCFG[code]; if (!g) return null;
  const s = st.rsel[code] || (st.rsel[code] = {});
  const host = st.riders[code], hp = P.find(x=>x.code===host), hs = hp ? defaultsFor(hp) : null;
  const mode = hp ? hs.mode : (RMF[s.mode] ? s.mode : '年繳');
  const payDisc = hp ? !!(hp.pay && hs.payDisc) : false;
  let hostSum = null;
  if (g.hostX2 && hp && hp.unit==='day') hostSum = +hs.sum;
  if (g.tmr && 'ADG' in st.riders){ const a = st.rsel.ADG; hostSum = a && a.sum != null ? +a.sum : RCFG.ADG.def; }
  const L = rLim(code, st.age, st.occ, mode, hostSum);
  const q = {age:st.age, sex:st.sex, occ:st.occ, mode, payDisc, hostSum};
  if (L.plans) q.plan = L.plans.includes(+s.plan) ? +s.plan : L.plans[0];
  if (L.terms) q.term = L.terms.includes(+s.term) ? +s.term : L.terms[L.terms.length-1];
  if (L.min != null){ const d = g.def != null ? g.def : g.u==='day' ? 1000 : L.min; q.sum = s.sum != null ? s.sum : Math.min(Math.max(d, L.min), L.max); }
  if (g.parent){ q.age = st.pAge; q.sex = st.pSex || 1; }
  return {q, L, hp, hs, host};
}
// 豁免附約：投保金額＝所附主約＋該主約其他附約（不含豁免）之應繳保費；年期＝主約繳費年期
function rCover(host){
  const hp = P.find(x=>x.code===host);
  if (!hp) return {why:`${host} 保費待試算（主約費率整理中），無法計算豁免保費`};
  const {s, r} = qOf(hp);
  if (r.errs) return {why:`${host} 設定不符，先修正主約`};
  let tot = r.annual; const parts = [`${host} ${fmt(r.annual)}`];
  for (const [rc, h] of Object.entries(st.riders)){
    if (h !== host || isW(rc) || !RCFG[rc] || RCFG[rc].u==='usd') continue;
    const x = rCalc(rc); if (x.r.errs) return {why:`${rc} 設定不符，先修正附約`};
    tot += x.r.annual; parts.push(`${rc} ${fmt(x.r.annual)}`);
  }
  return {covered: Math.round(tot*10)/10, term: s.term, parts};
}
function rCalc(code){
  const d = rDefaults(code); if (!d) return {r:{errs:['此附約費率尚未收錄']}};
  const {q} = d;
  if (isW(code)){
    if (RCFG[code].parent && (st.pAge == null || st.pAge === '')) return {d, r:{errs:['請在第①區填「要保人（父母）年齡」與性別']}};
    const c = rCover(d.host);
    if (c.why) return {d, r:{errs:[c.why]}};
    q.covered = c.covered;
    if (code === 'WP'){ const k = {10:'10',15:'15',20:'20',25:'25',30:'30'}[c.term]; if (!k) return {d, r:{errs:[`WP 費率只有主約繳費 10／15／20／25／30 年（及 55／60／65 歲滿期、終身繳），${d.host} 目前 ${c.term} 年`]}}; q.term = k; }
    else { if (!(c.term >= 3 && c.term <= 30)) return {d, r:{errs:[`${code} 限主約繳費 3–30 年，${d.host} 目前 ${c.term} 年`]}}; q.term = c.term; }
    d.cover = c;
  }
  return {d, r:rQuote(code, q)};
}
function rctl(code){
  const g = RCFG[code]; if (!g || !RR[code]) return '';
  const {d, r} = rCalc(code); if (!d) return '';
  const {q, L, hp} = d;
  let h = '<div class="rctl">';
  if (L.plans) h += `<div class="chips">${L.plans.map(p=>`<button class="chip${p===q.plan?' on':''}" data-rk="plan" data-r="${code}" data-v="${p}">${g.pn}${p}</button>`).join('')}</div>`;
  if (L.terms && L.terms.length > 1) h += `<div class="chips">${L.terms.map(t=>`<button class="chip${t===q.term?' on':''}" data-rk="term" data-r="${code}" data-v="${t}">${t} 年繳</button>`).join('')}</div>`;
  if (L.min != null){
    const fixed = L.min === L.max;
    h += `<div class="sumrow">${fixed?'':`<button class="pm" data-rk="sumd" data-r="${code}" data-v="-1">−</button>`}<input data-rsum="${code}" type="number" inputmode="decimal" step="${L.step}" value="${q.sum}" ${fixed?'readonly':''}><span class="unit">${RUNIT[g.u]}</span>${fixed?'':`<button class="pm" data-rk="sumd" data-r="${code}" data-v="1">＋</button>`}</div>`
      + `<div class="lim">${fixed?'固定':''}${fixed?L.min.toLocaleString():L.min.toLocaleString()+'–'+L.max.toLocaleString()} ${RUNIT[g.u]}${L.step>1&&!fixed?`（每 ${L.step.toLocaleString()}）`:g.u==='usd'?'（以千美元為單位）':''}</div>`;
  }
  if (!hp && !isW(code)) h += `<div class="chips">${Object.keys(RMF).map(m=>`<button class="chip${m===q.mode?' on':''}" data-rk="mode" data-r="${code}" data-v="${m}">${m}</button>`).join('')}</div>`;
  if (r.errs) h += `<div class="err">⛔ ${r.errs.join('<br>⛔ ')}</div>`;
  else {
    const cur = r.cur==='USD' ? 'US$ ' : 'NT$ ';
    h += `<div class="rres"><b>${cur}${fmt(r.paid)}</b> <small>${q.mode}${q.mode!=='年繳'?'每期':''}${r.bp?'（含繳費方式 1%）':''}</small><span>年繳 ${fmt(r.annual)}｜費率 ${typeof r.rateTxt==='number'?r.rateTxt.toLocaleString():r.rateTxt} ${r.cur==='USD'?'美元':'元'}／${RPER(code)}${g.parent?`｜要保人 ${q.age} 歲${q.sex==1?'男':'女'}`:''}${isW(code)?`｜${q.term} 年期`:''}</span></div>`;
    if (isW(code) && d.cover) h += `<div class="rn">投保金額＝${d.cover.parts.join('＋')}＝${fmt(d.cover.covered)} 元（年繳應繳保費）；豁免保費依費率表×投保金額推算，請以建議書核對。</div>`;
    if (r.renew != null) h += `<div class="rn">一年期：明年續保（${st.age+1} 歲${code==='HSW'?'，續保費率表':''}）年繳約 ${fmt(r.renew)}${r.cur==='USD'?' 美元':' 元'}</div>`;
    else if (g.yrt) h += `<div class="rn">一年期，續保時依續保年齡費率重新計算。</div>`;
    if (r.cur === 'USD') h += `<div class="rn">美元保單：保費以美元計，不併入新台幣合計。</div>`;
    if (!hp && !isW(code)) h += `<div class="rn">${st.riders[code]} 主約保費整理中：繳別自選，繳費方式折扣未計。</div>`;
  }
  return h + '</div>';
}

const box = (key, on, dis, title) => `<label class="pk${dis?' dis':''}" title="${title||''}"><input type="checkbox" data-pick="${key}" ${on?'checked':''} ${dis?'disabled':''}><span></span></label>`;

function catItem(c, e, rs){
  const isM = c.kind === 'main', key = (isM?'m:':'r:')+c.code, on = isM ? st.mains.includes(c.code) : c.code in st.riders;
  const open = st.open === c.code;
  const sexNo = !!e.sexMis;
  const dis = (!isM && !on && !(rs && rs.ok)) || (isM && sexNo && !on);
  const tag = (PRI(c.code) < 99 ? `<span class="tag pri">優先 ${PRI(c.code)}</span>` : '') + (sexNo ? `<span class="tag sexno">⚠ 性別不符（${c.sex===1?'限男性':'限女性'}）</span>` : '') + (e.ok==='cond' ? '<span class="tag cond">看要保人年齡</span>' : e.child ? '<span class="tag cond">子女身分</span>' : '');
  let sub = '';
  if (!isM){
    if (on){
      const hs = (rs && rs.hosts) || [];
      sub = `<div class="host">附加於：${hs.length>1 ? `<select data-host="${c.code}">${hs.map(h=>`<option ${h===st.riders[c.code]?'selected':''}>${h}</option>`).join('')}</select>` : `<b>${st.riders[c.code]}</b>`}${c.code==='HSV' && hs.length>1 ? '<small>（可改掛任一主約；掛 XWS5 時 XWS5 最低 5 萬）</small>' : ''}${RR[c.code] ? '' : '｜保費待試算'}${riderWarn(c.code)}</div>` + (RR[c.code] ? rctl(c.code) : '');
    } else if (rs && !rs.ok) sub = `<div class="why">🔒 ${rs.why}</div>`;
  } else if (on) sub = `<div class="host">✓ 已勾選｜保費待試算（費率整理中）</div>`;
  else if (sexNo) sub = `<div class="why">⚠ 性別不符：${c.sex===1?'男性':'女性'}專屬商品，目前被保險人為${st.sex==1?'男':'女'}性，可點開看內容，不能勾選投保</div>`;
  return `<div class="prod${!isM && RR[c.code] ? ' rq' : ' pend'}${open?' open':''}${on?' picked':''}${dis?' locked':''}" data-c="${c.code}">
    <div class="ph">${box(key, on, dis, sexNo?'性別不符':dis&&rs?rs.why:'')}<span class="code ${c.kind}">${c.code}</span><span class="nm">${c.name}${tag}<span class="meta">${e.ok===true||e.sexMis?e.terms.join('／')+'｜':''}${c.cover}｜${!isM && RR[c.code] ? '<b class="ok">✅ 可試算</b>' : '<em>費率整理中</em>'}</span></span><span class="arrow">${open?'▲':'ⓘ'}</span></div>${sub}
    <div class="pb">${open ? catPanel(c, e) : ''}</div></div>`;
}
function riderWarn(r){
  const h = st.riders[r], p = P.find(x=>x.code===h), s = p && st.sel[h];
  const w = [];
  if (r==='ADH' && p && p.unit==='wan' && s) w.push(`ADH ≦ 主約保額 5 倍＝${(s.sum*5).toLocaleString()} 萬（且 10–200 萬）`);
  if (r==='SDL') w.push(`≦50 萬不受主約額度限制；超過 50 萬須 ≦ 主約可附加額度${p&&p.unit==='wan'&&s&&/XWS5|OLA6/.test(h)?`（${h} ${s.sum} 萬 ×1）`:''}`);
  if (['SJR1','HTA','HKR5','SWZ'].includes(r)) w.push('附約年期不得超過主約');
  if (r==='WP' && p && s && ![10,15,20,25,30].includes(s.term)) w.push(`WP 需主約繳費 10／15／20／25／30 年（目前 ${termTxt(s.term)}）`);
  if (r==='LTU') w.push('LTU 保額：附長照終身型主約 ≦主約保額 2 倍，其他主約 保額×10 ≦ 主約可附加額度');
  if (r==='HSV' || r==='HSY' || r==='HSW') w.push('實支實付型附約同一被保險人有張數限制（含同業），請確認');
  if (r==='WPF1' && 'WPA' in st.riders) w.push('WPF1 規則寫與 WPA 僅可擇一，請確認');
  const rs = riderState(r, st.mains, riderCodes().filter(x=>x!==r));
  if (rs.warns) w.push(...rs.warns);
  return w.length ? `<span class="w">⚠ ${w.join('；')}</span>` : '';
}
function catPanel(c, e){
  const row = (k, v) => v ? `<tr><th>${k}</th><td>${v}</td></tr>` : '';
  let h = `<div class="what"><b>這是甚麼？</b> 富邦人壽${c.name}（${c.code}）｜${KIND[c.kind]}｜${c.cat}</div>`;
  h += `<table class="info">${row('投保年齡', c.ages.map(x=>`${x.t}：${x.a}–${x.b} 歲`).join('<br>'))}${row('保障期間', c.cover)}${row('保額規定', c.sum)}${row(c.kind==='main'?'附加附約':'附加條件', c.attach)}${row('其他', [c.other, c.note].filter(Boolean).join('<br>'))}${row('職業限制', c.occx.length?`第 ${c.occx.join('、')} 類不可附加`:'')}</table>`;
  if (e.sexMis) h += `<div class="err">⚠ 性別不符：${e.why}（目前被保險人為${st.sex==1?'男':'女'}性）。男女平權列出供比較／說明，實際投保須符合性別。</div>`;
  else if (e.ok === false) h += `<div class="err">⛔ ${e.why}</div>`;
  if (c.ben.length) h += `<div class="ben"><b>主要給付項目</b>（金額依條款／商品內容說明）<div class="chips">${c.ben.map(b=>`<span class="chip">${b}</span>`).join('')}</div></div>`;
  if (c.kind!=='main' && RR[c.code]) h += `<div class="note">✅ 保費試算：勾選後即可在附約列上選${RCFG[c.code].u==='plan'?'計劃別':RCFG[c.code].u==='waiver'?'（豁免附約自動以主約＋附約保費為投保金額）':'保額／日額'}並即時算出保費，計入底部合計。費率來源：${RR[c.code].src.split('/').pop()}（${RPER(c.code)}）</div>`;
  else h += `<div class="stub">💡 保費試算：此商品費率資料整理中，請先以公司建議書系統試算。勾選後會列入組合，保費標示「待試算」、不計入合計。</div>`;
  h += `<div class="note">依據：${c.rule}（投保規則）</div>`;
  return h;
}

function v1Item(p){
  const ts = p.plans ? [...new Set([...termsFor(p,st.age,'HAC1'),...termsFor(p,st.age,'HAD1')])].sort((a,b)=>a-b) : termsFor(p, st.age);
  const [mn,mx] = limits(p, st.age, st.occ);
  const lim = p.unit==='unit' ? '1 單位' : (mn===mx ? `限 ${mn.toLocaleString()} ${UNIT[p.unit]}` : `${mn.toLocaleString()}–${mx.toLocaleString()} ${UNIT[p.unit]}`) + (p.minHSV ? `（搭 HSV 最低 ${p.minHSV} 萬）` : '');
  const tag = FAV(p.code) ? '<span class="tag fav">常用</span>' : '';
  const on = st.mains.includes(p.code), open = on ? !st.fold[p.code] : st.open===p.code;
  let sub = '';
  if (on){ const {s, r} = qOf(p); sub = r.errs ? `<div class="why">⛔ 設定不符，未計入合計${p.minHSV && !s.hsv && (+s.sum||0) < p.min ? ` <button class="chip hsvq" data-hsv5="${p.code}">⚡ 勾 HSV → ${p.minHSV} 萬</button>` : ''}</div>` : `<div class="host">✓ ${termTxt(s.term)}｜${p.unit==='unit'?'1單位':s.sum.toLocaleString()+UNIT[p.unit]}｜${s.mode} <b>NT$ ${fmt(r.paid)}</b></div>`; }
  const nm = p.code==='OLA6' ? `${p.name}<span class="tag ola">OLA 系列</span>` : p.name;
  return `<div class="prod${open?' open':''}${on?' picked':''}" data-c="${p.code}" id="p-${p.code}">
    <div class="ph">${box('m:'+p.code, on)}<span class="code main">${p.code}</span><span class="nm">${nm}${tag}<span class="meta">${ts.map(termTxt).join('／')}｜${lim}｜保障 ${p.cover}</span></span><span class="arrow">${open?'▲':'ⓘ'}</span></div>${sub}
    <div class="pb">${open ? panel(p) : ''}</div></div>`;
}
function grouped(items, fn){
  let h = '', cat = '';
  for (const it of items){ const c = it.c || it; if (c.cat !== cat){ cat = c.cat; h += `<div class="cat">${cat}</div>`; } h += fn(it); }
  return h;
}

function render(){
  prune();
  syncHsv();
  $('#age').value = st.age;
  document.querySelectorAll('#sex button').forEach(b => b.classList.toggle('on', +b.dataset.v === st.sex));
  $('#occ').value = st.occ;
  $('#page').value = st.pAge == null ? '' : st.pAge;
  document.querySelectorAll('#psex button').forEach(b => b.classList.toggle('on', +b.dataset.v === (st.pSex||1)));
  const ok = P.filter(p => eligible(p, st.age)), no = P.filter(p => !eligible(p, st.age));
  const pOk = ok.filter(p => PRI(p.code) < 99), rest = ok.filter(p => PRI(p.code) === 99);
  const ev = CAT.map(c => ({c, e:catElig(c, st.age, st.sex, st.occ, st.pAge)}));
  const mAll = ev.filter(x => x.c.kind==='main' && x.e.ok), mPri = mAll.filter(x => PRI(x.c.code) < 99), mOk = mAll.filter(x => PRI(x.c.code) === 99), mNo0 = ev.filter(x => x.c.kind==='main' && !x.e.ok);
  // 男女平權：常用優先的性別專屬主約（CLZ／CLX）若只因性別不符，仍列在常用優先、標「性別不符」
  const mSex = mNo0.filter(x => PRI(x.c.code) < 99 && x.c.sex && x.c.sex !== st.sex).map(x => { const e2 = catElig(Object.assign({}, x.c, {sex:0}), st.age, st.sex, st.occ, st.pAge); return e2.ok ? {c:x.c, e:Object.assign({}, e2, {ok:false, sexMis:true, why:x.e.why})} : null; }).filter(Boolean);
  const mNo = mNo0.filter(x => !mSex.some(y => y.c.code === x.c.code));
  const rOk = ev.filter(x => x.c.kind!=='main' && x.e.ok), rNo = ev.filter(x => x.c.kind!=='main' && !x.e.ok);
  const rc = riderCodes();
  rOk.forEach(x => x.rs = riderState(x.c.code, st.mains, rc.filter(y=>y!==x.c.code)));
  const nAttach = rOk.filter(x => x.rs.ok).length;
  $('#cnt').textContent = `${st.age} 歲${st.sex==1?'男':'女'}｜職業第 ${st.occ} 類`;
  $('#sumMain').textContent = ok.length + mAll.length; $('#sumRider').textContent = rOk.length;
  $('#subMain').textContent = `可試算 ${ok.length}｜費率整理中 ${mAll.length}`;
  $('#subRider').textContent = st.mains.length ? `已勾主約可搭 ${nAttach} 項` : '先勾主約，才能勾附約';
  // 常用快選（step2）
  const quick = ['XWS5','OLA6'].map(c => P.find(p=>p.code===c)).filter(Boolean);
  $('#quick').innerHTML = '⭐ 常用快選：' + quick.map(p => { const el = eligible(p, st.age), on = st.mains.includes(p.code);
    return `<button type="button" class="qk${on?' on':''}" data-quick="${p.code}" ${el?'':'disabled'}>${on?'☑':'☐'} ${p.code==='OLA6'?'OLA6 金來寶（OLA）':'XWS5 新平準終身'}${el?'':'（年齡不符）'}</button>`; }).join('');
  // 主約區
  const pri = [...pOk.map(p => ({k:PRI(p.code), c:p.code, h:v1Item(p)})), ...mPri.map(x => ({k:PRI(x.c.code), c:x.c.code, h:catItem(x.c, x.e)})), ...mSex.map(x => ({k:PRI(x.c.code), c:x.c.code, h:catItem(x.c, x.e), sx:true}))].sort((a,b)=>a.k-b.k || (a.sx?1:0)-(b.sx?1:0) || (a.c==='CLZ'?-1:1));
  const lbl = (c, sx) => (c==='CLZ' ? '男性癌症 CLZ' : c==='CLX' ? '女性癌症 CLX' : c==='OLA6' ? 'OLA6（OLA）' : c) + (sx ? '（性別不符）' : '');
  let h = st.dropped.length ? `<div class="warn">條件改變，已自動取消不符的勾選：${st.dropped.join('、')}</div>` : '';
  st.dropped = [];
  // 常用優先：獨立醒目區塊
  // 有勾主約 → 其他未勾主約收起（只留已勾的）；全部取消勾選 → 恢復顯示全部
  const fold = st.mains.length > 0 && !st.mshow;
  const nAllMain = pri.length + rest.length + mOk.length;
  if (fold){
    const priP = pri.filter(x => st.mains.includes(x.c));
    h += `<div class="favbox"><div class="subhd favhd">✅ 已勾主約（${st.mains.length}）：${st.mains.join('、')}</div>` + priP.map(x=>x.h).join('')
      + [...rest.filter(p=>st.mains.includes(p.code)).map(p=>v1Item(p)), ...mOk.filter(x=>st.mains.includes(x.c.code)).map(x=>catItem(x.c, x.e))].join('') + `</div>`;
    h += `<div class="mfold">📁 其他 ${nAllMain - st.mains.length} 個主約已收起 <button type="button" class="mini" data-mshow="1">顯示全部主約</button></div>`;
    $('#list').innerHTML = h;
  } else {
  if (st.mains.length) h += `<div class="mfold">已顯示全部主約 <button type="button" class="mini" data-mshow="0">收起未勾選主約</button></div>`;
  h += pri.length ? `<div class="favbox"><div class="subhd favhd">⭐ 常用優先（${pri.length}）：${pri.map(x=>lbl(x.c, x.sx)).join(' → ')}</div>` + pri.map(x=>x.h).join('') + `</div>` : '';
  // 其他主約：依類型分組，預設收合（有勾選或手動打開的組才展開）
  const groups = [];
  for (const it of [...rest.map(p=>({cat:p.cat, h:()=>v1Item(p), code:p.code, v1:true})), ...mOk.map(x=>({cat:x.c.cat, h:()=>catItem(x.c, x.e), code:x.c.code}))]){
    let g = groups.find(g=>g.cat===it.cat); if (!g) groups.push(g = {cat:it.cat, items:[]}); g.items.push(it);
  }
  const nOther = rest.length + mOk.length;
  h += `<div class="subhd othhd">📂 其他主約（${nOther}）依類型分組，點類別展開 <button type="button" class="mini" data-gall="1">全部展開</button><button type="button" class="mini" data-gall="0">全部收合</button></div>`;
  h += groups.map(g => { const picked = g.items.filter(i=>st.mains.includes(i.code)).length, nv = g.items.filter(i=>i.v1).length;
    const open = picked > 0 || st.gopen[g.cat];
    return `<details class="grp" data-g="${g.cat}" ${open?'open':''}><summary><span>${g.cat}</span><span class="gc">${g.items.length} 項${nv&&nv<g.items.length?`（可試算 ${nv}）`:nv?'':'（費率整理中）'}${picked?`｜<b>已勾 ${picked}</b>`:''}</span></summary>${open ? g.items.map(i=>i.h()).join('') : ''}</details>`; }).join('') || '<div class="empty">此年齡沒有其他主約。</div>';
  $('#list').innerHTML = h;
  }
  const noM = no.map(p => `<div class="nl"><b>${p.code}</b> ${p.name}<br>${ageRangeText(p)}</div>`).join('') + mNo.map(x => `<div class="nl"><b>${x.c.code}</b> ${x.c.name}<br>${x.e.why}</div>`).join('');
  $('#nl').innerHTML = noM; $('#nolist').style.display = noM ? '' : 'none';
  $('#nolistcnt').textContent = `（${no.length + mNo.length}）`;
  // 附約區：可搭的排前面
  $('#rhint').innerHTML = st.mains.length ? `已勾主約：<b>${st.mains.join('、')}</b>。可附加的附約可直接勾選，勾了就能選保額／計劃並即時算保費（繳別跟著主約）；🔒 為此組合不能附加（原因寫在下方）。` : '👆 先在上面勾選主約，這裡會打開可附加的附約。';
  const rs1 = rOk.filter(x => x.rs.ok || x.c.code in st.riders), rs2 = rOk.filter(x => !(x.rs.ok || x.c.code in st.riders));
  $('#rlist').innerHTML = (grouped(rs1, x => catItem(x.c, x.e, x.rs)) || (st.mains.length ? '<div class="empty">已勾主約沒有可附加的附約。</div>' : ''))
    + (rs2.length ? `<div class="subhd pendhd">🔒 此組合不能附加（${rs2.length}）</div>` + grouped(rs2, x => catItem(x.c, x.e, x.rs)) : '');
  const noR = rNo.map(x => `<div class="nl"><b>${x.c.code}</b> ${x.c.name}<br>${x.e.why}</div>`).join('');
  $('#rnl').innerHTML = noR; $('#rnolist').style.display = noR ? '' : 'none';
  $('#rnolistcnt').textContent = `（${rNo.length}）`;
  renderCart(); save();
}

// XWS5 想做 5 萬 → 保額欄下方立即出現「勾 HSV（掛 XWS5）」；保額 < 最低保額且未搭 HSV 時醒目提示
function hsvBox(p, s){
  const on = hsvOn(p.code), hh = st.riders.HSV, low = (+s.sum||0) < p.min - 1e-9;
  const can = riderOk('HSV');
  const hot = low && !on;
  let lbl;
  if (on) lbl = `<b>HSV 已附加於 ${p.code}</b> → 最低保額 ${p.minHSV} 萬（整）可投保；取消勾選則回到最低 ${p.min} 萬`;
  else if (hh) lbl = `<b>改掛 HSV 到 ${p.code}</b>（目前掛 ${hh}）→ ${p.code} 可投保 ${p.minHSV} 萬`;
  else lbl = `<b>附加 HSV 住院醫療附約（掛 ${p.code}）</b> → ${p.code} 最低保額可降到 ${p.minHSV} 萬`;
  if (hot) lbl = `⚡ ${p.code} ${(+s.sum).toLocaleString()} 萬低於最低 ${p.min} 萬：` + lbl;
  if (!can) return `<div class="hsvbox dis">HSV 此年齡／條件不可附加（${p.code} 最低 ${p.min} 萬）</div>`;
  return `<label class="hsvbox${hot?' hot':''}${on?' on':''}"><input type="checkbox" data-hsvx="${p.code}" ${on?'checked':''}><span>${lbl}${!on?`<small>HSV 也可改掛 OLA6 等其他主約，但只有掛 ${p.code} 才能 ${p.minHSV} 萬</small>`:''}</span></label>`
    + (!on && !low ? `<div class="chips"><button class="chip" data-hsv5="${p.code}">⚡ 直接做 ${p.minHSV} 萬（自動勾 HSV）</button></div>` : '');
}
function attachHsv(code, sum5){
  const p = P.find(x=>x.code===code); if (!p) return;
  if (!st.mains.includes(code)){ st.mains.push(code); st.mshow = false; }
  const rs = riderState('HSV', st.mains, riderCodes().filter(x=>x!=='HSV'));
  if (!(riderOk('HSV') && rs.ok && rs.hosts.includes(code))){ alert('HSV 目前無法附加於 '+code+'：'+(rs.why||'年齡／條件不符')); return; }
  st.riders.HSV = code;
  const s = st.sel[code] || (st.sel[code] = {});
  if (sum5 || s.sum == null || s.sum < p.min || s.sum === p.min){ s.sum = p.minHSV; s.hsv = true; }
}
function panel(p){
  const s = defaultsFor(p); st.sel[p.code] = Object.assign({}, s, {terms:undefined});
  const [mn, mx, step] = limits(p, st.age, st.occ, s.hsv);
  let h = `<div class="what"><b>這是甚麼？</b> 富邦人壽${p.name}（${p.code}）｜主約｜${p.cat}｜保障 ${p.cover}｜投保年齡 ${ageRangeText(p)}</div>`;
  if (!st.mains.includes(p.code)) h += `<div class="note">☐ 勾選左側方框即加入組合，並可勾選可附加的附約。</div>`;
  if (p.plans){
    const pl = s.plan.slice(3), start = s.plan.startsWith('HAD') ? 80 : 75;
    h += `<div class="fl">計劃別</div><div class="chips">${[1,2,3].map(i=>`<button class="chip${pl==i?' on':''}" data-k="plan" data-p="${p.code}" data-v="${start==75?'HAC':'HAD'}${i}">計劃 ${i}</button>`).join('')}</div>`;
    h += `<div class="fl">實支實付保險金啟動日</div><div class="chips">${[75,80].map(a=>{const code=(a==75?'HAC':'HAD')+pl; const can=termsFor(p,st.age,code).length>0; return `<button class="chip${start==a?' on':''}" data-k="plan" data-p="${p.code}" data-v="${code}" ${can?'':'disabled'}>${a} 歲（${a==75?'HAC':'HAD'}${pl}）${can?'':'－年齡不符'}</button>`}).join('')}</div>`;
  }
  h += `<div class="fl">繳費年期</div><div class="chips">${s.terms.map(t=>`<button class="chip${t===s.term?' on':''}" data-k="term" data-p="${p.code}" data-v="${t}">${t==0?'躉繳':t==1?'一年期':t+' 年'}</button>`).join('')}</div>`;
  if (p.unit !== 'unit'){
    h += `<div class="fl">${p.unit==='day'?'住院醫療日額':'保額'}（${mn===mx?'固定':mn.toLocaleString()+'–'+mx.toLocaleString()}，${p.unit==='day'?'以百元為單位':'每 '+step+' '+UNIT[p.unit]}）</div>
      <div class="sumrow"><button class="pm" data-k="sumd" data-p="${p.code}" data-v="-1">−</button><input data-sum="${p.code}" type="number" inputmode="decimal" step="${step}" value="${s.sum}" ${mn===mx?'readonly':''}><span class="unit">${UNIT[p.unit]}</span><button class="pm" data-k="sumd" data-p="${p.code}" data-v="1">＋</button></div>`;
  }
  if (p.minHSV) h += hsvBox(p, s);
  if (p.modes.length > 1) h += `<div class="fl">繳別</div><div class="chips">${p.modes.map(m=>`<button class="chip${m===s.mode?' on':''}" data-k="mode" data-p="${p.code}" data-v="${m}">${m}</button>`).join('')}</div>`;
  if (p.pay) h += `<label class="chk"><input type="checkbox" data-pd="${p.code}" ${s.payDisc?'checked':''}> 繳費方式折扣 ${p.pay*100}%（首期匯款／轉帳／富邦信用卡；續期轉帳／富邦信用卡／自行繳費）</label>`;
  const r = quote(p, Object.assign({age:st.age, sex:st.sex, occ:st.occ}, s));
  if (r.errs) h += `<div class="err">⛔ ${r.errs.join('<br>⛔ ')}</div>`;
  else {
    h += `<div class="res"><div>${s.mode}${s.mode!=='年繳'&&s.mode!=='躉繳'?'每期':''}實繳保費</div><div class="big">NT$ ${fmt(r.paid)}</div>
      <table><tr><td>${s.mode==='躉繳'?'躉繳':'年繳'}保費（折扣前）</td><td>${fmt(r.annual)}</td></tr>
      ${s.mode!=='年繳'&&s.mode!=='躉繳'?`<tr><td>${s.mode}每期（折扣前）</td><td>${fmt(r.modal)}</td></tr><tr><td>首年實繳合計</td><td>${fmt(r.firstYear)}</td></tr>`:''}
      <tr><td>折扣</td><td>${r.bp? (r.bp/100)+'%（'+r.dl.join('＋')+'）':'無'}</td></tr>
      <tr><td>費率</td><td>${r.rate.toLocaleString()} 元／每${p.unit==='day'?'百元日額':p.unit==='wan'?'萬元':'單位'}</td></tr></table></div>`;
    if (r.warn) h += `<div class="warn">⚠ ${r.warn}</div>`;
  }
  if (p.health) h += `<div class="note">另有健康管理保險費折扣（${p.health*100}%，依保費規定／條款於續期適用，未計入上方金額）。</div>`;
  if (p.note) h += `<div class="note">${p.note}</div>`;
  if (p.keyfmt==='yrt') h += `<div class="note">一年期自然費率：上方為首年保費，續保依續保年齡費率計收。</div>`;
  h += `<div class="ben"><b>主要給付項目</b>（金額依條款／商品內容說明）<div class="chips">${p.ben.map(b=>`<span class="chip">${b}</span>`).join('')}</div></div>`;
  h += `<div class="note">保障期間：${p.cover}｜建議書 ${p.ver}｜費率來源：${p.src.split('/').pop()}</div>`;
  return h;
}

// ---------- 組合（勾選即組合） ----------
function bundle(){
  const items = [];
  for (const code of st.mains){
    const p = P.find(x=>x.code===code);
    if (p){ const {s, r} = qOf(p);
      const desc = (p.plans?`計劃${s.plan.slice(3)}(${s.plan.startsWith('HAD')?80:75}歲啟動)｜`:'') + termTxt(s.term)+(s.term>1?'期':'') + (p.unit==='unit'?'｜1單位':`｜${(+s.sum).toLocaleString()}${UNIT[p.unit]}`) + (p.minHSV && s.hsv ? '｜搭 HSV' : '');
      items.push({kind:'主約', code:p.plans?s.plan:code, name:p.name, desc, mode:s.mode, paid:r.errs?null:r.paid, firstYear:r.errs?0:r.firstYear, err:!!r.errs});
    } else { const c = CAT.find(x=>x.code===code); items.push({kind:'主約', code, name:c.name, desc:c.cat, pending:true}); }
    const rs = Object.entries(st.riders).filter(([rc, h]) => h === code).map(([rc]) => rc).sort((a,b) => isW(a) - isW(b));
    for (const rc of rs){ const c = CAT.find(x=>x.code===rc);
      if (!RR[rc]){ items.push({kind:KIND[c.kind], code:rc, name:c.name, desc:`附加於 ${code}`, pending:true, sub:true}); continue; }
      const {d, r} = rCalc(rc), q = d ? d.q : {}, g = RCFG[rc];
      const amt = g.u==='plan' ? `計劃${q.plan}` : g.u==='waiver' ? `${q.term||''}年期` : `${(+q.sum).toLocaleString()}${RUNIT[g.u]}` + (q.term ? `｜${q.term}年繳` : '');
      items.push({kind:KIND[c.kind], code:g.u==='plan'?g.pn+q.plan:rc, name:c.name, desc:`附加於 ${code}｜${amt}`, mode:q.mode, paid:r.errs?null:r.paid, firstYear:r.errs||r.cur==='USD'?0:r.firstYear, usd:!r.errs&&r.cur==='USD'?r.firstYear:0, cur:r.cur, err:!!r.errs, sub:true}); }
  }
  return items;
}
function renderCart(){
  const c = $('#cart'), it = bundle();
  if (!it.length){ c.classList.add('hidden'); return; }
  c.classList.remove('hidden');
  const tot = it.reduce((a,x)=>a+(x.firstYear||0),0), usd = it.reduce((a,x)=>a+(x.usd||0),0), pend = it.filter(x=>x.pending).length, err = it.filter(x=>x.err).length;
  const nM = it.filter(x=>x.kind==='主約').length;
  $('#cartsum').innerHTML = `主約 ${nM}｜附約 ${it.length-nM}｜首年實繳 <b>NT$ ${fmt(tot)}</b>${usd?`＋<b>US$ ${fmt(usd)}</b>`:''}${pend?`<small>另 ${pend} 項待試算</small>`:''}${err?`<small class="e">${err} 項設定不符未計</small>`:''}`;
  $('#cartbody').innerHTML = it.map(x=>`<div class="ci${x.sub?' sub':''}"><div>${x.sub?'└ ':''}${x.code} ${x.name}<small>${x.kind}｜${x.desc}</small></div><div style="text-align:right">${x.pending?'待試算':x.err?'⛔ 設定不符':(x.cur==='USD'?'US$ ':'')+fmt(x.paid)}<small>${x.pending||x.err?'':x.mode}</small></div></div>`).join('')
    + `<div style="display:flex;gap:8px;margin-top:10px"><button id="copy">複製文字（貼 LINE）</button><button id="clear">全部取消勾選</button></div>`;
}
function cartText(){
  const it = bundle(), tot = it.reduce((a,x)=>a+(x.firstYear||0),0), usd = it.reduce((a,x)=>a+(x.usd||0),0), pend = it.filter(x=>x.pending).length;
  return `【富邦保費試算】${st.age}歲${st.sex==1?'男':'女'}\n` + it.map(x=>`${x.sub?'　└':'・'}${x.code} ${x.name}｜${x.desc}｜${x.pending?'保費待試算':x.err?'設定不符':x.mode+' '+fmt(x.paid)+(x.cur==='USD'?' 美元':' 元')}`).join('\n') + `\n首年實繳合計：${fmt(tot)} 元${usd?`＋${fmt(usd)} 美元`:''}${pend?`（不含 ${pend} 項待試算）`:''}\n※僅供參考，以公司正式建議書為準`;
}

// HSV 附約實際附加在哪張主約上；XWS5「最低 5 萬」只在 HSV 掛在 XWS5 時成立
function hsvOn(code){ return Object.entries(st.riders).some(([r, h]) => r === 'HSV' && h === code); }
function syncHsv(){
  for (const p of P.filter(x=>x.minHSV)){
    const s = st.sel[p.code] || (st.sel[p.code] = {}), on = hsvOn(p.code), was = !!s.hsv;
    s.hsv = on;
    if (on && !was && (s.sum == null || s.sum === p.min)) s.sum = p.minHSV;
    if (!on && was && s.sum != null && s.sum < p.min) s.sum = p.min;   // 剛取消 HSV 才拉回最低；使用者自己打 5 萬則保留並提示勾 HSV
  }
}
function toggle(key, on){
  const [t, code] = key.split(':');
  if (t === 'm'){
    if (on && !st.mains.includes(code)) st.mains.push(code);
    if (!on) st.mains = st.mains.filter(c=>c!==code);
    if (on && P.some(p=>p.code===code)) st.open = null;
    if (on) st.mshow = false;                      // 新勾主約 → 其他主約收起
  } else {
    if (on){ const s = riderState(code, st.mains, riderCodes()); if (!s.ok) return; st.riders[code] = s.hosts[0]; }   // 預設第一張可附加主約，可在附約上改選
    else delete st.riders[code];
  }
}

document.addEventListener('click', e => {
  const pm = e.target.closest('#step1 .pm');
  if (pm){ st.age = Math.max(0, Math.min(85, st.age + +pm.dataset.d)); render(); return; }
  const sx = e.target.closest('#sex button');
  if (sx){ st.sex = +sx.dataset.v; render(); return; }
  if (e.target.closest('.pk')) return;            // 勾選框交給 change 事件
  const qk = e.target.closest('[data-quick]');
  if (qk){ const c = qk.dataset.quick; toggle('m:'+c, !st.mains.includes(c)); render(); const el = document.getElementById('p-'+c); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); return; }
  const ph = e.target.closest('.ph');
  if (ph){ const c = ph.parentNode.dataset.c; if (st.mains.includes(c) && P.some(p=>p.code===c)){ st.fold[c] = !st.fold[c]; render(); return; } st.open = st.open===c ? null : c; render(); return; }
  const ms = e.target.closest('[data-mshow]');
  if (ms){ st.mshow = ms.dataset.mshow === '1'; render(); return; }
  const ga = e.target.closest('[data-gall]');
  if (ga){ e.preventDefault(); document.querySelectorAll('#list details.grp').forEach(d => st.gopen[d.dataset.g] = ga.dataset.gall==='1'); render(); return; }
  const k = e.target.closest('[data-k]');
  if (k){
    const p = P.find(x => x.code === k.dataset.p); if (!p) return; const s = st.sel[p.code];
    const v = k.dataset.v;
    if (k.dataset.k==='plan') s.plan = v;
    else if (k.dataset.k==='term') s.term = +v;
    else if (k.dataset.k==='mode') s.mode = v;
    else if (k.dataset.k==='sumd'){ const [mn,mx,step]=limits(p,st.age,st.occ,s.hsv); const cur=+s.sum||0;
      if (p.minHSV && !s.hsv && +v<0 && cur <= mn + 1e-9) s.sum = p.minHSV;   // XWS5 在 10 萬再按 − → 跳 5 萬並立即提示勾 HSV
      else s.sum = Math.round((Math.min(mx,Math.max(mn,cur+ +v*step)))*100)/100; }
    render(); return;
  }
  const rk = e.target.closest('[data-rk]');
  if (rk){ const c = rk.dataset.r, v = rk.dataset.v, s = st.rsel[c] || (st.rsel[c] = {});
    if (rk.dataset.rk==='plan') s.plan = +v; else if (rk.dataset.rk==='term') s.term = +v; else if (rk.dataset.rk==='mode') s.mode = v;
    else if (rk.dataset.rk==='sumd'){ const d = rDefaults(c); const L = d.L; s.sum = Math.round(Math.min(L.max, Math.max(L.min, (+d.q.sum||0) + +v*L.step))*100)/100; }
    render(); return; }
  const ps = e.target.closest('#psex button');
  if (ps){ st.pSex = +ps.dataset.v; render(); return; }
  const jp = e.target.closest('[data-jump]');
  if (jp){ document.getElementById(jp.dataset.jump).scrollIntoView({behavior:'smooth', block:'start'}); return; }
  if (e.target.id==='cartopen'){ $('#cart').classList.toggle('open'); e.target.textContent = $('#cart').classList.contains('open') ? '明細 ▼' : '明細 ▲'; return; }
  if (e.target.id==='clear'){ st.mains=[]; st.riders={}; render(); return; }
  const h5 = e.target.closest('[data-hsv5]');
  if (h5){ attachHsv(h5.dataset.hsv5, true); render(); return; }
  const ht = e.target.closest('[data-hsvto]');
  if (ht){ const m = ht.dataset.hsvto, rs = riderState('HSV', st.mains, riderCodes().filter(x=>x!=='HSV'));
    if (riderOk('HSV') && rs.ok && rs.hosts.includes(m)) st.riders.HSV = m; else alert('HSV 目前無法附加於 '+m+'：'+(rs.why||'年齡／條件不符')); render(); return; }
  if (e.target.id==='copy'){ const t=cartText(); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>alert('已複製'),()=>prompt('請複製以下文字',t)); return; }
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (d.pick){ toggle(d.pick, t.checked); render(); return; }
  if (d.hsvx){ if (t.checked) attachHsv(d.hsvx, false); else if (st.riders.HSV === d.hsvx) delete st.riders.HSV; render(); return; }
  if (d.host){ st.riders[d.host] = t.value; render(); return; }
  if (d.sum){ st.sel[d.sum].sum = parseFloat(t.value)||0; render(); return; }
  if (d.rsum){ (st.rsel[d.rsum] || (st.rsel[d.rsum] = {})).sum = parseFloat(t.value)||0; render(); return; }
  if (d.pd){ st.sel[d.pd].payDisc = t.checked; render(); return; }
  if (t.id==='age'){ st.age = Math.max(0, Math.min(85, parseInt(t.value)||0)); render(); }
  if (t.id==='page'){ const v = t.value.trim(); st.pAge = v==='' ? null : Math.max(0, Math.min(99, parseInt(v)||0)); render(); }
  if (t.id==='occ'){ st.occ = +t.value; render(); }
  if (t.id==='bd' && t.value){ st.age = insAge(t.value); $('#agehint').textContent = `生日 ${t.value} → 今日保險年齡 ${st.age} 歲`; render(); }
});
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('details.grp')) return; const was = !!st.gopen[d.dataset.g]; if (was === d.open) return; st.gopen[d.dataset.g] = d.open; if (d.open && !d.querySelector('.prod')) render(); else save(); }, true);
$('#ver').textContent = '可試算主約：' + P.map(p=>p.code).join('、') + '｜可試算附約：' + CAT.filter(c=>c.kind!=='main'&&RR[c.code]).map(c=>c.code).join('、') + '｜費率整理中：' + CAT.filter(c=>!(c.kind!=='main'&&RR[c.code])).map(c=>c.code).join('、');
render();
})();
