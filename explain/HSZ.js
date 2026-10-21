/* HSZ 鑫安實在住院醫療終身健康保險（躉繳）— 取自 HSZ DM 公版 1150101、條款 1140721、投保規則 */
(function(){ const fm=n=>Math.round(n).toLocaleString('zh-TW'), F=n=>fm(n)+' 元';
(window.EXPLAIN=window.EXPLAIN||{}).HSZ={name:'鑫安實在住院醫療終身健康保險', cat:'醫療（實支／終身）', icon:'🏥', tagline:'40～80 歲一次繳清：住院、門診手術實支實付終身，用不完的留給家人', terms:[0], ages:[40,80],
  input:{kind:'none'}, exLabel:()=>'1 單位',
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r, txt:`躉繳（一次繳清）<b>${F(r)}</b>・1 單位`}:null;},
  warn:()=>'躉繳；醫療給付會從身故／祝壽金中扣除',
  cards:c=>[
    {ic:'🏥',t:'住院醫療費用（實支）',big:'實支實付',line:'健保自負額與健保不給付的條款項目（含超過健保給付的部分）',sub:'非健保身分給 75%'},
    {ic:'🔪',t:'門診手術費用（實支）',big:'實支實付',line:'門診手術當次的自負及自費項目',sub:''},
    {ic:'💳',t:'醫療總額',big:'最高 2,000,000 元',line:`第 1 年 ${F(c.annual*0.9)}（躉繳×90%），每年加 2%，到第 5 年 98%；第 6 年起 200 萬`,sub:'用完總額，契約結束'},
    {ic:'🕊️',t:'身故／110 歲祝壽',big:'至少 '+F(Math.max(2000000,c.annual*1.05)),line:'第 6 年起：200 萬、保單價值準備金、躉繳×1.05 取最高（祝壽至少躉繳×1.05）',sub:'扣掉已領醫療金'}],
  tl:c=>({title:'📈 一次繳清，終身實支',svg:EXPLAIN_TL(c,110,[{from:c.age,to:c.age+1,label:`💰 躉繳 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:110,label:'🏥 住院／門診手術實支實付'}],[[c.age,'投保'],[c.age+5,'第 6 年起 200 萬總額'],[110,'祝壽']])}),
  examples:c=>[
    {ic:'🦴',t:'換人工髖關節，自費醫材＋自負 18 萬',calc:'實支實付',pay:180000},
    {ic:'🕊️',t:'第 10 年身故，之前醫療領 30 萬',calc:`至少 200 萬 扣 30 萬`,pay:Math.max(2000000,c.annual*1.05)-300000}],
  src:['HSZ DM 公版 115.01.01（65 歲男 1 單位 躉繳 1,854,000 範例）','HSZ 保單條款 114.07.21','HSZ 投保規則']};
})();
