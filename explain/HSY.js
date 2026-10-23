/* HSY 全鑫一年期住院醫療（HSY1/2，具自負額）— 取自 HSY DM 公版 1140113、HSY 投保規則 1140113、HSY1-Y2 條款 1140113 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const L={1:{dR:1000,R:3000,dM:100000,M:300000,dO:15000,O:25000,dS:7500,S:12500,yr:750000},2:{dR:2000,R:3000,dM:200000,M:300000,dO:20000,O:25000,dS:10000,S:12500,yr:500000}};
(window.EXPLAIN=window.EXPLAIN||{}).HSY={name:'全鑫一年期住院醫療（自負額實支實付）', cat:'醫療（實支實付附約）', icon:'🧾', key30:(c,K)=>[[`大額住院醫療憑收據，${K[1].big}`,1],['別張實支先賠的，可抵自負額',4],[`每年最多賠 ${K[5].big}`,5]], tagline:'先扣自負額再實支實付：保費較省，大額醫療才用得到', ages:[0,70],
  input:{kind:'plan', label:'計劃別', def:1, plans:[{v:1,lbl:'計劃 1'},{v:2,lbl:'計劃 2'}]},
  prem:c=>{const r=c.H.rateRider('HSY',`${c.plan}|${c.sex}`); return r?{annual:r, txt:`HSY${c.plan}・今年年繳 <b>NT$ ${F(r)}</b>（一年期，每年依年齡重算）`}:null;},
  cards:c=>{const l=L[c.plan]; return [
    {ic:'🛏️',t:'病房費差額',big:`每天最多 ${F(l.R-l.dR)} 元`,line:`每天限額 ${F(l.R)} − 自負額 ${F(l.dR)}`,sub:'最多 365 天'},
    {ic:'💊',t:'住院醫療＋手術＋前後門診',big:`每次最多 ${F(l.M-l.dM)} 元`,line:'住院醫療＋手術＋住院前後 1 週同原因門診（有手術：出院後 2 週）加總成一筆',sub:`只扣一次：自負額 ${F(l.dM)} 或 HSV 已憑正本賠的金額，取較大者｜單純門診不賠（第八條第三項第九款）`},
    {ic:'🚶',t:'門診手術',big:`每次最多 ${F(l.O-l.dO)} 元`,line:`限額 ${F(l.O)} − 自負額 ${F(l.dO)}`,sub:'每年最多 6 次'},
    {ic:'💉',t:'特定處置',big:`每次最多 ${F(l.S-l.dS)} 元`,line:`限額 ${F(l.S)} − 自負額 ${F(l.dS)}`,sub:'每年最多 6 次'},
    {ic:'🤝',t:'自負額可由別張補',big:'扣「自負額」或「別張已賠」較大者',line:'別張實支實付憑收據正本先賠的部分，可抵自負額',sub:'個人險限 1 張具自負額實支（同業合計 2 張）'},
    {ic:'📊',t:'每年給付上限',big:`${F(l.yr)} 元`,line:'不計入住院日額累計限額',sub:'沒有健保身分改按實際費用 75%'}];},
  tl:c=>c.age>80?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,80,[{from:c.age,to:80,label:'🔁 一年一保・保證續保到 80 歲（子女到 23 歲）'}],[[c.age,'投保'],[80,'續保到']])}),
  examples:c=>{const l=L[c.plan], ex=[];
    {const M=50000,S=200000,T=M+S,R=0.47,P=[['HSV3',80000,0,0,0],['HSV2＋HSY2',60000,200000,300000,1],['HSV1＋HSY1',40000,100000,300000,1]].map(([n,u,d,lim,y])=>{const v=Math.min(M,y?(d===200000?200000:100000):300000)+Math.min(S,u*R), h=y?Math.min(Math.max(0,T-Math.max(d,v)),lim-d):0; return {n,v,h,t:v+h};});
     ex.push({ic:'🦴',t:'舉例：橈骨尺骨骨折開刀（手術比率 47%）住院 3 天，自費醫材 5 萬＋自費手術 20 萬',calc:'<table style="width:100%;border-collapse:collapse;font-size:13px;text-align:right"><tr><th style="text-align:left">方案</th><th>HSV 賠</th><th>HSY 補</th><th>合計</th><th>自付</th></tr>'+P.map(p=>`<tr><td style="text-align:left">${p.n}</td><td>${F(p.v)}</td><td>${p.h?F(p.h):'—'}</td><td><b>${F(p.t)}</b></td><td>${F(T-p.t)}</td></tr>`).join('')+'</table>',pay:P[2].t,lbl:'HSV1＋HSY1 最多賠',note:'HSV 手術＝手術限額 × 47%（附表二第 96 項）；HSY 依收據把雜費＋手術合併，扣「自負額」或「HSV 已賠」較大者，不看手術比率'});}
    {const tot=255000, p=Math.min(Math.max(0,tot-l.dM), l.M-l.dM); ex.push({ic:'🧮',t:`HSY${c.plan}：住院花 25 萬＋出院後回診 5,000`,calc:`加總 25.5 萬 − 自負額 ${F(l.dM)}（上限 ${F(l.M-l.dM)}）`,pay:p,note:'第八條第三項第九款：前後門診併入該次住院'});}
    const r1=Math.min(3000*5-l.dR*5,(l.R-l.dR)*5), m1=Math.min(250000-l.dM,l.M-l.dM);
    ex.push({ic:'🏥',t:'只買 HSY：住院 5 天，病房差額每天 3,000、自費 25 萬',calc:`病房 (3,000−${F(l.dR)})×5 ＋ 醫療 25萬−${F(l.dM)}`,pay:r1+m1});
    const hR=Math.min(3000,c.plan*1000)*5, hM=Math.min(250000,c.plan*100000), r2=Math.min(15000-Math.max(l.dR*5,hR),(l.R-l.dR)*5), m2=Math.min(250000-Math.max(l.dM,hM),l.M-l.dM);
    ex.push({ic:'🤝',t:`同一筆搭 HSV${c.plan}：HSV 先賠 ${F(hR+hM)}`,calc:`HSY 再賠 病房 ${F(r2)} ＋ 醫療 ${F(m2)}；兩張合計 ${F(hR+hM+r2+m2)}`,pay:r2+m2,note:'HSV 計劃限額正好等於 HSY 同計劃自負額'});
    ex.push({ic:'🚶',t:'門診手術自付 12,000',calc:`未超過自負額 ${F(l.dO)}`,pay:Math.max(0,12000-l.dO),zero:'不賠（小額交給其他醫療險）'});
    return ex;},
  src:['HSY1/HSY2 DM 公版 114.01.13','HSY 投保規則 114.01.13','HSY1-Y2/HSY 保單條款 114.01.13','HSY 費率表 114.01.13']};
})();
