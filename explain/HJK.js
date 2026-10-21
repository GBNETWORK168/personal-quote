/* HJK 日日心安一年期住院醫療健康保險附約 — 取自 HJK DM 公版 1140811、HJK 條款 1140811、投保規則 1140602 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).HJK={name:'日日心安一年期住院醫療健康保險附約', cat:'醫療（日額附約）', icon:'🏨', tagline:'一年期住院日額：保費便宜，加護病房、燒燙傷、癌症住院再加給', ages:[0,70],
  input:{kind:'sum', label:'住院日額', unit:'元', min:500, max:3000, step:100, def:1000},
  exLabel:c=>`日額 ${F(c.sum)} 元`,
  prem:c=>{const r=c.H.rateRider('HJK',`${c.sex}`); return r?{annual:r*c.sum/100, txt:`今年年繳 <b>NT$ ${F(r*c.sum/100)}</b>（一年期，每年依年齡重算）`}:null;},
  warn:()=>'職業 1～3 類日額最高 3,000 元、4～6 類 2,500 元；計入住院日額累計限額',
  cards:c=>{const d=c.sum; return [
    {ic:'🛏️',t:'住院醫療',big:`每天 ${F(d)} 元`,line:`第 31 天起每天 ${F(d*2)} 元`,sub:'同一次住院最多 365 天（精神疾病每年 90 天）'},
    {ic:'🏠',t:'出院後療養',big:`每天 ${F(d*0.5)} 元`,line:'日額 50% × 住院給付天數',sub:'同一次住院最多 90 天'},
    {ic:'🚨',t:'加護病房',big:`每天加 ${F(d*2)} 元`,line:'日額 2 倍',sub:'最多 90 天'},
    {ic:'🔥',t:'燒燙傷中心',big:`每天加 ${F(d*2)} 元`,line:'日額 2 倍',sub:'最多 90 天'},
    {ic:'🎗️',t:'癌症住院',big:`每天加 ${F(d*0.5)} 元`,line:'日額 50%（含原位癌）',sub:'同一次住院最多 30 天'},
    {ic:'🩺',t:'住院前後門診',big:`每天 ${F(d*0.5)} 元`,line:'日額 50% × 門診天數',sub:'同一天多次門診算 1 天'}];},
  tl:c=>c.age>80?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,80,[{from:c.age,to:80,label:'🔁 一年一保・保證續保到 80 歲（子女到 23 歲）'}],[[c.age,'投保'],[80,'續保到']])}),
  examples:c=>{const d=c.sum; return [
    {ic:'🤒',t:'肺炎住院 5 天',calc:`住院 ${F(d)}×5 ＋ 療養 ${F(d*0.5)}×5`,pay:d*5+d*0.5*5},
    {ic:'🎗️',t:'癌症住院 10 天（含加護病房 3 天）',calc:`住院 ${F(d*10)}＋療養 ${F(d*5)}＋癌症 ${F(d*5)}＋加護 ${F(d*6)}`,pay:d*10+d*5+d*5+d*6},
    {ic:'🩺',t:'住院前後回診 4 天',calc:`${F(d*0.5)} × 4`,pay:d*0.5*4}];},
  src:['HJK DM 公版 114.08.11','HJK 保單條款 114.08.11','HJK 投保規則 114.06.02','HJK 費率表 114.06.02']};
})();
