/* SWB5 終身重大疾病暨特定傷病保險 — 取自 SWB5 DM、條款、投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元';
(window.EXPLAIN=window.EXPLAIN||{}).SWB5={name:'終身重大疾病暨特定傷病保險', cat:'重大疾病', icon:'❤️', tagline:'33 項重大疾病／特定傷病終身保障；第二類再加 50%；失能還有每年生活扶助', terms:[20], ages:[0,60],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:1000, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`20 年繳・年繳 <b>${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*20)}`}:null;},
  warn:c=>c.age<=15?'15 歲（含）以下累計最高 200 萬':'',
  cards:c=>[
    {ic:'❤️',t:'第一類 重大疾病／特定傷病',big:F(Math.max(c.S,c.tot*1.1)),line:'保額與年繳總和×1.1 取高',sub:'33 項，一次給'},
    {ic:'➕',t:'第二類 再加 50%',big:'＋'+F(c.S*0.5),line:'腦中風後障礙重度、癱瘓重度、嚴重巴金森、嚴重阿茲海默、嚴重頭部創傷等 9 項',sub:''},
    {ic:'🔹',t:'癌症（輕度）',big:F(c.S*0.05),line:'保額 5%，給一次，契約繼續',sub:''},
    {ic:'♿',t:'完全失能生活扶助',big:F(c.S*0.05)+'/年',line:'完全失能後每年保單週年日給保額 5%，到 99 歲',sub:'完全失能及 2～6 級失能免繳'},
    {ic:'🕊️',t:'身故／99 歲祝壽',big:F(c.tot*1.1),line:'給年繳總和×1.1（當年度保險金額）',sub:''}],
  tl:c=>({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,99,[{from:c.age,to:c.payEnd,label:`💰 繳 20 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:99,label:'❤️ 重大疾病／特定傷病終身保障'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[99,'祝壽']])}),
  examples:c=>[
    {ic:'🔹',t:'第 5 年確診原位癌（輕度）',calc:'保額 5%',pay:c.S*0.05},
    {ic:'🧠',t:'第 20 年腦中風後重度障礙（第二類）',calc:'保額 ＋ 50%',pay:Math.max(c.S,c.tot*1.1)+c.S*0.5},
    {ic:'🎁',t:'健康活到 99 歲',calc:`年繳總和 ${F(c.tot)} ×1.1`,pay:c.tot*1.1,lbl:'領'}],
  src:['SWB5 DM 公版','SWB5 保單條款','SWB5 投保規則']};
})();
