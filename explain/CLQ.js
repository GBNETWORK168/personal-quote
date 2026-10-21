/* CLQ 樂活好心安癌症定期健康保險 — 取自 CLQ DM 公版、CLQ 條款 1130923、投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元'; const TA={10:[55,80],15:[55,75],20:[55,70]};
const pct=n=>n<=5?1:n<=10?1.05:n<=15?1.10:1.15, lp=n=>n<=5?0.10:n<=10?0.105:n<=15?0.11:0.115;
(window.EXPLAIN=window.EXPLAIN||{}).CLQ={name:'樂活好心安癌症定期健康保險', cat:'癌症', icon:'🎗️', tagline:'55 歲起也能買的癌症險：重度癌症一次給，年數越久給越多（最高 115%）', terms:[10,15,20], defTerm:2, ageOf:t=>TA[t],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:100, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>${F(r*c.sum)}</b>（未折扣）`}:null;},
  cards:c=>[
    {ic:'🎗️',t:'重度癌症',big:F(c.S),line:'第 2～5 年給保額；6～10 年 105%、11～15 年 110%、16～20 年 115%',sub:`第 1 年：年繳×1.06（${F(c.annual*1.06)}）`},
    {ic:'🔹',t:'初期／輕度癌症',big:F(c.S*0.1),line:'第 2～5 年保額 10%，之後 10.5%／11%／11.5%',sub:'第 1 年保額 1%'},
    {ic:'📈',t:'越久給越多',big:'最高 115%',line:`第 16 年起重度癌症 ${F(c.S*1.15)}`,sub:'各項只給一次'}],
  tl:c=>{const e=c.age+c.term; const P=[[c.age,'投保'],[c.age+1,'100%']]; if(c.term>5)P.push([c.age+5,'105%']); if(c.term>10)P.push([c.age+10,'110%']); if(c.term>15)P.push([c.age+15,'115%']); P.push([e,'期滿']);
    return {title:'📈 重度癌症給付',svg:EXPLAIN_TL(c,e,[{from:c.age,to:e,label:`💰 每年 ${F(c.annual)}・🎗️ 癌症保障 ${c.term} 年`,color:'var(--c1)'}],P)};},
  examples:c=>[
    {ic:'🎗️',t:'第 1 年確診重度癌症',calc:`年繳 ${F(c.annual)} × 1.06`,pay:c.annual*1.06},
    {ic:'🔹',t:'第 3 年確診初期乳癌',calc:'保額 10%',pay:c.S*0.1},
    {ic:'🎗️',t:`第 ${Math.min(c.term,12)} 年確診重度大腸癌`,calc:`保額 × ${pct(Math.min(c.term,12))*100}%`,pay:c.S*pct(Math.min(c.term,12))}],
  src:['CLQ DM 公版（60 歲男 100 萬 20 年 年繳 33,900 範例）','CLQ 保單條款 113.09.23','CLQ 投保規則']};
})();
