/* HLR2 金享福住院醫療定額終身健康保險附約 — 取自 HLR2 DM 公版 1150122、HLR2 條款 1150122、投保規則 1140221 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const hosp=(d,n)=>d*Math.min(n,30)+d*2*Math.max(0,Math.min(n,90)-30)+d*3*Math.max(0,Math.min(n,365)-90);
(window.EXPLAIN=window.EXPLAIN||{}).HLR2={name:'金享福住院醫療定額終身健康保險附約', cat:'醫療（日額附約）', icon:'🏥', tagline:'終身住院日額：住越久給越多（31 天起 2 倍、91 天起 3 倍），繳 20 年', terms:[20], ages:[16,60],
  input:{kind:'sum', label:'住院日額', unit:'元', min:800, max:2500, step:100, def:1000},
  exLabel:c=>`日額 ${F(c.sum)} 元`,
  prem:c=>{const r=c.H.rateRider('HLR2',`20|${c.sex}`); return r?{annual:r*c.sum/100, txt:`繳 20 年・年繳 <b>NT$ ${F(r*c.sum/100)}</b>（月繳 ${F(r*c.sum/100*0.08333333)}）・共 ${F(r*c.sum/100*20)}`}:null;},
  warn:()=>'限附加於 HIY1 金享福保本；日額 ≦主約日額 2 倍；職業 1～3 類 55 歲以下最高 2,500 元（56 歲起 2,000）',
  cards:c=>{const d=c.sum; return [
    {ic:'🛏️',t:'住院醫療',big:`每天 ${F(d)} 元`,line:`第 31～90 天 ${F(d*2)}／天、第 91 天起 ${F(d*3)}／天`,sub:'同一次住院最多 365 天（精神疾病每年 90 天）'},
    {ic:'🚨',t:'加護病房',big:`每天加 ${F(d)} 元`,line:'額外再給日額 1 倍',sub:''},
    {ic:'🔥',t:'燒燙傷中心',big:`每天加 ${F(d)} 元`,line:'額外再給日額 1 倍',sub:''},
    {ic:'🧮',t:'終身累計上限',big:`${F(d*3000)} 元`,line:'日額 3,000 倍',sub:''},
    {ic:'🙌',t:'1～6 級失能免繳',big:'免繳',line:'繳費期間失能，之後保費全免',sub:'保障照樣有效'}];},
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,Math.max(c.age+40,90),[{from:c.age,to:c.age+20,label:`💰 繳 20 年・每年 ${F(c.annual)} 元`,color:'var(--c1)'},{from:c.age,to:Math.max(c.age+40,90),label:'🏥 住院日額保障終身'}],[[c.age,'投保'],[c.age+20,'繳費期滿']])}),
  examples:c=>{const d=c.sum; return [
    {ic:'🤒',t:'肺炎住院 7 天',calc:`${F(d)} × 7`,pay:hosp(d,7)},
    {ic:'🚨',t:'中風住院 45 天（含加護病房 5 天）',calc:`前 30 天 ${F(d*30)}＋15 天×2 倍 ${F(d*30)}＋加護 ${F(d*5)}`,pay:hosp(d,45)+d*5},
    {ic:'🛏️',t:'長期住院 120 天',calc:`${F(d*30)}＋${F(d*120)}＋${F(d*90)}`,pay:hosp(d,120)}];},
  src:['HLR2 DM 公版 115.01.22（30 歲女性日額 1,000 月繳 567 範例）','HLR2 保單條款 115.01.22','HLR2 投保規則 114.02.21','HLR2 費率表']};
})();
