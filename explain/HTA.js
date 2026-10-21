/* HTA 金醫靠健康保險附約（醫材）— 取自 HTA DM 公版 1140113、HTA 條款 1140113（給付表核對）、投保規則 1141110 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
const T=[['👁️','人工水晶體植入術',1,'每眼每年 1 次，終身 2 次'],['🦵','人工膝關節置換術',1,'每側每年 1 次，終身 2 次'],['🦴','人工髖關節置換術',1,'每側每年 1 次，終身 2 次'],['🫀','心導管併心臟血管支架',3,'限一次'],['💓','心律調節器植入術',3,'限一次'],['❤️','心臟瓣膜置換手術',5,'限一次'],['🧠','腦室腹腔分流手術',5,'限一次'],['⚙️','心室輔助裝置植入術',10,'限一次'],['🫁','ECMO 體外循環維生',10,'限一次']];
(window.EXPLAIN=window.EXPLAIN||{}).HTA={name:'金醫靠健康保險附約（醫材）', cat:'醫療（醫材附約）', icon:'🦾', tagline:'9 項常見自費醫材手術定額補助，第 3 年起給到 3 倍', ages:[20,65],
  input:{kind:'sum', label:'投保單位', unit:'單位', min:1, max:2, step:1, def:1},
  exLabel:c=>`${c.sum} 單位・第 3 年起`,
  prem:c=>{const r=c.H.rateRider('HTA',`${c.sex}`); return r?{annual:r*c.sum, txt:`年繳 <b>NT$ ${F(r*c.sum)}</b>（未折扣）・繳到 74 歲`}:null;},
  warn:()=>'累計最高 2 單位；附約年期不得超過主約；限主契約被保險人、標準體；疾病等待期 30 天',
  cards:c=>T.map(([ic,t,b,sub])=>({ic,t,big:`${F(b*30000*c.sum)} 元`,line:`第 1 年 ${F(b*10000*c.sum)}・第 2 年 ${F(b*20000*c.sum)}・第 3 年起 ${F(b*30000*c.sum)}`,sub})),
  tl:c=>c.age>65?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,74,[{from:c.age,to:c.age+1,label:'1️⃣ 第 1 年給 1 倍',color:'var(--c1)'},{from:c.age+1,to:c.age+2,label:'2️⃣ 第 2 年給 2 倍',color:'var(--c1)'},{from:c.age+2,to:74,label:`🦾 第 3 年起給 3 倍・每年繳 ${F(c.annual)} 元`}],[[c.age,'投保'],[74,'屆滿']])}),
  examples:c=>{const u=c.sum; return [
    {ic:'👁️',t:'第 5 年雙眼白內障，分兩次置換人工水晶體',calc:`${F(30000*u)} × 2 眼`,pay:60000*u},
    {ic:'🫀',t:'第 2 年心肌梗塞，放心臟支架',calc:`第 2 年 ${F(60000*u)}`,pay:60000*u},
    {ic:'🦵',t:'第 8 年右膝人工關節置換',calc:`${F(30000*u)}`,pay:30000*u}];},
  src:['HTA DM 公版 114.01.13','HTA 保單條款 114.01.13（醫材補助給付表）','HTA 投保規則 114.11.10','HTA 費率表 113.08.05']};
})();
