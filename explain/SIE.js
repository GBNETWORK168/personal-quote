/* SIE 金安守護終身健康保險（手術主約）— 取自 SIE DM 公版 1150122、SIE 條款 1150122（第13～19條核對）、投保規則 1130517 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW'); const TA={20:[0,60],30:[0,50]};
(window.EXPLAIN=window.EXPLAIN||{}).SIE={name:'金安守護終身健康保險', cat:'醫療（手術主約）', icon:'🩻', tagline:'終身手術險：1,443 項手術＋70 項處置定額給付，身故或 99 歲領回保費 1.06 倍餘額', terms:[20,30], defTerm:0, ageOf:t=>TA[t]||[0,60],
  input:{kind:'sum', label:'保額', unit:'元', min:500, max:3000, step:100, def:1000},
  exLabel:c=>`保額 ${F(c.sum)} 元`,
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum/100, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum/100)}</b>（未折扣）・共 ${F(r*c.sum/100*c.term)}`}:null;},
  warn:()=>'SIE＋SJR1 等手術險累計 ≦3,000 元（壽險＞200 萬且職業 1、2 類 4,000 元）；不算住院日額',
  cards:c=>[
    {ic:'🔪',t:'手術醫療',big:`${F(c.sum)} ～ ${F(c.sum*90)} 元`,line:'保額 × 手術倍數（1～90 倍）',sub:'同次同部位多項手術取最高一項'},
    {ic:'💉',t:'特定處置',big:`${F(c.sum*0.2)} ～ ${F(c.sum*40)} 元`,line:'保額 × 處置倍數（0.2～40 倍）',sub:'14 天內同項處置算一次'},
    {ic:'🧮',t:'手術＋處置終身上限',big:`${F(c.sum*1800)} 元`,line:'保額 1,800 倍',sub:''},
    {ic:'🕊️',t:'身故／99 歲祝壽',big:`${F(c.tot*1.06)} 元 − 已領`,line:'年繳保費總和 ×1.06，扣掉已領的手術、處置金',sub:c.age<15?'未滿 15 足歲身故改給喪葬費用':'領完契約結束'},
    {ic:'🙌',t:'失能免繳保費',big:'免繳',line:'繳費期間完全失能、或意外 2～6 級失能',sub:'保障照樣有效'}],
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,99,[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)} 元`,color:'var(--c1)'},{from:c.age,to:99,label:'🔪 手術／處置保障到 99 歲'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[99,'祝壽']])}),
  examples:c=>[
    {ic:'👶',t:'剖腹產術（10 倍）',calc:`${F(c.sum)} × 10`,pay:c.sum*10},
    {ic:'🦵',t:'十字韌帶重建術（15 倍）',calc:`${F(c.sum)} × 15`,pay:c.sum*15},
    {ic:'🫀',t:'冠狀動脈繞道手術－二條血管（50 倍）',calc:`${F(c.sum)} × 50`,pay:c.sum*50},
    {ic:'🎂',t:`繳費期滿後一路沒用到，99 歲領祝壽金`,calc:`${F(c.tot)} × 1.06`,pay:c.tot*1.06,lbl:'領'}],
  src:['SIE DM 公版 115.01.22（常見手術／處置倍數摘錄）','SIE 保單條款 115.01.22（第13～19條）','SIE 投保規則 113.05.17','SIE 費率表 113.05.17']};
})();
