/* SDG 醫保安心重大傷病終身健康保險 — 取自 SDG DM 公版 1150122、SDG 條款 1150122、投保規則 1140602 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW'); const TA={10:[0,60],15:[0,55],20:[0,50],30:[0,40]};
(window.EXPLAIN=window.EXPLAIN||{}).SDG={name:'醫保安心重大傷病終身健康保險', cat:'重大傷病', icon:'🛡️', tagline:'拿到健保重大傷病卡（22 大類 300 多項）就一次給付，不用住院', terms:[10,15,20,30], defTerm:2, ageOf:t=>TA[t]||[0,60],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:500, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  cards:c=>[
    {ic:'🪪',t:'重大傷病',big:`${F(c.S)} 元`,line:'第 2 年起確診重大傷病，一次給保額（與年繳總和×1.06 取高）',sub:'第 1 年：年繳總和 ×1.06；慢性精神病給保額 20%'},
    {ic:'🔥',t:'特定重大傷病加碼',big:`＋${F(c.S*0.2)} 元`,line:'燒燙傷 20% 以上、重大創傷、脊髓損傷，再加 20%',sub:'第 2 年起'},
    {ic:'❤️',t:'特定重大疾病',big:`${F(c.S)} 元`,line:'急性心肌梗塞（重度）、冠狀動脈繞道手術',sub:'與年繳總和×1.06 取高'},
    {ic:'🩺',t:'特定傷病',big:`${F(c.S)} 元`,line:'主動脈外科置換手術、嚴重原發性肺動脈高血壓',sub:'與年繳總和×1.06 取高'},
    {ic:'🕊️',t:'身故／完全失能',big:`至少 ${F(Math.max(c.S,c.tot*1.06))} 元`,line:'保額、年繳總和×1.06、保單價值準備金取最高',sub:c.age<15?'未滿 15 足歲身故改給喪葬費用':''},
    {ic:'🎂',t:'100 歲祝壽',big:`至少 ${F(Math.max(c.S,c.tot*1.06))} 元`,line:'活到 100 歲，保額與年繳總和×1.06 取高',sub:'以上各項只領一次，領完契約結束'},
    {ic:'🛡️',t:'意外 2～6 級失能免繳',big:'之後保費全免',line:`繳費期間（到 ${c.payEnd} 歲）意外失能 2～6 級`,sub:'只豁免主約'},
    {ic:'📆',t:'可改分期領',big:'6／12／24 個月',line:'第 2 年起確診，可約定按月分期給付',sub:'指定金額低於 20 萬或每月低於 2 萬改一次給'}],
  tl:c=>({title:'📈 一生時間軸',svg:EXPLAIN_TL(c,100,[{from:c.age,to:c.payEnd,label:`💰 繳費 ${c.term} 年・意外 2–6 級失能免繳`},{from:c.age,to:c.age+1,label:'⏳ 第 1 年：給年繳總和×1.06',color:'#e8a33d'},{from:c.age+1,to:100,label:`🪪 重大傷病給 ${F(c.S)} 元`,color:'#9aa7b5'}],[[c.age,'投保'],[c.payEnd,'繳完'],[100,'祝壽']])}),
  examples:c=>{const a=c.annual;
    return [{ic:'🎗️',t:'第 5 年確診乳癌第一期（重大傷病）',calc:`保額 ${c.sum} 萬 vs 已繳 5 年×1.06＝${F(a*5*1.06)}`,pay:Math.max(c.S,a*5*1.06)},
     {ic:'🔥',t:'第 15 年燒燙傷達全身 20%',calc:`${F(Math.max(c.S,a*Math.min(15,c.term)*1.06))} ＋ 保額 20% ${F(c.S*0.2)}`,pay:Math.max(c.S,a*Math.min(15,c.term)*1.06)+c.S*0.2},
     {ic:'❤️',t:'第 10 年冠狀動脈繞道手術',calc:`特定重大疾病，保額 ${c.sum} 萬`,pay:Math.max(c.S,a*Math.min(10,c.term)*1.06)},
     {ic:'⏳',t:'第 1 年確診重大傷病',calc:`年繳總和 ${F(a)} × 1.06`,pay:a*1.06,note:'等待期後才算'}];},
  src:['SDG DM 公版 115.01.22（投保範例情境 1–5）','SDG 保單條款 115.01.22','SDG 投保規則 114.06.02']};
})();
