/* SWZ 真心重大疾病暨特定傷病定期健康保險附約 — 取自 SWZ DM 公版 1130923、SWZ 條款 1130923（第11～12條核對）、投保規則 1120928 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).SWZ={name:'真心重大疾病暨特定傷病定期健康保險附約', cat:'重大疾病', icon:'💗', tagline:'7 項重大疾病＋7 項特定傷病一次給保額，平準保費保到 84 歲', ages:[0,70],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:200, step:10, def:100},
  prem:c=>{const r=c.H.rateRider('SWZ',`${c.sex}`); return r?{annual:r*c.sum, txt:`年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・繳到 84 歲，保費不隨年齡調整`}:null;},
  warn:()=>'累計最高 200 萬；不可附加重疾／重大傷病／癌症主約；附約年期不得超過主約',
  cards:c=>[
    {ic:'🎗️',t:'重度癌症',big:`${F(c.S)} 元`,line:'第 2 年起確診，保額與年繳總和×1.1 取高',sub:`第 1 年：${F(c.S*0.1)} 元（10%）與年繳總和×1.1 取高`},
    {ic:'❤️',t:'其他 6 項重大疾病',big:`${F(c.S)} 元`,line:'心肌梗塞（重度）、冠狀動脈繞道、器官移植、腦中風後障礙、末期腎病變、癱瘓',sub:'第 1 年起就給全額；等待期 90 天'},
    {ic:'🩺',t:'7 項特定傷病',big:`${F(c.S)} 元`,line:'瓣膜開心手術、主動脈置換、腦動脈瘤開顱、嚴重頭部創傷、三度燒燙傷、慢性肝病合併肝衰竭、嚴重肝硬化',sub:'等待期 30 天（意外不受限）'},
    {ic:'1️⃣',t:'只賠一次',big:'領一項就結束',line:'重大疾病或特定傷病其中一項給付後附約終止',sub:''}],
  tl:c=>c.age>70?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,84,[{from:c.age,to:84,label:`💗 保到 84 歲・每年繳 ${F(c.annual)} 元`}],[[c.age,'投保'],[84,'屆滿']])}),
  examples:c=>[
    {ic:'❤️',t:'第 1 年急性心肌梗塞（重度）',calc:`保額 ${F(c.S)}`,pay:Math.max(c.S,c.annual*1.1)},
    {ic:'🎗️',t:'第 1 年確診重度癌症',calc:`${F(c.S)}×10% 與 年繳×1.1 取高`,pay:Math.max(c.S*0.1,c.annual*1.1)},
    {ic:'🍺',t:'第 6 年嚴重肝硬化',calc:`保額 ${F(c.S)}`,pay:Math.max(c.S,c.annual*6*1.1)}],
  src:['SWZ DM 公版 113.09.23','SWZ 保單條款 113.09.23','SWZ 投保規則 112.09.28','SWZ 費率表']};
})();
