/* SDL 溢卡安心重大傷病一年定期健康保險附約 — 取自 SDL DM 公版 1140602、SDL 條款 1140602（第9～13條核對）、投保規則 1140602 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).SDL={name:'溢卡安心重大傷病一年定期健康保險附約', cat:'重大傷病', icon:'🪪', tagline:'一年期重大傷病：拿到重大傷病卡一次給保額，保證續保到 80 歲', ages:[0,65],
  input:{kind:'sum', label:'保額', unit:'萬', min:30, max:200, step:10, def:100},
  prem:c=>{const f=c.H.rateRider('SDL',`f|${c.sex}`); if(f==null) return null; const R=(window.RIDER_RATES||{}).SDL, rr=R&&R.t[`r|${c.sex}`], n=rr&&rr[1][c.age+1-rr[0]];
    return {annual:f*c.sum/10, txt:`首年年繳 <b>NT$ ${F(f*c.sum/10)}</b>${n!=null?`・第 2 年續保約 ${F(n*c.sum/10)}`:''}（每年依年齡重算）`};},
  warn:()=>'第 1 年重大傷病只給保額 10%（保費也較低）；超過 50 萬須 ≦主約可附加額度；限附加終身型主約',
  cards:c=>[
    {ic:'🪪',t:'重大傷病',big:`${F(c.S)} 元`,line:'第 2 年起確診健保重大傷病範圍，一次給保額',sub:`第 1 年：${F(c.S*0.1)} 元（10%）；慢性精神病 20%`},
    {ic:'🔥',t:'特定重大傷病加碼',big:`＋${F(c.S*0.2)} 元`,line:'燒燙傷 20% 以上、重大創傷、脊髓損傷',sub:'與重大傷病一起給'},
    {ic:'❤️',t:'特定重大疾病',big:`${F(c.S)} 元`,line:'急性心肌梗塞（重度）、冠狀動脈繞道手術',sub:'等待期 90 天'},
    {ic:'🩺',t:'特定傷病',big:`${F(c.S)} 元`,line:'主動脈外科置換、嚴重原發性肺動脈高血壓',sub:'以上任一項給付後附約結束'}],
  tl:c=>c.age>80?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,80,[{from:c.age,to:c.age+1,label:'1️⃣ 第 1 年：重大傷病給 10%',color:'var(--c1)'},{from:c.age+1,to:80,label:'🔁 第 2 年起給全額・保證續保到 80 歲'}],[[c.age,'投保'],[80,'續保到']])}),
  examples:c=>[
    {ic:'🦴',t:'投保第 1 年診斷類風濕關節炎（重大傷病）',calc:`${F(c.S)} × 10%`,pay:c.S*0.1,note:'第 1 年給 10%，附約結束'},
    {ic:'🎗️',t:`第 2 年罹患${CX(c.sex,c.age+2)}，取得重大傷病證明`,calc:`保額 ${F(c.S)}`,pay:c.S},
    {ic:'🔥',t:'續保後意外燒燙傷達 20% 以上',calc:`${F(c.S)} ＋ 20%`,pay:c.S*1.2},
    {ic:'❤️',t:'急性心肌梗塞（重度）',calc:`保額 ${F(c.S)}`,pay:c.S}],
  src:['SDL DM 公版 114.06.02（投保範例情境 1～4）','SDL 保單條款 114.06.02','SDL 投保規則 114.06.02','SDL 費率表']};
})();
