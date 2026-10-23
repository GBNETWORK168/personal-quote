/* XWS5 解說資料：全部取自 XWS5_保單條款_1150122（第2、13–17條）與 XWS5_DM公版_1150122、投保規則_1130701 */
window.EXPLAIN = window.EXPLAIN || {};
window.EXPLAIN.XWS5 = {
  code:'XWS5', name:'新平準終身壽險', cat:'壽險', icon:'🕊️', tagline:'一張壽險＋69歲起住院日額＋110歲祝壽', terms:[20], ages:[0,65],
  input:{kind:'sum', unit:'萬', min:5, max:2000, def:100, stepFn:(v,d)=>d>0?(v<10?10:v+10):(v-10<10?5:v-10)},
  prem: c => { const r=c.H.rateMain(); return r? {annual:r*c.sum, txt:`20 年期・年繳 <b>NT$ ${c.fm(r*c.sum)}</b>（未折扣）・20 年共 ${c.fm(r*c.sum*20)}`} : null; },
  warn: c => c.sum<10 ? '保額 5 萬須同時附加 HSV 住院附約；一般最低 10 萬' : '',
  tl: c => ({title:'📈 一生時間軸', svg: EXPLAIN_TL(c,110,[
    {from:c.age,to:c.payEnd,label:'💰 繳費 20 年・🛡️失能可免繳'},
    {from:Math.max(69,c.age),to:110,label:`🏥 69歲起每天 ${f(c.S*0.003)} 元`,color:'#e8a33d'},
    {from:c.age,to:110,label:'🕊️ 身故／完全失能保障終身',color:'#9aa7b5'}],
    [[c.age,'投保'],[c.payEnd,'繳完'],[69,'住院起'],[110,'祝壽']])}),
  src:['XWS5 保單條款 115.01.22（第13–17條）','XWS5 DM 公版 115.01.22','XWS5 投保規則 113.07.01'],
  // b(ctx) → 卡片；ctx = {S:保額元, age, sex, annual:年繳(元), tot:年繳總和(20年), payEnd}
  cards: ctx => [
    {ic:'🏥', t:'老年住院', big:`每天 ${f(ctx.S*0.003)} 元`, line:'屆滿 69 歲起，生病或意外住院，每住 1 天賠保額 0.3%', sub:`累計最多保額 50%＝${f(ctx.S*0.5)} 元（約 ${Math.floor(0.5/0.003)} 天）`, from:69},
    {ic:'🕊️', t:'身故／完全失能', big:(ctx.tot>ctx.S?`${f(ctx.S)} 元起，繳費期滿後至少 ${f(ctx.tot)} 元`:`至少 ${f(ctx.S)} 元`), line:'三者取最高（不是加總）：保額、已繳年繳保費總和、保單價值準備金', sub:'再扣掉已領過的老年住院金'+(ctx.age<15?'；未滿 15 足歲身故改給喪葬費用（上限依遺贈稅法）':'')},
    {ic:'🎂', t:'110 歲祝壽', big:`至少 ${f(Math.max(ctx.S, ctx.tot))} 元`, line:'活到保險年齡 110 歲，一樣三者取最高給付', sub:'扣掉已領過的老年住院金，契約結束'},
    {ic:'🛡️', t:'2～6 級失能免繳保費', big:'之後保費全免', line:`繳費期間（到 ${ctx.payEnd} 歲）失能 2～6 級，主約後面保費不用繳，保障照樣有效`, sub:'只豁免主約，不含附約'}
  ],
  examples: ctx => {
    const d = ctx.S*0.003, ex = [];
    ex.push({ic:'🏥', t:'75 歲住院 5 天', calc:`${f(d)} × 5 天`, pay:d*5});
    ex.push({ic:'🏥', t:'60 歲住院 5 天', calc:'未滿 69 歲，老年住院不給付', pay:0, note:'可搭配住院醫療附約補這段'});
    const used = Math.min(d*30, ctx.S*0.5), base = Math.max(ctx.S, ctx.tot);
    ex.push({ic:'🕊️', t:'領過 30 天老年住院後身故', calc:`${f(base)} − ${f(used)}`, pay:base-used, note:'以保額／年繳總和計；若保價準備金更高以保價為準'});
    const wa = ctx.age+5;
    if (wa < ctx.payEnd) ex.push({ic:'🛡️', t:`${wa} 歲 2～6 級失能`, calc:`剩 ${ctx.payEnd-wa} 年 × ${f(ctx.annual)}`, pay:(ctx.payEnd-wa)*ctx.annual, lbl:'免繳',note:'主約保費不用再繳'});
    return ex;
  }
};
function f(n){ return Math.round(n).toLocaleString('zh-TW'); }
