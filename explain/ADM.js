/* ADM 安鑫護意外傷害住院醫療保險附約 — 取自 ADM DM 公版 1150331、ADM 條款 1150331（第8條骨折日數表核對）、投保規則 1150331 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).ADM={name:'安鑫護意外傷害住院醫療保險附約', cat:'意外傷害附約', icon:'🚑', tagline:'意外住院按天數給日額；骨折沒住院也按骨折日數給一半', ages:[0,70],
  input:{kind:'sum', label:'傷害醫療日額', unit:'元', min:500, max:2000, step:100, def:2000},
  exLabel:c=>`日額 ${F(c.sum)} 元`,
  prem:c=>{const R=(window.RIDER_RATES||{}).ADM; const r=R&&R.t['1'][1][0]; return r?{annual:r*c.sum/100, txt:`今年年繳 <b>NT$ ${F(r*c.sum/100)}</b>（職業第 1 類，一年期）`}:null;},
  warn:()=>'累計最高日額 2,000 元；保費依職業類別；沒有意外身故給付',
  cards:c=>{const d=c.sum; return [
    {ic:'🛏️',t:'意外住院',big:`每天 ${F(d)} 元`,line:'按實際住院天數',sub:'同一事故最多 90 天'},
    {ic:'🦴',t:'骨折未住院／住院天數不足',big:`最高 ${F(d*30)} 元`,line:'骨折別表日數 × 日額 × 1/2',sub:'不完全骨折 1/4、骨骼龜裂 1/8；合計天數以骨折別表為上限'},
    {ic:'🚶',t:'意外門診手術',big:`每次 ${F(d)} 元`,line:'給日額 1 倍',sub:'每次事故一次'}];},
  tl:c=>c.age>75?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,75,[{from:c.age,to:75,label:'🔁 一年一保・續保到 75 歲（子女到 23 歲）'}],[[c.age,'投保'],[75,'續保到']])}),
  examples:c=>{const d=c.sum; return [
    {ic:'🛵',t:'車禍住院 6 天',calc:`${F(d)} × 6`,pay:d*6},
    {ic:'✋',t:'跌倒橈骨完全骨折（28 天），打石膏沒住院',calc:`${F(d)} × 28 × 1/2`,pay:d*14},
    {ic:'🩹',t:'意外受傷，在門診接受手術',calc:`${F(d)} × 1`,pay:d}];},
  src:['ADM DM 公版 115.03.31（30 歲男日額 2,000 年繳 1,060 範例）','ADM 保單條款 115.03.31（第8條骨折日數）','ADM 投保規則 115.03.31','ADM 費率表 115.03.31']};
})();
