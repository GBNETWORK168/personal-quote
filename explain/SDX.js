/* 重大傷病系列 SDH 金卡安心／SDN 金卡順心／SDJ 優卡安心／FDC 美好安心（美元）／FDE 美好順心外幣附約（美元）
   取自各商品 DM 公版（SDH/SDN/SDJ/FDC 1150122、FDE 1150331）、條款（SDH/SDN/SDJ/FDC 1150122、FDE 1150331）、投保規則；
   FDE 繳費期滿後主約終止仍有效：YT 向保全科確認（2026-10-20） */
(function(){ const fm=n=>Math.round(n).toLocaleString('zh-TW');
const RT=()=>window.RATES||{}, rr=(code,key,age)=>{const r=RT()[code]&&RT()[code][key]; if(!r) return null; const v=r[1][age-r[0]]; return v==null?null:v;};
function mk(code,o){ const U=o.usd, F=n=>U?'US$ '+fm(n):fm(n)+' 元', K=o.k;
  const tot=(c,n)=>{ if(!c.annual) return 0; if(o.step2&&c.a2!=null){const s=o.step2[c.term]-1; return c.annual*Math.min(n,s)+c.a2*Math.max(0,Math.min(n,c.term)-s);} return c.annual*Math.min(n,c.term); };
  return {name:o.name, cat:U?'外幣（美元）':'重大傷病', icon:o.icon, cur:U?'USD':undefined, tagline:o.tag, terms:o.terms, defTerm:o.defTerm??0, ageOf:t=>o.TA[t]||o.TA[o.terms[0]],
  input:{kind:'sum', label:U?'保額（美元）':'保額', unit:U?'美元':'萬', min:o.min, max:o.max, step:o.step, def:o.def},
  exLabel:c=>`保額 ${F(c.S)}`,
  prem:c=>{ let r=o.rider? (c.H.rateRider(code,`${c.sex}`)) : c.H.rateMain(); if(r==null) return null; const u=U?c.sum/10000:c.sum; const a=r*u;
    let a2=null; if(o.step2){const r2=rr(code,`${code}|${c.term}|${c.sex}|2`,c.age); if(r2!=null) a2=r2*u;} c.a2=a2;
    const txt = a2!=null ? `${c.term} 年繳・第 1～${o.step2[c.term]-1} 年每年 <b>${F(a)}</b>、第 ${o.step2[c.term]} 年起每年 ${F(a2)}（未折扣）` : `${c.term} 年繳・年繳 <b>${F(a)}</b>（未折扣）・共 ${F(a*c.term)}`;
    return {annual:a, txt};},
  warn:()=>o.warn,
  cards:c=>{ if(U) c.S=c.sum; const T=tot(c,c.term); const L=[
    {ic:'🪪',t:'重大傷病',big:F(c.S),line:`第 2 年起確診健保重大傷病範圍，給保額（與年繳總和×${K} 取高）`,sub:`第 1 年：年繳保費×${K}；慢性精神病給保額 20%`},
    {ic:'🔥',t:'特定重大傷病加碼',big:'＋'+F(c.S*0.2),line:'燒燙傷 20% 以上、重大創傷、脊髓損傷，再加保額 20%',sub:''},
    {ic:'❤️',t:'特定重大疾病',big:F(c.S),line:'急性心肌梗塞（重度）、冠狀動脈繞道手術',sub:`與年繳總和×${K} 取高；等待期 90 天`},
    {ic:'🩺',t:'特定傷病',big:F(c.S),line:'主動脈外科置換、嚴重原發性肺動脈高血壓',sub:`與年繳總和×${K} 取高`}];
    if(!o.rider){ L.push({ic:'🕊️',t:'身故／完全失能',big:(T*K>c.S?`${F(c.S)} 起，繳費期滿後至少 ${F(T*K)}`:'至少 '+F(c.S)),line:`保額與「已繳年繳保費總和×${K}」取較高者（不是加總）`,sub:c.age<15?'未滿 15 足歲身故改給喪葬費用':''});
      L.push({ic:'🎁',t:o.endT,big:'至少 '+F(Math.max(c.S,T*K)),line:`${o.endLine}，保額與年繳總和×${K} 取高`,sub:'以上各項只領一次，領完契約結束'});
      L.push({ic:'🙌',t:'意外 2～6 級失能免繳',big:'免繳',line:'繳費期間意外 180 天內 2～6 級失能',sub:'保障照樣有效'}); }
    else L.push(...o.riderCards(c,F));
    return L;},
  tl:c=>{ const end=o.endAge(c); if(c.age>=end) return null; const bars=[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:end,label:o.barLabel(c)}]; if(o.rider) bars.push({from:c.payEnd,to:end,label:'✅ 繳費期滿後主約解約，附約照樣有效到 100 歲',color:'var(--c1)'});
    return {title:'📈 繳費與保障',svg:EXPLAIN_TL(c,end,bars,[[c.age,'投保'],[c.payEnd,'繳費期滿'],[end,o.endPt]])};},
  examples:c=>{ if(U) c.S=c.sum; const ex=[
    {ic:'🦴',t:'投保第 1 年確診類風濕關節炎（重大傷病）',calc:`第 1 年：年繳 ${F(c.annual)} × ${K}`,pay:c.annual*K},
    {ic:'🎗️',t:`第 5 年確診${CX(c.sex,c.age+5,1)}第一期，取得重大傷病證明`,calc:`保額 ${F(c.S)} 與 年繳總和×${K} 取高`,pay:Math.max(c.S,tot(c,5)*K)},
    {ic:'🔥',t:'第 15 年燒燙傷達全身 20% 以上',calc:`保額 ＋ 20% 加碼`,pay:Math.max(c.S,tot(c,15)*K)+c.S*0.2},
    {ic:'🫀',t:'第 10 年冠狀動脈繞道手術',calc:`保額 ${F(c.S)}`,pay:Math.max(c.S,tot(c,10)*K)}];
    if(!o.rider) ex.push({ic:'🎁',t:o.endEx,calc:`保額 與 年繳總和×${K} 取高`,pay:Math.max(c.S,tot(c,c.term)*K),lbl:'領'});
    return ex;},
  src:o.src};}
const E=(window.EXPLAIN=window.EXPLAIN||{});
const T4={10:[0,60],15:[0,55],20:[0,50],30:[0,40]}, CV={10:15,15:15,20:15,30:15};
E.SDH=mk('SDH',{name:'金卡安心重大傷病保險', icon:'💳', tag:'重大傷病卡一次給付＋保障期滿領回滿期金（繳 N 年保 N＋15 年）', terms:[10,15,20,30], defTerm:2, TA:T4, k:1.06, min:10,max:500,step:10,def:100,
  warn:'可附加 ADG、ADH、TMR、XTY、CMR、CNR、HTA；累計最高 500 萬', endT:'滿期保險金', endLine:'保險期間屆滿仍生存', endEx:'保險期間屆滿仍生存，領滿期金', endAge:c=>c.payEnd+15, endPt:'滿期', barLabel:c=>`🪪 重大傷病保障 ${c.term+15} 年`,
  src:['SDH DM 公版 115.01.22（30 歲女 100 萬 20 年 年繳 43,500 範例）','SDH 保單條款 115.01.22','SDH 投保規則','SDH 費率表']});
E.SDN=mk('SDN',{name:'金卡順心重大傷病保險', icon:'💳', tag:'重大傷病一次給付＋滿期金；階梯保費：前段較高、後段較低', terms:[10,15,20,30], defTerm:2, TA:T4, k:1.06, min:10,max:500,step:10,def:100, step2:{10:6,15:8,20:11,30:16},
  warn:'可附加 ADG、ADH、TMR、XTY、CMR、CNR、HTA；累計最高 500 萬', endT:'滿期保險金', endLine:'保險期間屆滿仍生存', endEx:'保險期間屆滿仍生存，領滿期金', endAge:c=>c.payEnd+15, endPt:'滿期', barLabel:c=>`🪪 重大傷病保障 ${c.term+15} 年`,
  src:['SDN DM 公版 115.01.22（30 歲女 100 萬 20 年：第 1～10 年 47,000、第 11～20 年 37,600 範例）','SDN 保單條款 115.01.22','SDN 投保規則','SDN 費率表']});
E.SDJ=mk('SDJ',{name:'優卡安心重大傷病健康保險', icon:'💳', tag:'重大傷病一次給付，保到 84 歲，84 歲仍生存領滿期金', terms:[20], TA:{20:[0,50]}, k:1.06, min:10,max:500,step:10,def:100,
  warn:'累計最高 500 萬', endT:'84 歲滿期金', endLine:'84 歲仍生存', endEx:'84 歲仍生存，領滿期金', endAge:()=>84, endPt:'滿期', barLabel:()=>'🪪 重大傷病保障到 84 歲',
  src:['SDJ DM 公版 115.01.22（30 歲女 100 萬 20 年 年繳 41,600 範例）','SDJ 保單條款 115.01.22','SDJ 投保規則 114.06.02','SDJ 費率表']});
E.FDC=mk('FDC',{usd:1, name:'美好安心外幣重大傷病保險（美元）', icon:'💵', tag:'美元重大傷病：拿到重大傷病卡一次給付，期滿領回滿期金', terms:[2,6,10,15,20], defTerm:4, TA:{2:[0,60],6:[0,60],10:[0,60],15:[0,55],20:[0,50]}, k:1.02, min:5000,max:170000,step:5000,def:30000,
  warn:'美元保單，保費以美元收付；不可附加附約', endT:'滿期保險金', endLine:'保險期間屆滿仍生存', endEx:'保險期間屆滿仍生存，領滿期金', endAge:c=>c.age+({2:20,6:20,10:25,15:30,20:35}[c.term]), endPt:'滿期', barLabel:c=>`💵 重大傷病保障 ${({2:20,6:20,10:25,15:30,20:35}[c.term])} 年`,
  src:['FDC DM 公版 115.01.22（30 歲女 3 萬美元 20 年 年繳 1,206 美元範例）','FDC 保單條款 115.01.22','FDC 投保規則','FDC 費率表']});
E.FDE=mk('FDE',{usd:1, rider:1, name:'美好順心外幣重大傷病終身健康保險附約（美元）', icon:'💵', tag:'美元重大傷病附約：繳 20 年、保到 100 歲；繳費期滿後主約解約也照樣有效', terms:[20], TA:{20:[0,60]}, k:1.06, min:10000,max:100000,step:1000,def:35000,
  warn:'附加於同幣別美元主約（如 PFD）；保額＞2 萬美元須 ≦主約可附加額度；不可與 FDF 同附一張主約；不打繳費方式折扣',
  riderCards:(c,F)=>[{ic:'✅',t:'繳費期滿後不受主約影響',big:'保到 100 歲',line:'20 年繳費期滿後，主約（如 PFD）整張解約，附約照樣有效',sub:'YT 向保全科確認（2026-10-20）'}],
  endAge:()=>100, endPt:'屆滿', barLabel:()=>'💵 重大傷病保障到 100 歲',
  src:['FDE DM 公版 115.03.31（30 歲女 5 萬美元 年繳 1,445 美元範例）','FDE 保單條款 115.03.31（100 歲屆滿終止）','FDE 投保規則 115.03.31','繳費期滿後主約終止仍有效：保全科（YT 確認 2026-10-20）']});
})();
