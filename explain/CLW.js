/* CLW 癌無憂定期健康保險（1 單位）— 取自 CLW DM 公版、CLW 條款、投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元';
(window.EXPLAIN=window.EXPLAIN||{}).CLW={name:'癌無憂定期健康保險', cat:'癌症', icon:'🎗️', tagline:'癌症一單位全包：住院、質子／粒子、標靶、免疫細胞、基因檢測、機械手臂；10 年沒理賠還有回饋', terms:[10], ages:[20,70],
  input:{kind:'none'}, exLabel:()=>'1 單位',
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r, txt:`10 年期・年繳 <b>${F(r)}</b>（未折扣）・限投保 1 單位`}:null;},
  warn:()=>'限投保 1 單位；第 1 年給付多為第 2 年起的一半',
  cards:c=>[
    {ic:'🎗️',t:'重度癌症',big:F(100000),line:'第 2 年起確診重度癌症，一次給',sub:`第 1 年：當年年繳保費與 1 萬取高（${F(Math.max(c.annual,10000))}）`},
    {ic:'🔹',t:'初期／輕度癌症',big:F(10000),line:'第 2 年起，一次給',sub:'第 1 年 5,000 元'},
    {ic:'🏥',t:'癌症住院',big:'每天 1,000 元',line:'因癌症住院，按實際住院天數',sub:''},
    {ic:'🏡',t:'重度癌症出院療養',big:F(100000),line:'第 2 年起',sub:'第 1 年 2 萬元'},
    {ic:'⚛️',t:'質子／特定粒子治療',big:'粒子 '+F(300000),line:'質子每次 3 萬（每年 10 次、累計 30 次）',sub:'第 1 年減半'},
    {ic:'💊',t:'標靶／免疫細胞',big:F(600000),line:'標靶 60 萬；第四期自體免疫細胞治療 100 萬',sub:'第 1 年減半'},
    {ic:'🧬',t:'基因檢測／機械手臂',big:'各 '+F(150000),line:'白血病、淋巴瘤造血幹細胞移植 20 萬',sub:'第 1 年減半'},
    {ic:'🎁',t:'無理賠回饋',big:F(c.annual*10*0.1),line:'10 年都沒理賠，期滿給年繳總和 10%',sub:''}],
  tl:c=>c.age>70?null:({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,c.age+10,[{from:c.age,to:c.age+10,label:`💰 每年 ${F(c.annual)}・🎗️ 癌症保障 10 年`,color:'var(--c1)'},{from:c.age,to:c.age+1,label:'第 1 年減半'}],[[c.age,'投保'],[c.age+10,'期滿回饋']])}),
  examples:c=>[
    {ic:'🎗️',t:`第 3 年確診重度${CX(c.sex,c.age+3)}，住院 10 天、出院療養`,calc:'10 萬＋住院 1,000×10＋出院療養 10 萬',pay:210000},
    {ic:'💊',t:'接著用標靶藥物治療',calc:'標靶 60 萬',pay:600000},
    {ic:'🎁',t:'10 年平安沒理賠',calc:`年繳 ${F(c.annual)} ×10 年 ×10%`,pay:c.annual,lbl:'領'}],
  src:['CLW DM 公版（40 歲男 年繳 11,600 範例）','CLW 保單條款','CLW 投保規則']};
})();
