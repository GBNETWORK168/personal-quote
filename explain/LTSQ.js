/* LTS 詠馨久久長期照顧終身壽險／LTQ 連馨久久長期照顧終身健康保險 — 取自 LTS DM 公版 1150720、LTS 條款 1150720、LTQ DM 公版 1150720、LTQ 條款 1150720、各投保規則 1150720 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW'); const SUMK=16+0.02*120;
function mk(code,o){return {name:o.name, cat:'長期照顧', icon:o.icon, tagline:o.tag, terms:[10,20,30], defTerm:1, ageOf:t=>o.TA[t]||[15,60],
  input:{kind:'sum', label:'保額', unit:'萬', min:0.5, max:5, step:0.1, def:2, stepFn:(v,d)=>Math.round((v+d*0.5)*10)/10},
  exLabel:c=>`保額 ${F(c.S)} 元`,
  prem:c=>{const r=c.H.rateMain(); return r?{annual:r*c.sum, txt:`${c.term} 年期・年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・共 ${F(r*c.sum*c.term)}`}:null;},
  warn:c=>`累計最高保額 ${c.age<=60?'5':'3'} 萬元（61 歲以上 3 萬）；${o.warn}`,
  cards:c=>[
    {ic:'💰',t:'長照一次金／完全失能關懷金',big:`${F(c.S*15)} 元`,line:'保額 15 倍，兩項擇一、限一次',sub:`65 歲前首次確診失智：再加 ${F(c.S*10)} 元`},
    {ic:'📆',t:'長照分期金／失能扶助金（每月）',big:`${F(c.S*2)} → ${F(c.S*2*1.3)} 元`,line:'保額 2 倍 × 係數，每年加 2%（1.00～1.30）',sub:'兩項擇一，合計最多 192 個月'},
    {ic:'🧮',t:'分期金 16 年合計',big:`${F(c.S*2*12*SUMK)} 元`,line:'持續符合狀態領滿 192 個月',sub:'長照狀態消失就暫停，再符合再續領'},
    {ic:'👴',t:'80 歲起老年住院',big:`每天 ${F(c.S*0.1)} 元`,line:'保額 10% × 住院天數，累計最多 200 天',sub:o.oldSub},
    {ic:'🕊️',t:o.dT,big:`${F(c.tot*1.02)} 元`,line:o.dLine,sub:c.age<15?'未滿 15 足歲身故改給喪葬費用':''},
    {ic:'🙌',t:'免繳保費',big:'免繳',line:'完全失能、或符合長照狀態且過 90 天免責期',sub:'保障照樣有效'}],
  tl:c=>{const pts=[[c.age,'投保'],[c.payEnd,'繳費期滿'],[80,'老年住院'],[99,'祝壽']]; if(c.age<65&&c.payEnd!==65) pts.push([65,'失智加碼止']);
    return {title:'📈 繳費與保障',svg:EXPLAIN_TL(c,99,[{from:c.age,to:c.payEnd,label:`💰 繳 ${c.term} 年・每年 ${F(c.annual)} 元`,color:'var(--c1)'},{from:c.age,to:99,label:'🧓 長照／失能保障到 99 歲'},{from:80,to:99,label:'👴 80 歲起老年住院提前給付'}],pts)};},
  examples:c=>{const s=c.S, y1=s*2*12; return [
    {ic:'🧠',t:'55 歲確診中度失智，持續需要照顧',calc:`一次金 ${F(s*15)}＋${F(s*10)} ＋ 分期 192 個月 ${F(y1*SUMK)}`,pay:s*25+y1*SUMK,note:`第 1 年每月 ${F(s*2)}，第 16 年每月 ${F(s*2*1.3)}`},
    {ic:'♿',t:'75 歲中風，3 項 ADLs 需人協助，照顧 3 年',calc:`一次金 ${F(s*15)} ＋ 分期 ${F(y1)}＋${F(y1*1.02)}＋${F(y1*1.04)}`,pay:s*15+y1*(1+1.02+1.04)},
    {ic:'👴',t:'82 歲肺炎住院 10 天',calc:`${F(s*0.1)} × 10`,pay:s*0.1*10,note:o.oldNote}];},
  src:o.src};}
const E=(window.EXPLAIN=window.EXPLAIN||{});
E.LTS=mk('LTS',{name:'詠馨久久長期照顧終身壽險', icon:'🏡', TA:{10:[15,65],20:[15,60],30:[15,50]},
  tag:'長照終身壽險：長照或完全失能先給 15 倍，再月領 2 倍 16 年；身故、99 歲領回保費 1.02 倍', warn:'壽險主約，有解約金',
  oldSub:'且不超過解約金 90%（扣借款、欠繳）', oldNote:'已領的老年住院金，之後身故／祝壽時會扣回',
  dT:'身故／99 歲祝壽', dLine:'年繳保費總和 ×1.02（身故時與保單價值準備金取高），扣已領老年住院金',
  src:['LTS DM 公版 115.07.20（40 歲富小姐 2 萬 20 年 年繳 155,020 範例）','LTS 保單條款 115.07.20','LTS 投保規則 115.07.20','LTS 費率表']});
E.LTQ=mk('LTQ',{name:'連馨久久長期照顧終身健康保險', icon:'🤲', TA:{10:[15,70],20:[15,60],30:[15,50]},
  tag:'長照終身健康險：長照或完全失能先給 15 倍，再月領 2 倍 16 年；沒用到身故、99 歲領回保費 1.02 倍餘額', warn:'健康險主約，無解約金',
  oldSub:'入院時尚未領長照一次金／失能關懷金', oldNote:'身故／祝壽金為保費×1.02 扣掉所有已領保險金',
  dT:'身故／99 歲祝壽', dLine:'年繳保費總和 ×1.02，扣掉所有已領的保險金',
  src:['LTQ DM 公版 115.07.20（40 歲富先生 1 萬 20 年 年繳 34,480 範例）','LTQ 保單條款 115.07.20','LTQ 投保規則 115.07.20','LTQ 費率表']});
})();
