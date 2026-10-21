/* SDKA 醫靠安心重大傷病定期健康保險（續保依 SDKB）— 取自 SDKA DM 公版、條款、投保規則 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW')+' 元'; const RR=(sex,age)=>{const r=(window.RATES||{}).SDKA&&RATES.SDKA[`SDKA|10|${sex}|R`]; return r?r[1][age-r[0]]:null;};
(window.EXPLAIN=window.EXPLAIN||{}).SDKA={name:'醫靠安心重大傷病定期健康保險', cat:'重大傷病', icon:'🪪', tagline:'10 年期重大傷病，保費便宜；保證續保到 71 歲，10 年沒理賠回饋 10%', terms:[10], ages:[15,61],
  input:{kind:'sum', label:'保額', unit:'萬', min:50, max:200, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); if(!r) return null; c.r=r; const rn=c.age+10<=71?RR(c.sex,c.age+10):null; c.ren=rn?rn*c.sum:0;
    return {annual:r*c.sum, txt:`10 年期・年繳 <b>${F(r*c.sum)}</b>（未折扣）${c.ren?`・${c.age+10} 歲續保約 ${F(c.ren)}/年`:''}`};},
  warn:()=>'只能附加 AOR、CLR；續保保費依續保年齡重新計算（SDKB）',
  cards:c=>[
    {ic:'🪪',t:'重大傷病',big:F(c.S),line:'第 2 年起確診重大傷病，給保額（與年繳總和×1.06 取高）',sub:`第 1 年：年繳×1.06（${F(c.annual*1.06)}）；慢性精神病 20%`},
    {ic:'🔥',t:'特定重大傷病加碼',big:'＋'+F(c.S*0.2),line:'燒燙傷 20% 以上、重大創傷、脊髓損傷',sub:''},
    {ic:'🕊️',t:'身故／完全失能',big:F(c.S),line:'保額與年繳總和×1.06 取高',sub:'各項只給一次'},
    {ic:'🎁',t:'無理賠回饋',big:F(c.annual)},
    {ic:'🔄',t:'保證續保',big:'到 71 歲',line:'每 10 年續保，不必重新體檢',sub:c.ren?`${c.age+10} 歲續保年繳約 ${F(c.ren)}`:''}].map(x=>x.t==='無理賠回饋'?{...x,line:'每個 10 年期滿沒理賠，給該期年繳總和 10%',sub:''}:x),
  tl:c=>{const e=Math.min(81,c.age+10*Math.floor((71-c.age)/10)+10); return {title:'📈 每 10 年續保',svg:EXPLAIN_TL(c,e,[{from:c.age,to:c.age+10,label:`💰 每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:e,label:'🪪 重大傷病保障（保證續保）'}],[[c.age,'投保'],[c.age+10,'第 1 期滿・回饋'],[e,'保障結束']])};},
  examples:c=>[
    {ic:'🦴',t:'第 1 年確診類風濕關節炎',calc:`年繳 ${F(c.annual)} × 1.06`,pay:c.annual*1.06},
    {ic:'🎗️',t:'第 6 年確診癌症取得重大傷病證明',calc:`保額 ${F(c.S)}`,pay:Math.max(c.S,c.annual*6*1.06)},
    {ic:'🎁',t:'10 年平安沒理賠',calc:`年繳 ×10 年 ×10%`,pay:c.annual,lbl:'領'}],
  src:['SDKA DM 公版（30 歲男 100 萬 年繳 9,100 範例）','SDKA 保單條款','SDKA 投保規則','SDKB 續保費率']};
})();
