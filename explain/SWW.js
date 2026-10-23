/* SWW 一年期重大疾病及特定傷病健康保險 — 取自 SWW DM、條款、投保規則；續保費率 SWW|1|sex|R */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元'; const RR=(sex,age)=>{const r=(window.RATES||{}).SWW&&RATES.SWW[`SWW|1|${sex}|R`]; return r?r[1][age-r[0]]:null;};
(window.EXPLAIN=window.EXPLAIN||{}).SWW={name:'一年期重大疾病及特定傷病健康保險', cat:'重大疾病', icon:'❤️', tagline:'一年一保、保費低：7 項重大疾病＋5 項特定傷病，保證續保到 70 歲', terms:[1], ages:[20,60],
  input:{kind:'sum', label:'保額', unit:'萬', min:30, max:200, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); if(!r) return null; const n=RR(c.sex,c.age+1); c.ren=n?n*c.sum:0; return {annual:r*c.sum, txt:`第 1 年年繳 <b>${F(r*c.sum)}</b>（未折扣）${c.ren?`・${c.age+1} 歲續保約 ${F(c.ren)}`:''}`};},
  warn:()=>'一年期，每年續保保費依當時年齡計算',
  cards:c=>[
    {ic:'❤️',t:'7 項重大疾病',big:F(c.S),line:'重度癌症、心肌梗塞、腦中風、末期腎病變、癱瘓、器官移植、冠狀動脈繞道',sub:'首年度重度癌症給保額 10%'},
    {ic:'🩺',t:'5 項特定傷病',big:F(c.S),line:'心臟瓣膜開心手術、主動脈外科置換、腦動脈瘤開顱、嚴重頭部創傷、嚴重三度燒燙傷',sub:''},
    {ic:'🕊️',t:'身故／完全失能',big:F(c.S),line:'只給一次，給付後契約結束',sub:''},
    {ic:'🔄',t:'保證續保',big:'到 70 歲',line:'每年續保不必體檢',sub:c.ren?`${c.age+1} 歲續保約 ${F(c.ren)}`:''}],
  tl:c=>({title:'📈 一年一保',svg:EXPLAIN_TL(c,70,[{from:c.age,to:c.age+1,label:`💰 第 1 年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:70,label:'🔄 保證續保到 70 歲'}],[[c.age,'投保'],[70,'續保上限']])}),
  examples:c=>[
    {ic:'🎗️',t:'第 1 年確診重度癌症',calc:'保額 10%',pay:c.S*0.1},
    ...(c.age+3>=35?[{ic:'🫀',t:'第 3 年心臟瓣膜開心手術',calc:`保額 ${F(c.S)}`,pay:c.S}]:[])],
  src:['SWW DM 公版','SWW 保單條款','SWW 投保規則','SWW 續保費率']};
})();
