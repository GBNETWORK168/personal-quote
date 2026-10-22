/* HAC1-3／HAD1-3 實在滿溢住院醫療終身健康保險 — 取自 DM 公版 1150729、條款 1150608、投保規則 1150608 */
(function(){ const fm=n=>Math.round(n).toLocaleString('zh-TW'), F=n=>fm(n)+' 元';
const P={1:{care:5000,mat:5000,ops:2000,opo:500,opd:250,cap:'250 萬',day:1000,hosp:100000,out:20000},2:{care:10000,mat:10000,ops:4000,opo:1000,opd:500,cap:'500 萬',day:2000,hosp:200000,out:30000},3:{care:15000,mat:15000,ops:6000,opo:1500,opd:750,cap:'750 萬',day:3000,hosp:300000,out:40000}};
const TA={HAC:{10:[0,60],20:[0,50],30:[0,40]},HAD:{10:[0,65],20:[0,55],30:[0,45]}};
let CUR=2; const typ=()=>CUR>3?'HAD':'HAC', pn=p=>p>3?p-3:p;
const rate=c=>{CUR=c.plan; const k=typ()+pn(c.plan), R=(window.RATES||{}).HAC, r=R&&R[`${k}|${c.term}|${c.sex}`]; return r?r[1][c.age-r[0]]:null;};
(window.EXPLAIN=window.EXPLAIN||{}).HAC={name:'實在滿溢住院醫療終身健康保險', cat:'醫療（實支／終身）', icon:'🏥', tagline:'先定額、後實支：75 歲（HAC）或 80 歲（HAD）前領定額，之後啟動實支實付，前後各有獨立總額', terms:[10,20,30], defTerm:1, ageOf:t=>TA.HAD[t],
  input:{kind:'plan', plans:[1,2,3,4,5,6].map(v=>({v,lbl:(v>3?'HAD':'HAC')+pn(v)})), def:2},
  exLabel:c=>`${typ()}${pn(c.plan)}・計劃 ${pn(c.plan)}`,
  prem:c=>{const r=rate(c); return r?{annual:r, txt:`${typ()}${pn(c.plan)}・${c.term} 年繳・年繳 <b>${F(r)}</b>（未折扣，限 1 單位）`}:null;},
  warn:()=>`HAC：75 歲啟動實支、保到 95 歲；HAD：80 歲啟動、保到 100 歲。計劃擇一、限 1 單位`+(CUR<=3?'（HAC 投保年齡較 HAD 少 5 歲）':''),
  cards:c=>{const p=P[pn(c.plan)], s=typ()==='HAC'?75:80; return [
    {ic:'🩹',t:`${s} 歲前：住院關懷`,big:F(p.care)+'/次',line:'住院 5 天以上，每次給',sub:''},
    {ic:'🫀',t:`${s} 歲前：醫材補助`,big:F(p.mat)+'/次',line:'使用條款約定醫材，最多 10 次',sub:''},
    {ic:'🔪',t:`${s} 歲前：手術`,big:F(p.ops),line:`住院手術每次（同一次住院一次）；門診手術 ${F(p.opo)}`,sub:`住院前後門診 ${F(p.opd)}/日；總額 ${p.cap}`},
    {ic:'🛏️',t:`${s} 歲起：住院（二擇一）`,big:F(p.day)+'/日',line:`日額，或實支：病房費每天最高 ${F(p.day)}（加護／燒燙傷最高 ${F(p.day*2)}，7 天）＋住院醫療暨手術費用最高 ${F(p.hosp)}/次`,sub:'非健保身分給 75%'},
    {ic:'🏥',t:`${s} 歲起：門診手術實支`,big:'最高 '+F(p.out),line:'每次',sub:`啟動後另有總額 ${p.cap}`},
    {ic:'🕊️',t:'身故／祝壽',big:'年繳總和×1.02',line:'扣掉已領各項保險金後的餘額',sub:`${typ()==='HAC'?'95':'100'} 歲仍生存領祝壽`}];},
  tl:c=>{const s=typ()==='HAC'?75:80, e=typ()==='HAC'?95:100; if(c.age>=s) return null; return {title:'📈 先定額、後實支',svg:EXPLAIN_TL(c,e,[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:s,label:'🩹 定額：關懷／醫材／手術'},{from:s,to:e,label:'🏥 實支實付'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[s,'啟動實支'],[e,'祝壽']])};},
  examples:c=>{const p=P[pn(c.plan)]; return [
    {ic:'🫀',t:'60 歲心導管放支架，住院 5 天',calc:`住院關懷 ${fm(p.care)}＋醫材 ${fm(p.mat)}＋住院手術 ${fm(p.ops)}`,pay:p.care+p.mat+p.ops},
    {ic:'🦴',t:'78 歲換人工膝關節住院 6 天，自費 25 萬（選實支）',calc:`病房 ${fm(p.day)}×6 ＋ 醫療暨手術費最高 ${fm(p.hosp)}`,pay:p.day*6+Math.min(250000,p.hosp)}];},
  src:['HAC1-3／HAD1-3 DM 公版 115.07.29（40 歲男 HAC2 20 年 年繳 76,130；40 歲女 HAD2 20 年 61,260 範例）','條款 115.06.08','投保規則 115.06.08']};
})();
