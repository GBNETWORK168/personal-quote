/* SJR1 增守護健康保險附約（手術）— 取自 SJR1 DM 公版 1130923、SJR1 條款 1130923、投保規則 1120701 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).SJR1={name:'增守護健康保險附約（手術）', cat:'醫療（手術附約）', icon:'🔪', key30:(c,K)=>[[`動手術依項目領 ${K[0].big}`,0],[`特定處置領 ${K[1].big}`,1],['保障到 90 歲',3]], tagline:'動手術按倍數定額給付：1,443 項手術＋44 項特定處置', ages:[0,65],
  input:{kind:'sum', label:'保額', unit:'元', min:800, max:3000, step:100, def:1000},
  exLabel:c=>`保額 ${F(c.sum)} 元`,
  prem:c=>{const r=c.H.rateRider('SJR1',`${c.sex}`); return r?{annual:r*c.sum/100, txt:`年繳 <b>NT$ ${F(r*c.sum/100)}</b>（未折扣）・繳到 90 歲`}:null;},
  warn:()=>'SIE＋SJR1 等手術險累計 ≦3,000 元（壽險＞200 萬且職業 1、2 類 4,000 元）；不算住院日額',
  cards:c=>[
    {ic:'🔪',t:'手術醫療',big:`${F(c.sum)} ～ ${F(c.sum*90)} 元`,line:'保額 × 條款附表手術倍數（1～90 倍）',sub:'同次同部位多項手術取最高一項'},
    {ic:'💉',t:'特定處置',big:`${F(c.sum*0.2)} ～ ${F(c.sum*40)} 元`,line:'保額 × 處置倍數（0.2～40 倍）',sub:'14 天內同項處置算一次'},
    {ic:'🧮',t:'終身累計上限',big:`${F(c.sum*1300)} 元`,line:'各項合計最多保額 1,300 倍',sub:''},
    {ic:'📅',t:'保到 90 歲',big:'90 歲屆滿',line:'繳費期間同保障期間，無解約金',sub:'疾病等待期 30 天'}],
  tl:c=>c.age>65?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,90,[{from:c.age,to:90,label:`🔪 手術／處置定額給付・每年繳 ${F(c.annual)} 元`}],[[c.age,'投保'],[90,'屆滿']])}),
  examples:c=>{const A=n=>Math.max(n,c.age+1); /* v1.48：倍數僅用 DM 摘錄表；兒童無摘錄倍數，改標成年後年齡 */ return [
    {ic:'👁️',t:`${A(65)} 歲白內障線狀摘出術（5 倍）`,calc:`${F(c.sum)} × 5`,pay:c.sum*5},
    ...(c.sex===2?[{ic:'👶',t:`${A(30)} 歲剖腹產（10 倍）`,calc:`${F(c.sum)} × 10`,pay:c.sum*10}]:[]),
    {ic:'🫀',t:`${A(55)} 歲心導管合併支架置放（特定處置 40 倍）`,calc:`${F(c.sum)} × 40`,pay:c.sum*40},
    {ic:'🦵',t:`${A(70)} 歲人工全膝關節再置換（40 倍）`,calc:`${F(c.sum)} × 40`,pay:c.sum*40}];},
  src:['SJR1 DM 公版 113.09.23（常用手術／處置倍數摘錄表）','SJR1 保單條款 113.09.23','SJR1 投保規則 112.07.01','SJR1 費率表 110.07.01']};
})();
