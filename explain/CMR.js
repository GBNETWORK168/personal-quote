/* CMR 愛精準防癌定期健康保險附約（標靶）— 取自 CMR DM 公版 1130923、CMR 條款 1130923、投保規則 1151012 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const cyc=c=>{const b=[];let a=c.age;while(a<=71&&b.length<5){b.push(a);a+=10;}return b;};
(window.EXPLAIN=window.EXPLAIN||{}).CMR={name:'愛精準防癌定期健康保險附約（標靶）', cat:'防癌', icon:'🎯', tagline:'罹癌後接受標靶治療，一次給付保額（含原位癌、不分期別）', ages:[30,61],
  input:{kind:'sum', label:'保額', unit:'萬', min:30, max:60, step:10, def:30},
  prem:c=>{const r=c.H.rateRider('CMR',`${c.sex}`); return r?{annual:r*c.sum/10, txt:`年繳 <b>NT$ ${F(r*c.sum/10)}</b>・10 年保費固定，續保時依年齡重算`}:null;},
  warn:()=>'須與 SDG／SDH／SDJ／SDN 等重大傷病主約，或 CWR4、PCC5、HSV、HSY 同一保單投保；限主被保險人及配偶；同一人限 1 張',
  cards:c=>[
    {ic:'🎯',t:'癌症標靶治療',big:`${F(c.S)} 元`,line:'確診癌症（含原位癌）並實際在醫院接受標靶治療',sub:'一次給付，給付後附約結束'},
    {ic:'⏳',t:'等待期',big:'90 天',line:'生效 90 天後確診才賠',sub:'續保不再重算等待期'},
    {ic:'🔁',t:'10 年保證續保',big:'續保到 71 歲',line:'每 10 年續保一次，續保時年齡 ≦71 歲',sub:'主約剩餘期間不足 10 年不能續保'}],
  tl:c=>{const b=cyc(c); return {title:'📈 保障期間（每 10 年保證續保）',svg:EXPLAIN_TL(c,b[b.length-1]+10,b.map((a,i)=>({from:a,to:a+10,label:`${i?'🔁 續保':'🎯 投保'} ${a}～${a+10} 歲`,color:i?'var(--c2)':'var(--c1)'})),[[c.age,'投保'],[b[b.length-1]+10,'']])};},
  examples:c=>[
    {ic:'🫁',t:'確診肺腺癌，醫師安排標靶藥物',calc:`保額 ${F(c.S)}`,pay:c.S},
    {ic:'🎗️',t:'乳癌（HER2 陽性）接受標靶治療',calc:`保額 ${F(c.S)}`,pay:c.S},
    {ic:'🔪',t:'確診初期癌症，只開刀沒有做標靶',calc:'沒有接受標靶治療',pay:0,zero:'不賠（交給防癌險、重大傷病險）'}],
  src:['CMR DM 公版 113.09.23','CMR 保單條款 113.09.23','CMR 投保規則 115.10.12（搭售限制）','CMR 費率表']};
})();
