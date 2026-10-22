/* CWR4 愛鑫安防癌終身健康保險附約 — 取自 CWR4 DM 公版 1151012、CWR4 條款 1151012（附表給付金額核對）、投保規則 1151012 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).CWR4={name:'愛鑫安防癌終身健康保險附約', cat:'防癌', icon:'🎗️', tagline:'終身防癌：確診一次金＋住院、手術、門診、放化療分項給付，第 21 年起一次金 1.5 倍', terms:[10,15,20], defTerm:2, ages:[0,70],
  input:{kind:'sum', label:'投保單位', unit:'單位', min:1, max:5, step:1, def:1},
  exLabel:c=>`${c.sum} 單位`,
  prem:c=>{const r=c.H.rateRider('CWR4',`${c.term}|${c.sex}`); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  warn:()=>'累計最高 5 單位；僅可附加終身型主約（不含癌症、投資型、萬能型）；等待期 90 天',
  cards:c=>{const u=c.sum; return [
    {ic:'🎗️',t:'罹患癌症（重度）',big:`${F(50000*u)} 元`,line:`第 21 保單年度起 ${F(75000*u)} 元`,sub:`初期／輕度：${F(7500*u)} 元（第 21 年起 ${F(11250*u)}）；限一次`},
    {ic:'🛏️',t:'癌症住院',big:`每天 ${F(1500*u)} 元`,line:`同一次住院第 91 天起每天 ${F(2250*u)} 元`,sub:`出院療養每天 ${F(600*u)} 元`},
    {ic:'🔪',t:'癌症手術',big:`每次 ${F(15000*u)} 元`,line:'重度／輕度癌症外科切除手術',sub:`初期癌症每次 ${F(2250*u)} 元；14 天內同部位算一次`},
    {ic:'☢️',t:'放射線／化學治療',big:`每天 ${F(1000*u)} 元`,line:`癌症門診每天 ${F(500*u)} 元`,sub:'口服化療每次領藥算 1 天'},
    {ic:'🩸',t:'白血病骨髓／幹細胞移植',big:`${F(50000*u)} 元`,line:'限一次',sub:''},
    {ic:'🧮',t:'各項合計總限額',big:`${F(2000000*u)} 元`,line:'終身累計',sub:''}];},
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,Math.max(c.age+30,90),[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)} 元`,color:'var(--c1)'},{from:c.age,to:Math.max(c.age+30,90),label:'🎗️ 防癌保障終身'},{from:c.age+20,to:Math.max(c.age+30,90),label:'⬆️ 第 21 年起罹癌一次金 1.5 倍'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[c.age+20,'第21年']])}),
  examples:c=>{const u=c.sum; return [
    {ic:'🎗️',t:`第 5 年確診${CX(c.sex,c.age+5)}（重度），住院 10 天開刀，再化療 12 天`,calc:`一次金 ${F(50000*u)}＋住院 ${F(15000*u)}＋療養 ${F(6000*u)}＋手術 ${F(15000*u)}＋化療 ${F(12000*u)}`,pay:98000*u},
    {ic:'🎗️',t:`第 25 年確診${CXD(CX(c.sex,c.age+25),CX(c.sex,c.age+5))}（重度）`,calc:`一次金 ${F(75000*u)}（第 21 年起 1.5 倍）`,pay:75000*u,note:'另依住院、手術、放化療天數分項給付'},
    {ic:'🔬',t:'確診原位癌（初期），門診切除',calc:`一次金 ${F(7500*u)}＋手術 ${F(2250*u)}`,pay:9750*u}];},
  src:['CWR4 DM 公版 115.10.12','CWR4 保單條款 115.10.12（附表給付金額）','CWR4 投保規則 115.10.12','CWR4 費率表']};
})();
