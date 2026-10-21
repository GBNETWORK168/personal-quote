/* SWD1 重大疾病終身保險 — 取自 SWD1 DM 公版、條款、投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元';
(window.EXPLAIN=window.EXPLAIN||{}).SWD1={name:'重大疾病終身保險（輕重症）', cat:'重大疾病', icon:'❤️', tagline:'繳 10 年保終身：輕度先給 5%，重度再給保額；沒領過輕度，重度多給 5%', terms:[10], ages:[0,50],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:100, step:10, def:20},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`10 年繳・年繳 <b>${F(r*c.sum)}</b>（限年繳・未折扣）`}:null;},
  cards:c=>[
    {ic:'🔹',t:'輕度重大疾病',big:F(c.S*0.05),line:'心肌梗塞、腦中風、癌症、癱瘓（輕度），給保額 5%',sub:'給付後契約繼續有效'},
    {ic:'❤️',t:'重度重大疾病（7 項）',big:F(c.S),line:'確診重度，給保額，契約結束',sub:`從沒領過輕度：給 105%（${F(c.S*1.05)}）`}],
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,Math.max(c.age+40,85),[{from:c.age,to:c.payEnd,label:`💰 繳 10 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:Math.max(c.age+40,85),label:'❤️ 重大疾病終身保障 →'}],[[c.age,'投保'],[c.payEnd,'繳清']])}),
  examples:c=>[
    {ic:'🔹',t:'先確診輕度腦中風，之後重度癌症',calc:`5% ${F(c.S*0.05)} ＋ 保額 ${F(c.S)}`,pay:c.S*1.05},
    {ic:'❤️',t:'直接確診重度急性心肌梗塞',calc:'保額 × 105%',pay:c.S*1.05}],
  src:['SWD1 DM 公版（40 歲女 20 萬 年繳 12,080 範例）','SWD1 保單條款','SWD1 投保規則']};
})();
