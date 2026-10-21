/* CNR 真愛安康防癌定期健康保險附約（基因檢測）— 取自 CNR DM 公版 1130923、CNR 條款 1130923、投保規則 1151012 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const cyc=c=>{const b=[];let a=c.age;while(a<=71&&b.length<5){b.push(a);a+=10;}return b;};
(window.EXPLAIN=window.EXPLAIN||{}).CNR={name:'真愛安康防癌定期健康保險附約（基因檢測）', cat:'防癌', icon:'🧬', tagline:'罹癌後做癌症基因檢測，一次給付 15 萬（含原位癌、不分期別）', ages:[30,61],
  input:{kind:'none'},
  exLabel:()=>'保額 15 萬元',
  prem:c=>{const r=c.H.rateRider('CNR',`${c.sex}`); return r?{annual:r, txt:`保額 15 萬・年繳 <b>NT$ ${F(r)}</b>・10 年保費固定，續保時依年齡重算`}:null;},
  warn:()=>'單一保額 15 萬；搭售條件同 CMR（須同保單有 SDG／SDH／SDJ／SDN 或 CWR4、PCC5、HSV、HSY）；限主被保險人及配偶',
  cards:c=>[
    {ic:'🧬',t:'罹癌後癌症基因檢測',big:'150,000 元',line:'確診癌症（含原位癌）並經專科醫師指示做基因檢測',sub:'檢測幾次都只給一次，給付後附約結束'},
    {ic:'⏳',t:'等待期',big:'90 天',line:'生效 90 天後確診才賠',sub:'續保不再重算等待期'},
    {ic:'🔁',t:'10 年保證續保',big:'續保到 71 歲',line:'每 10 年續保一次，續保時年齡 ≦71 歲',sub:'主約剩餘期間不足 10 年不能續保'}],
  tl:c=>{const b=cyc(c); return {title:'📈 保障期間（每 10 年保證續保）',svg:EXPLAIN_TL(c,b[b.length-1]+10,b.map((a,i)=>({from:a,to:a+10,label:`${i?'🔁 續保':'🧬 投保'} ${a}～${a+10} 歲`,color:i?'var(--c2)':'var(--c1)'})),[[c.age,'投保'],[b[b.length-1]+10,'']])};},
  examples:c=>[
    {ic:'🫁',t:'確診肺癌，醫師安排基因檢測找合適藥物',calc:'保額 150,000',pay:150000},
    {ic:'🔁',t:'同一次癌症做了 2 次基因檢測',calc:'只給一次',pay:150000},
    {ic:'🩺',t:'健康人自費做癌症風險基因篩檢',calc:'沒有確診癌症',pay:0,zero:'不賠'}],
  src:['CNR DM 公版 113.09.23','CNR 保單條款 113.09.23','CNR 投保規則 115.10.12','CNR 費率表']};
})();
