/* v1.39 CIA 豪愛守護（男）／CIB 真馨守護（女）防癌終身健康保險 — 取自 CIA／CIB DM 公版 115.10.23、保單條款樣張 115.10.23、投保規則 115.10.23 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const TA={10:[0,65],20:[0,55],30:[0,45]};
function mk(code,sex,o){return {name:o.name, cat:'防癌', icon:sex==1?'💙':'💗', sexOnly:sex, tagline:o.tag, terms:[10,20,30], defTerm:1, ageOf:t=>TA[t]||TA[10],
  input:{kind:'sum', label:'保額', unit:'萬', min:50, max:500, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  warn:()=>'不得附加防癌險附約；與其他保額型癌症險（CLX、CLZ…）累計 ≦500 萬；本險無解約金',
  cards:c=>[
    {ic:'🔬',t:'初期／輕度癌症',big:`${F(c.S*0.1)} 元`,line:'第 2 年起首次確診，給保額 10%（限 1 次）',sub:'第 1 年：年繳保費總和 ×1.06'},
    {ic:'🎗️',t:'重度癌症',big:`${F(c.S)} 元`,line:'第 2 年起首次確診，給保額與年繳總和×1.06 取高（扣已領初期金）',sub:'之後保費全免、保障照樣有效'},
    {ic:sex==1?'♂️':'♀️',t:'特定癌症加碼',big:`最高＋${F(c.S*0.5)} 元`,line:o.sc,sub:'第 2 年 10%，每年加 10%，第 6 年起 50%'},
    {ic:'🔧',t:'特定手術',big:`${F(c.S*0.02)} 元`,line:o.op,sub:'保額 2%（限 1 次）'},
    {ic:'🩺',t:'特定傷病',big:`${F(c.S*0.1)} 元`,line:'嚴重頭部創傷、嚴重第三度燒燙傷（意外）',sub:'保額 10%（限 1 次）'},
    {ic:'🎁',t:'身故或 95 歲祝壽',big:`${F(c.tot*1.06)} 元`,line:'年繳保費總和 × 1.06，扣掉已領保險金',sub:'終身保障；未滿 15 足歲身故退還所繳保費'},
    {ic:'🙌',t:'保費豁免',big:'免繳',line:'重度癌症或意外 1～6 級失能',sub:'之後續期保費全免，契約繼續有效'}],
  tl:c=>({title:'📈 保障終身（到 95 歲）',svg:EXPLAIN_TL(c,95,[{from:c.age,to:c.payEnd,label:`💰 繳費 ${c.term} 年（重度癌症可免繳）`},{from:c.age,to:c.age+1,label:'⏳ 第 1 年：給年繳總和×1.06',color:'#e8a33d'},{from:c.age+1,to:c.age+6,label:'📶 特定癌症加碼 10%→50%',color:'#c084fc'},{from:c.age+6,to:95,label:`🎗️ 重度癌症＋特定癌症＝${F(c.S*1.5)} 元`,color:'#9aa7b5'}],[[c.age,'投保'],[c.payEnd,'繳完'],[95,'祝壽']])}),
  examples:c=>{const ex=[{ic:'🎗️',t:`第 6 年後確診第二期${o.ex}`,calc:`重度 ${F(c.S)} ＋ 特定癌症 50% ${F(c.S*0.5)}`,pay:Math.max(c.S,c.tot*1.06)+c.S*0.5,note:'續期保費豁免'},
    {ic:'🔧',t:o.exOp,calc:`保額 ${c.sum} 萬 × 2%`,pay:c.S*0.02},
    {ic:'🚗',t:'車禍嚴重頭部創傷成植物人',calc:`保額 ${c.sum} 萬 × 10%`,pay:c.S*0.1}];
    const net=c.tot*1.06-c.S*0.02;
    ex.push({ic:'🎁',t:'活到 95 歲（只領過特定手術）',calc:`${F(c.tot)} × 1.06 − ${F(c.S*0.02)}`,pay:Math.max(0,net),lbl:'領回'});
    return ex;},
  src:o.src};}
const E=window.EXPLAIN=window.EXPLAIN||{};
E.CIA=mk('CIA',1,{name:'豪愛守護防癌終身健康保險',tag:'新版男性防癌（終身）：攝護腺、大腸等 9 項特定癌症最高給保額 1.5 倍，0 歲起可投保',
  sc:'結腸、直腸、肛門、陰莖、攝護腺、睪丸、膀胱等 9 項',op:'攝護腺／前列腺相關 8 項手術',ex:'大腸癌',exOp:'60 歲經尿道攝護腺切除術',
  src:['CIA DM 公版 115.10.23（30 歲男 100 萬 20 年 年繳 30,000 範例）','CIA 保單條款樣張 115.10.23','CIA 投保規則 115.10.23','CIA 費率表']});
E.CIB=mk('CIB',2,{name:'真馨守護防癌終身健康保險',tag:'新版女性防癌（終身）：乳癌、子宮頸、卵巢、皮膚等 11 項特定癌症最高給保額 1.5 倍，0 歲起可投保',
  sc:'乳房、子宮頸、子宮體、卵巢、皮膚等 11 項',op:'尿失禁、骨盆底重建、子宮懸吊等 14 項手術',ex:'乳癌',exOp:'60 歲尿失禁做陰道懸吊術',
  src:['CIB DM 公版 115.10.23（30 歲女 100 萬 20 年 年繳 29,300 範例）','CIB 保單條款樣張 115.10.23','CIB 投保規則 115.10.23','CIB 費率表']});
})();
