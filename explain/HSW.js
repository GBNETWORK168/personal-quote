/* HSW 愛實在一年期防癌醫療（HSW1/2/3，具自負額癌症實支）— 取自 HSW DM 公版 1140826、HSW 條款 1130819、投保規則 1130819 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const L={1:{d:100000,m:300000,y:3000000},2:{d:200000,m:500000,y:4000000},3:{d:300000,m:700000,y:5000000}};
(window.EXPLAIN=window.EXPLAIN||{}).HSW={name:'愛實在一年期防癌醫療健康保險附約', cat:'防癌', icon:'💊', tagline:'癌症大額自費實支實付：先扣自負額，住院、門診各自補到限額', ages:[0,70],
  input:{kind:'plan', label:'計劃別', def:1, plans:[{v:1,lbl:'計劃 1'},{v:2,lbl:'計劃 2'},{v:3,lbl:'計劃 3'}]},
  prem:c=>{const r=c.H.rateRider('HSW',`${c.plan}|${c.sex}`); return r?{annual:r, txt:`HSW${c.plan}・今年年繳 <b>NT$ ${F(r)}</b>（一年期，每年依年齡重算）`}:null;},
  warn:()=>'一年期、不保證續保（本人／配偶最長到 80 歲）；等待期 90 天；只賠癌症',
  cards:c=>{const l=L[c.plan]; return [
    {ic:'🛏️',t:'癌症住院醫療費用',big:`每次最多 ${F(l.m-l.d)} 元`,line:`限額 ${F(l.m)} − 自負額 ${F(l.d)}`,sub:'病房差額、自費藥、手術費、超過健保部分等'},
    {ic:'🚶',t:'癌症門診醫療費用',big:`每天最多 ${F(l.m-l.d)} 元`,line:`同一日 限額 ${F(l.m)} − 自負額 ${F(l.d)}`,sub:'自費標靶、免疫藥等門診費用'},
    {ic:'🤝',t:'自負額可由別張補',big:'扣「自負額」或「別張已賠」較大者',line:'其他實支實付憑收據正本先賠的部分可抵自負額',sub:'沒用健保身分按 75% 計'},
    {ic:'📊',t:'每年給付總限額',big:`${F(l.y)} 元`,line:'住院＋門診合計',sub:''}];},
  tl:c=>c.age>80?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,80,[{from:c.age,to:80,label:'🔁 一年一保・最長續保到 80 歲（子女到 23 歲）'}],[[c.age,'投保'],[80,'續保到']])}),
  examples:c=>{const l=L[c.plan], cap=l.m-l.d, pay=x=>Math.min(Math.max(0,x-l.d),cap); return [
    {ic:'💉',t:'門診一次自費免疫治療 40 萬',calc:`40萬 − 自負額 ${F(l.d)}（上限 ${F(cap)}）`,pay:pay(400000),zero:'未超過自負額，不賠'},
    {ic:'🛏️',t:'住院開刀＋自費達文西，自付 35 萬',calc:`35萬 − 自負額 ${F(l.d)}（上限 ${F(cap)}）`,pay:pay(350000),zero:'未超過自負額，不賠'},
    {ic:'🚶',t:'門診自費 8 萬',calc:`未超過自負額 ${F(l.d)}`,pay:0,zero:'不賠（小額交給 HSV 等其他醫療險）'}];},
  src:['HSW1~W3 DM 公版 114.08.26（計劃別表）','HSW1-W3/HSW 保單條款 113.08.19','HSW 投保規則 113.08.19','HSW 費率表']};
})();
