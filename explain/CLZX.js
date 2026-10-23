/* CLZ 豪愛無憂（男）／CLX 真馨相守（女）防癌定期健康保險 — 取自 CLZ DM 1150429、CLX DM 1150210、各條款／投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
function mk(code,sex,o){return {name:o.name, cat:'防癌', icon:sex==1?'💙':'💗', sexOnly:sex, tagline:o.tag, terms:[10,20], defTerm:1, ageOf:t=>t==10?[18,60]:[18,50],
  input:{kind:'sum', label:'保額', unit:'萬', min:50, max:300, step:10, round:1, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  cards:c=>[
    {ic:'🔬',t:'初期／輕度癌症',big:`${F(c.S*0.1)} 元`,line:'第 2 年起首次確診，給保額 10%（限 1 次）',sub:'第 1 年：年繳總和 ×1.06'},
    {ic:'🎗️',t:'重度癌症',big:`${F(c.S)} 元`,line:'第 2 年起首次確診，給保額（扣已領的初期金）',sub:'繳費期間確診，之後續期保費免繳'},
    {ic:sex==1?'♂️':'♀️',t:'特定癌症加碼',big:`最高＋${F(c.S*0.5)} 元`,line:o.sc,sub:'第 2 年 10%，每年加 10%，第 6 年起 50%'},
    {ic:'🔧',t:'特定手術',big:`${F(c.S*0.02)} 元`,line:o.op,sub:'保額 2%（限 1 次）'},
    {ic:'🩺',t:'特定傷病',big:`${F(c.S*0.1)} 元`,line:o.ill,sub:'第 2 年起，保額 10%（限 1 次）'},
    {ic:'💰',t:'身故或 89 歲滿期',big:`最高 ${F(c.tot*1.06)} 元`,line:`已繳年繳保費總和 × 1.06，扣掉已領保險金；隨繳費年數增加：第 1 年 ${F(c.annual*1.06)} → 繳費期滿 ${F(c.tot*1.06)}`,sub:'沒理賠就是保費拿回 106%（扣除已領保險金）'}],
  tl:c=>({title:'📈 保障到 89 歲',svg:EXPLAIN_TL(c,89,[{from:c.age,to:c.payEnd,label:`💰 繳費 ${c.term} 年（重度癌症可免繳）`},{from:c.age,to:c.age+1,label:'⏳ 第 1 年：給年繳總和×1.06',color:'#e8a33d'},{from:c.age+1,to:c.age+5,label:'📶 特定癌症加碼 10%→50%',color:'#c084fc'},{from:c.age+5,to:89,label:`🎗️ 重度癌症＋特定癌症＝${F(c.S*1.5)} 元`,color:'#9aa7b5'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[89,'滿期']])}),
  examples:c=>{const R=CXR(sex,c.age+5); const ex=[R.sp?{ic:'🎗️',t:`第 6 年後確診${CXT(R.x)}`,calc:`重度 ${F(c.S)} ＋ 特定癌症 50% ${F(c.S*0.5)}`,pay:c.S*1.5,note:'續期保費豁免'}:{ic:'🎗️',t:`第 6 年後確診${R.x}（重度癌症）`,calc:`重度 ${F(c.S)}`,pay:c.S,note:`${R.x}不在特定癌症清單，不加碼；續期保費豁免`},
    {ic:'🔧',t:o.exOp,calc:`保額 ${c.sum} 萬 × 2%`,pay:c.S*0.02}];
    const net=c.tot*1.06-c.S*0.02;
    ex.push({ic:'💰',t:'活到 89 歲（只領過特定手術）',calc:`${F(c.tot)} × 1.06 − ${F(c.S*0.02)}`,pay:Math.max(0,net),lbl:'領回'});
    return ex;},
  src:o.src};}
const E=window.EXPLAIN=window.EXPLAIN||{};
E.CLZ=mk('CLZ',1,{name:'豪愛無憂防癌定期健康保險',tag:'男性專屬防癌：攝護腺、大腸等特定癌症最高給保額 1.5 倍；滿期或身故時，依條款給付已繳保費',
  sc:'攝護腺、睪丸、大腸直腸、肛門、陰莖、膀胱等 9 項',op:'攝護腺／前列腺相關 8 項手術',ill:'主動脈外科置換手術、嚴重肝硬化症',ex:'大腸癌',exOp:'60 歲經尿道攝護腺切除術',
  src:['CLZ DM 公版 115.04.29','CLZ 保單條款 115.04.29','CLZ 投保規則 115.04.29']});
E.CLX=mk('CLX',2,{name:'真馨相守防癌定期健康保險',tag:'女性專屬防癌：乳癌、子宮頸、卵巢等特定癌症最高給保額 1.5 倍；滿期或身故時，依條款給付已繳保費',
  sc:'乳房、子宮頸、子宮體、卵巢、皮膚等 11 項',op:'尿失禁、骨盆底重建、子宮懸吊等 14 項手術',ill:'嚴重紅斑性狼瘡腎病變、嚴重類風濕性關節炎',ex:'乳癌',exOp:'60 歲尿失禁做陰道懸吊術',
  src:['CLX DM 公版 115.02.10','CLX 保單條款 115.02.10','CLX 投保規則 115.02.10']});
})();
