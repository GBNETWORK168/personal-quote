/* TMR 享安寶意外傷害醫療保險給付附加條款（實支實付）— 取自 ADG/TMR DM 公版 1140428、TMR 條款 1130715、投保規則 1140811 */
(function(){ const F=n=>Math.round(n).toLocaleString('zh-TW');
(window.EXPLAIN=window.EXPLAIN||{}).TMR={name:'享安寶意外傷害醫療保險給付附加條款', cat:'意外傷害附約', icon:'🩹', tagline:'意外受傷的醫療費實支實付（附加在 ADG），脫臼開刀另給定額', ages:[0,70],
  input:{kind:'sum', label:'每次限額', unit:'萬', min:3, max:20, step:1, def:10},
  prem:c=>{const R=(window.RIDER_RATES||{}).TMR; if(!R) return null; const a=R.t['1'][1][0]+R.add['1']*(c.sum-3); return {annual:a, txt:`今年年繳 <b>NT$ ${F(a)}</b>（職業第 1 類，一年期）`};},
  warn:()=>'須同時投保 ADG；限額 3～20 萬且 ≦ADG 保額 10%（ADG 100 萬才能買 10 萬）',
  cards:c=>[
    {ic:'🧾',t:'意外醫療實支實付',big:`每次最多 ${F(c.S)} 元`,line:'憑收據賠健保沒給付的自付費用',sub:'別張實支已用收據正本賠過的不重複賠'},
    {ic:'🚨',t:'加護病房／燒燙傷中心',big:`限額提高到 ${F(c.S*1.5)} 元`,line:'限額 × 1.5 倍',sub:''},
    {ic:'🦴',t:'脫臼開放性復位術',big:'15,000 ～ 45,000 元',line:'固定 15 萬 × 脫臼別表 10%～30%',sub:'同一事故限一次、取最高一項'},
    {ic:'✈️',t:'海外意外就醫',big:`最多 ${F(c.S)} 元`,line:'180 天內在當地合格醫院治療',sub:'同一次傷害最多 14 天'},
    {ic:'🪪',t:'有健保但沒用健保',big:'75%',line:'按計算金額的 75% 給付',sub:''}],
  tl:c=>c.age>75?null:({title:'📈 保障期間',svg:EXPLAIN_TL(c,75,[{from:c.age,to:75,label:'🔁 跟著 ADG 一年一保・續保到 75 歲'}],[[c.age,'投保'],[75,'續保到']])}),
  examples:c=>[
    {ic:'🛵',t:'車禍骨折開刀，自付 8 萬（鋼板＋病房差額）',calc:`min(80,000, 限額 ${F(c.S)})`,pay:Math.min(80000,c.S)},
    {ic:'🦴',t:c.age>=65?'跌倒髖關節脫臼開刀復位':'車禍髖關節脫臼開刀復位',calc:'150,000 × 30%',pay:45000,note:'另依實際醫療費實支實付'},
    {ic:'🩹',t:'菜刀割傷急診縫合，自付 2,500',calc:`min(2,500, 限額 ${F(c.S)})`,pay:Math.min(2500,c.S)}],
  src:['ADG/TMR DM 公版 114.04.28','TMR 保單條款 113.07.15（第4～5條、附表一脫臼別表）','ADG/TMR 投保規則 114.08.11','TMR 費率表 113.07.01']};
})();
