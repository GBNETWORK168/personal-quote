/* v1.39 SDP 溢卡呵護重大傷病保險 — 取自 SDP DM 公版 115.10.23、保單條款樣張 115.10.23（第十八條生存保險金、第二條十一款當年度保險金額）、投保規則 115.10.23 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const TA={10:[0,60],15:[0,55],20:[0,50],30:[0,40]}, K=1.06, CV=t=>t+35;
const E=window.EXPLAIN=window.EXPLAIN||{};
E.SDP={name:'溢卡呵護重大傷病保險', cat:'重大傷病', icon:'💳', key30:(c,K)=>{const W=v=>v%10000===0?`${(v/10000).toLocaleString()} 萬`:`${Math.round(v).toLocaleString()} 元`;return [[`拿到重大傷病卡，領 ${W(c.S)}（第 2 年起）`,0],[`繳費期滿後每年領 ${K[4].big}（未理賠）`,4],['意外 2～6 級失能，保費免繳',6]];}, tagline:'重大傷病卡一次給付；繳費期滿後每年領生存保險金（繳 N 年保 N＋35 年）', terms:[10,15,20,30], defTerm:2, ageOf:t=>TA[t]||TA[10],
  input:{kind:'sum', label:'保額', unit:'萬', min:10, max:500, step:10, def:100},
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年繳／保 ${CV(c.term)} 年・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  warn:()=>'僅可附加 ADG、ADH、TMR、XTY、CMR、CNR、HTA；累計最高 500 萬',
  cards:c=>{const yr=Math.max(c.S,c.tot*K)*0.03; return [
    {ic:'🪪',t:'重大傷病',big:(c.tot*K>c.S?`${F(c.S)} 元起，最高 ${F(c.tot*K)} 元`:`${F(c.S)} 元`),line:'第 2 年起確診健保重大傷病範圍（22 大類、300 多項），保額與「已繳年繳保費總和×1.06」取較高者（不是加總）；繳費期滿時已繳最多，才可能高於保額',sub:'第 1 年：年繳保費總和×1.06；慢性精神病給保額 20%'},
    {ic:'🔥',t:'特定重大傷病加碼',big:'＋'+F(c.S*0.2)+' 元',line:'第 2 年起：燒燙傷 20% 以上、重大創傷、脊髓損傷，再加保額 20%',sub:''},
    {ic:'❤️',t:'特定重大疾病',big:F(c.S)+' 元',line:'急性心肌梗塞（重度）、冠狀動脈繞道手術',sub:'與年繳總和×1.06 取高；等待期 90 天'},
    {ic:'🩺',t:'特定傷病',big:F(c.S)+' 元',line:'主動脈外科置換手術、嚴重原發性肺動脈高血壓',sub:'與年繳總和×1.06 取高'},
    {ic:'💵',t:'生存保險金（每年）',big:F(yr)+' 元',line:`繳費期滿後每滿一年仍生存、未理賠，領 max(保額, 年繳總和×1.06)×3%`,sub:`第 ${c.term+1}～${CV(c.term)} 年最多 ${CV(c.term)-c.term} 次`},
    {ic:'🕊️',t:'身故／完全失能',big:(c.tot*K>c.S?`${F(c.S)} 元起，最高 ${F(c.tot*K)} 元`:`${F(c.S)} 元`),line:'繳費期間：保額與「已繳年繳保費總和×1.06」取較高者（不是加總）',sub:'繳費期滿後扣累計已領生存保險金（最少當年度保險金額）'},
    {ic:'🙌',t:'意外 2～6 級失能免繳',big:'免繳',line:'意外 2～6 級失能，續期保費豁免',sub:'保障照樣有效'}];},
  tl:c=>{const end=c.age+CV(c.term); return {title:'📈 繳費、保障與生存保險金',svg:EXPLAIN_TL(c,end,[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:end,label:`🪪 重大傷病保障 ${CV(c.term)} 年`},{from:c.payEnd,to:end,label:`💵 每年領 ${F(Math.max(c.S,c.tot*K)*0.03)}`,color:'#16a34a'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[end,'期滿']])};},
  examples:c=>{const tot=n=>c.annual*Math.min(n,c.term); const yr=Math.max(c.S,c.tot*K)*0.03, n=CV(c.term)-c.term; return [
    {ic:'🦴',t:'投保第 1 年確診類風濕關節炎（重大傷病）',calc:`第 1 年：年繳 ${F(c.annual)} × 1.06`,pay:c.annual*K},
    {ic:'🎗️',t:`第 5 年確診${CX(c.sex,c.age+5)}，取得重大傷病證明`,calc:`保額 ${F(c.S)} 與 年繳總和×1.06 取高`,pay:Math.max(c.S,tot(5)*K)},
    {ic:'🔥',t:'第 8 年燒燙傷達全身 20% 以上',calc:'重大傷病 ＋ 特定重大傷病 20%',pay:Math.max(c.S,tot(8)*K)+c.S*0.2},
    {ic:'💵',t:`都沒理賠，活到期滿（共領 ${n} 次生存保險金）`,calc:`${F(yr)} × ${n} 年`,pay:yr*n,lbl:'共領'}];},
  src:['SDP DM 公版 115.10.23（40 歲女 100 萬 20 年 年繳 50,000、繳費期滿後生存保險金 31,800 範例）','SDP 保單條款樣張 115.10.23（第 2、18、19 條）','SDP 投保規則 115.10.23','SDP 費率表']};
})();
