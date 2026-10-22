/* HTB 換然醫新定期健康保險 — 取自 HTB DM 公版 1150101、條款 1140101、投保規則 */
(function(){ const fm=n=>Math.round(n).toLocaleString('zh-TW'), F=n=>fm(n)+' 元';
(window.EXPLAIN=window.EXPLAIN||{}).HTB={name:'換然醫新定期健康保險', cat:'特定醫療（眼耳關節）', icon:'👁️', tagline:'眼睛、耳朵、關節手術專門給付：白內障、人工電子耳、換膝蓋；保到 80 歲沒用到回饋 30%', terms:[10], ages:[30,70],
  input:{kind:'sum', label:'保額', unit:'萬', min:3, max:5, step:1, def:3},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`10 年繳・年繳 <b>${F(r*c.sum)}</b>（未折扣）・保到 80 歲`}:null;},
  warn:c=>c.age>=50?'50 歲以上保額最高 3 萬':'',
  cards:c=>[
    {ic:'👁️',t:'眼睛手術',big:F(c.S*1.5)+'/次',line:'白內障、視網膜剝離、黃斑部病變、青光眼',sub:`角膜移植 ${F(c.S*3)}；每年 2 次`},
    {ic:'👂',t:'耳朵手術',big:F(c.S*4),line:`人工電子耳；聽小骨重建、鼓室成形 ${F(c.S*2)}；鼓膜／耳膜成形 ${F(c.S*1.5)}`,sub:''},
    {ic:'🦵',t:'關節置換',big:F(c.S*3)+'/次',line:'全髖（股）關節、全膝關節置換或再置換',sub:'每年 2 次'},
    {ic:'⚠️',t:'意外失明／失聰',big:F(c.S*3),line:`意外一目失明 ${F(c.S*2)}；兩耳失聰 ${F(c.S*3)}`,sub:'各一次'},
    {ic:'🎁',t:'無理賠回饋',big:F(c.annual*10*0.3),line:'到 80 歲都沒申請，給年繳總和 30%',sub:'醫療給付總額保額×100'},
    {ic:'🕊️',t:'身故',big:'至少 '+F(Math.max(c.S,c.tot)),line:'年繳總和、保額、保價金×比率 取最高',sub:''}],
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,80,[{from:c.age,to:c.payEnd,label:`💰 繳 10 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:80,label:'👁️ 眼耳關節保障到 80 歲'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[80,'屆滿・回饋']])}),
  examples:c=>[
    {ic:'👁️',t:'兩眼分別做白內障手術',calc:`${fm(c.S*1.5)} × 2`,pay:c.S*3},
    {ic:'🦵',t:'右膝換人工關節',calc:'保額×3',pay:c.S*3},
    {ic:'🎁',t:'到 80 歲都沒用到',calc:`年繳 ${fm(c.annual)}×10×30%`,pay:c.annual*3,lbl:'領'}],
  src:['HTB DM 公版 115.01.01（40 歲男 3 萬 年繳 25,500 範例）','HTB 保單條款 114.01.01','HTB 投保規則']};
})();
