/* OLA6 金來寶小額終身壽險 — 取自 OLA6 DM 公版 1150101、OLA6 條款 1150101、投保規則 1150101 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW'); const TA={6:[0,84],10:[0,75],15:[0,65],20:[0,60]};
(window.EXPLAIN=window.EXPLAIN||{}).OLA6={name:'金來寶小額終身壽險', cat:'壽險', icon:'🌱', tagline:'小額終身壽險：0～84 歲都能買，保費比一般終身壽險便宜', terms:[6,10,15,20], defTerm:3, ageOf:t=>TA[t]||[0,84],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:90, step:5, def:50},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  warn:()=>'OLA 系列＋同業小額終老累計 ≦90 萬、每人限 4 張',
  cards:c=>[
    {ic:'🕊️',t:'身故／完全失能（第 4 年起）',big:`${F(c.S)} 元`,line:'第 4 保單年度起賠保額',sub:c.age<15?'未滿 15 足歲身故改給喪葬費用':''},
    {ic:'🌱',t:'第 1～3 年',big:'已繳保費 × 1.025',line:'前 3 年身故／完全失能，退還已繳保費再加 2.5%',sub:`年繳：第 3 年約 ${F(c.annual*3*1.025)} 元`},
    {ic:'🎂',t:'110 歲祝壽',big:`${F(c.S)} 元`,line:'活到保險年齡 110 歲領保額，契約結束',sub:'三項給付只領一項'},
    {ic:'💰',t:'繳費年期 4 選 1',big:`${c.term} 年繳完`,line:'6／10／15／20 年期，保障終身',sub:'轉帳／信用卡繳費折 1%'}],
  tl:c=>({title:'📈 一生時間軸',svg:EXPLAIN_TL(c,110,[{from:c.age,to:c.payEnd,label:`💰 繳費 ${c.term} 年`},{from:c.age,to:c.age+3,label:'🌱 前 3 年：已繳 ×1.025',color:'#e8a33d'},{from:c.age+3,to:110,label:`🕊️ 第 4 年起身故賠 ${F(c.S)}`,color:'#9aa7b5'}],[[c.age,'投保'],[c.payEnd,'繳完'],[110,'祝壽']])}),
  examples:c=>{const ex=[{ic:'🌱',t:'投保第 2 年身故',calc:`${F(c.annual)} × 2 年 × 1.025`,pay:c.annual*2*1.025,note:'以年繳標準費率計'}];
    ex.push({ic:'🕊️',t:`${c.age+10} 歲（第 11 年）身故`,calc:`保額 ${c.sum} 萬`,pay:c.S,note:`已繳 ${F(c.annual*Math.min(10,c.term))} 元`});
    ex.push({ic:'🎂',t:'活到 110 歲',calc:`祝壽保險金＝保額`,pay:c.S,note:`總繳 ${F(c.tot)} 元`});return ex;},
  src:['OLA6 DM 公版 115.01.01','OLA6 保單條款 115.01.01','OLA6 投保規則 115.01.01']};
})();
