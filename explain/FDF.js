/* FDF 美優外幣重大疾病終身健康保險附約（甲型）（美元）— 取自 FDF DM 公版 1150331、FDF 條款 1150331、投保規則 1150331；繳費期滿後主約終止仍有效：YT 向保全科確認 2026-10-20 */
(function(){ const fm=n=>Math.round(n).toLocaleString('zh-TW'), F=n=>'US$ '+fm(n);
(window.EXPLAIN=window.EXPLAIN||{}).FDF={name:'美優外幣重大疾病終身健康保險附約（甲型）（美元）', cat:'外幣（美元）', icon:'💵', cur:'USD', tagline:'美元 7 項重大疾病一次給付：繳 20 年、保到 100 歲；繳費期滿後主約解約也照樣有效', terms:[20], ages:[0,65],
  input:{kind:'sum', label:'保額（美元）', unit:'美元', min:10000, max:100000, step:1000, def:35000},
  exLabel:c=>`保額 ${F(c.sum)}`,
  prem:c=>{const r=c.H.rateRider('FDF',`${c.sex}`); return r?{annual:r*c.sum/10000, txt:`20 年繳・年繳 <b>${F(r*c.sum/10000)}</b>（未折扣）・共 ${F(r*c.sum/10000*20)}`}:null;},
  warn:()=>'附加於同幣別美元主約（如 PFD）；同一人限 1 張；保額＞2 萬美元須 ≦主約可附加額度；不可與 FDE 同附一張主約；不打繳費方式折扣',
  cards:c=>[
    {ic:'❤️',t:'重大疾病',big:F(c.sum),line:'第 2 年起確診，保額與年繳總和×1.06 取高',sub:'第 1 年：年繳總和×1.06；等待期 90 天（意外不受限）'},
    {ic:'📋',t:'7 項重大疾病',big:'7 項',line:'重度癌症、急性心肌梗塞（重度）、冠狀動脈繞道、器官／造血幹細胞移植、腦中風後障礙（重度）、末期腎病變、癱瘓（重度）',sub:'只給一次，給付後附約結束'},
    {ic:'✅',t:'繳費期滿後不受主約影響',big:'保到 100 歲',line:'20 年繳費期滿後，主約（如 PFD）整張解約，附約照樣有效',sub:'YT 向保全科確認（2026-10-20）'}],
  tl:c=>c.age>65?null:({title:'📈 繳費與保障',svg:EXPLAIN_TL(c,100,[{from:c.age,to:c.payEnd,label:`💰 繳 20 年・每年 ${F(c.annual)}`,color:'var(--c1)'},{from:c.age,to:100,label:'❤️ 重大疾病保障到 100 歲'},{from:c.payEnd,to:100,label:'✅ 繳費期滿後主約解約，附約照樣有效',color:'var(--c1)'}],[[c.age,'投保'],[c.payEnd,'繳費期滿'],[100,'屆滿']])}),
  examples:c=>[
    {ic:'🎗️',t:`第 1 年（等待期後）確診${(x=>/白血病|淋巴瘤/.test(x)?x:'第二期'+x)(CX(c.sex,c.age+1))}`,calc:`年繳 ${F(c.annual)} × 1.06`,pay:c.annual*1.06},
    {ic:'❤️',t:'第 10 年同時心肌梗塞（重度）和末期腎病變',calc:`只給一項：保額 ${F(c.sum)}`,pay:Math.max(c.sum,c.annual*10*1.06)},
    {ic:'🧠',t:'繳費期滿後解約 PFD，第 30 年腦中風後重度障礙',calc:`附約仍有效：保額 ${F(c.sum)}`,pay:Math.max(c.sum,c.annual*20*1.06)}],
  src:['FDF DM 公版 115.03.31（40 歲女 10 萬美元 年繳 2,740 美元範例）','FDF 保單條款 115.03.31（100 歲屆滿終止）','FDF 投保規則 115.03.31','繳費期滿後主約終止仍有效：保全科（YT 確認 2026-10-20）']};
})();
