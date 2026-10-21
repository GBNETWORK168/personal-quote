/* HSV 佳實在一年期住院醫療（HSV1/2/3）— 取自 HSV DM 公版 1140221、HSV1-V3 條款 1130715、HSV 投保規則 1140221 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const L={1:{room:1000,med:100000,medTot:150000,surg:40000,op:15000,sp:7500,day:1000,yr:750000},2:{room:2000,med:200000,medTot:300000,surg:60000,op:20000,sp:10000,day:2000,yr:1000000},3:{room:3000,med:300000,medTot:450000,surg:80000,op:25000,sp:12500,day:3000,yr:1500000}};
(window.EXPLAIN=window.EXPLAIN||{}).HSV={name:'佳實在一年期住院醫療（實支實付）', cat:'醫療（實支實付附約）', icon:'🏥', tagline:'住院、手術、門診手術都能報收據；也可改選住院日額', ages:[0,70],
  input:{kind:'plan', label:'計劃別', def:2, plans:[{v:1,lbl:'計劃 1'},{v:2,lbl:'計劃 2'},{v:3,lbl:'計劃 3'}]},
  prem:c=>{const r=c.H.rateRider('HSV',`${c.plan}|${c.sex}`); return r?{annual:r, txt:`HSV${c.plan}・今年年繳 <b>NT$ ${F(r)}</b>（一年期，每年依年齡重算）`}:null;},
  warn:c=>c.plan==3?'計劃 3 限職業第 1–3 類；第 4–6 類只能投保計劃 1、2（HSV1/2/3 擇一、限 1 單位）':'',
  cards:c=>{const l=L[c.plan]; return [
    {ic:'🛏️',t:'病房費差額',big:`每天 ${F(l.room)} 元`,line:'超等病房差額、膳食費、護理費，實報實銷',sub:`加護病房／燒燙傷中心加倍 ${F(l.room*2)} 元（同次最多 7 天）`},
    {ic:'💊',t:'住院醫療雜費',big:`每次 ${F(l.med)} 元`,line:'自費藥品、醫材、檢查等 7 大類，實報實銷',sub:`住超過 30 天按天數加碼，最高 ${F(l.medTot)} 元`},
    {ic:'🔪',t:'住院手術費',big:`每次最高 ${F(l.surg*5)} 元`,line:`手術限額 ${F(l.surg)} 元 × 手術比率（4%～500%）`,sub:'同次住院多項手術分開算'},
    {ic:'🚶',t:'門診手術',big:`每次 ${F(l.op)} 元`,line:'不用住院的手術也能報',sub:'每年最多 6 次'},
    {ic:'💉',t:'特定處置',big:`每次 ${F(l.sp)} 元`,line:'門診做條款列的特定處置治療',sub:'每年最多 6 次；與門診手術同部位擇一'},
    {ic:'🫀',t:'器官移植',big:`最高 ${F(l.surg*10)} 元`,line:`心／肺／肝移植：手術限額 × 10 倍`,sub:`胰／腎／造血幹細胞 × 5 倍＝${F(l.surg*5)} 元（另加實支）`},
    {ic:'📅',t:'或選住院日額',big:`每天 ${F(l.day)} 元`,line:'沒收據也能領；與實支實付二擇一',sub:'加護病房加倍（同次最多 7 天）'},
    {ic:'🧾',t:'每年給付上限',big:`${F(l.yr)} 元`,line:'同一保單年度各項合計上限',sub:'沒有健保身分改按實際費用 75%'}];},
  tl:c=>c.age>80?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,80,[{from:c.age,to:80,label:'🔁 一年一保・保證續保到 80 歲（子女到 23 歲）'}],[[c.age,'投保'],[80,'續保到']])}),
  examples:c=>{const l=L[c.plan], ex=[];
    const room=Math.min(2500,l.room)*5, med=Math.min(120000,l.med), sum=room+med, day=l.day*5;
    ex.push({ic:'🏥',t:'住院 5 天：病房差額每天 2,500、自費醫材 12 萬',calc:`病房 ${F(room)} ＋ 雜費 ${F(med)} ＝ ${F(sum)}（日額只有 ${F(day)}，選實支較多）`,pay:Math.max(sum,day)});
    ex.push({ic:'👁️',t:'門診白內障手術自付 3 萬',calc:`門診手術限額 ${F(l.op)} 元`,pay:Math.min(30000,l.op)});
    const lim=Math.min(l.med/30*45,l.medTot);
    ex.push({ic:'🛌',t:'住院 45 天、自費醫療 50 萬',calc:`${F(l.med)} ÷ 30 × 45 天，最高 ${F(l.medTot)}`,pay:Math.min(500000,lim),note:'另可再報病房費差額'});
    return ex;},
  src:['HSV DM 公版 114.02.21','HSV1-V3/HSV 保單條款 113.07.15','HSV 投保規則 114.02.21','HSV 費率表 113.07.01']};
})();
