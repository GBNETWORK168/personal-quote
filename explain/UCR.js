/* UCR 醫樣安心重大疾病一年定期健康保險附約 — 取自 UCR DM 公版 1130923、UCR 條款 1130923、投保規則 1120928 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).UCR={name:'醫樣安心重大疾病一年定期健康保險附約', cat:'重大疾病', icon:'🫀', tagline:'一年期重大疾病：7 項重大疾病＋特定傷病一次給保額，保證續保到 70 歲', ages:[0,50],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:200, step:10, def:100},
  prem:c=>{const f=c.H.rateRider('UCR',`f|${c.sex}`); if(f==null) return null; const R=(window.RIDER_RATES||{}).UCR, rr=R&&R.t[`r|${c.sex}`], n=rr&&rr[1][c.age+1-rr[0]];
    return {annual:f*c.sum, txt:`首年年繳 <b>NT$ ${F(f*c.sum)}</b>${n!=null?`・第 2 年續保約 ${F(n*c.sum)}`:''}（每年依年齡重算）`};},
  warn:()=>'首年重度癌症只給 10%（首年費率也較低）；累計最高 200 萬；子女保證續保到 23 歲',
  cards:c=>[
    {ic:'🎗️',t:'重度癌症',big:`${F(c.S)} 元`,line:'續保年度確診給保額',sub:`投保當年度：${F(c.S*0.1)} 元（10%）`},
    {ic:'❤️',t:'其他重大疾病',big:`${F(c.S)} 元`,line:'心肌梗塞（重度）、冠狀動脈繞道、器官移植、腦中風後障礙（重度）、末期腎病變、癱瘓（重度）',sub:'等待期 90 天（意外所致不受限）'},
    {ic:'🩺',t:'特定傷病',big:`${F(c.S)} 元`,line:'心臟瓣膜開心手術、主動脈置換、腦動脈瘤開顱、嚴重頭部創傷、嚴重三度燒燙傷等',sub:'等待期 30 天'},
    {ic:'1️⃣',t:'只賠一次',big:'領一項就結束',line:'重大疾病或特定傷病給付其中一項後附約終止',sub:''}],
  tl:c=>c.age>70?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,70,[{from:c.age,to:c.age+1,label:'1️⃣ 投保當年度：重度癌症給 10%',color:'var(--c1)'},{from:c.age+1,to:70,label:'🔁 一年一保・保證續保到 70 歲'}],[[c.age,'投保'],[70,'續保到']])}),
  examples:c=>[
    {ic:'🎗️',t:`投保當年度確診重度${CX(c.sex,c.age)}`,calc:`${F(c.S)} × 10%`,pay:c.S*0.1},
    {ic:'🎗️',t:`續保第 3 年確診重度${CXD(CX(c.sex,c.age+3),CX(c.sex,c.age))}`,calc:`保額 ${F(c.S)}`,pay:c.S},
    {ic:'🧠',t:'腦中風滿 6 個月後仍有重度障礙',calc:`保額 ${F(c.S)}`,pay:c.S}],
  src:['UCR DM 公版 113.09.23','UCR 保單條款 113.09.23','UCR 投保規則 112.09.28','UCR 費率表']};
})();
