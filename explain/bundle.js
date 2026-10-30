/* v1.29 保障總覽（v1.50 由「整包解說」改名）：explain.html?age=&sex=&bundle=[{c,h,g,s,t,p,n,k,a,y,u}] — 由報價頁「📖 保障總覽」帶入
   各商品數字沿用 explain/<CODE>.js（皆取自 DM／條款）；HSV/HSY 限額同 HSV.js／HSY.js；SJR1 腹腔鏡膽囊切除術 20 倍取自 SJR1 條款 113.09.23 附表第 764 項 */
(function(){
const F=n=>Math.round(n).toLocaleString('zh-TW');
const W=n=>(n/1e4).toLocaleString('zh-TW')+' 萬';
const HSVL={1:{room:1000,med:100000,surg:40000,op:15000,day:1000},2:{room:2000,med:200000,surg:60000,op:20000,day:2000},3:{room:3000,med:300000,surg:80000,op:25000,day:3000}};
const HSYL={1:{dR:1000,R:3000,dM:100000,M:300000,dO:15000,O:25000},2:{dR:2000,R:3000,dM:200000,M:300000,dO:20000,O:25000}};
const HAND=['XWS5','HSV','HSY','SJR1','SDG','CLZ','CLX','CIA','CIB','OLA6'];
const key=c=>{c=String(c||'').split('#')[0].toUpperCase(); if(/^HSV\d?$/.test(c))return 'HSV'; if(/^HSY\d?$/.test(c))return 'HSY'; return c;};
window.EXPLAIN_BUNDLE=function(L,age,sex){
  const E=window.EXPLAIN||{}, $=s=>document.querySelector(s);
  document.body.classList.toggle('fem',sex===2);
  $('#ttl').textContent='保障總覽';
  const ctxOf=(x,D,kk)=>{const I=D.input||{}; const c={age,sex,fm:F};
    c.term=+x.t||(D.terms?D.terms[D.defTerm??0]:0); if(D.terms&&!D.terms.includes(c.term)) c.term=D.terms[D.defTerm??0];
    if(I.kind==='plan') c.plan=+String(x.p||'').replace(/\D/g,'')||I.def; else if(I.kind!=='none') c.sum=+x.s||I.def;
    c.S=(c.sum||0)*(I.unit==='萬'?1e4:1); c.payEnd=age+(c.term||0);
    const k=kk||key(x.c);   // v1.50：性別換商品時用換過的代碼查費率
    c.H={fm:F, rateMain(){const R=(window.RATES||{})[k]; const r=R&&R[`${k}|${c.term}|${sex}`]; if(!r) return null; const v=r[1][age-r[0]]; return v==null?null:v;},
      rateRider(rc,kk){const R=(window.RIDER_RATES||{})[rc]; const r=R&&R.t[kk]; if(!r) return null; const v=r[1][age-r[0]]; return v==null?null:v;}};
    let pr=null; try{pr=D.prem?D.prem(c):null}catch(e){} c.annual=pr&&pr.annual||0; c.tot=c.annual*(c.term||0); return c;};
  // v1.48：性別限定商品（CIA 男／CIB 女、CLZ 男／CLX 女）與被保人性別不符時，改用同系列對應性別商品解說並提示
  const SWAP={CIA:'CIB',CIB:'CIA',CLZ:'CLX',CLX:'CLZ'}, swapped=[];
  const P=L.map((x,i)=>{let k=key(x.c), D=E[k]; if(D&&D.sexOnly&&D.sexOnly!==sex&&SWAP[k]&&E[SWAP[k]]){swapped.push([k,SWAP[k]]); k=SWAP[k]; D=E[k];} return {x,i,k,D,c:D?ctxOf(x,D,k):null};});
  const has=k=>P.filter(p=>p.D&&p.k===k);
  // ---------- 依需求分類 ----------
  const other=[]; const need={住院:[],手術:[],重症癌症:[],失能長照:[],身故:[],豁免:[]}, tot={住院:0,重症癌症:0,身故:0}, pt=[], part={重症癌症:0,身故:0};
  const amt=v=>{const m=String(v).replace(/,/g,'').match(/^\s*(?:NT\$|US\$)?\s*([\d.]+)\s*(萬)?\s*(元)?\s*$/); return m&&!/US\$/.test(v)?(+m[1])*(m[2]?1e4:1):null;};
  P.forEach(({k,c,D,x})=>{ if(!D){ if(/豁免/.test(x.k||'')) need.豁免.push({k:x.c,v:'解說製作中'}); else other.push(x); return; }
    if(k==='XWS5'){ need.住院.push({k,v:`69 歲起每天 ${F(c.S*0.003)}`}); need.身故.push({k,v:`至少 ${F(Math.max(c.S,c.tot))}`}); tot.身故+=Math.max(c.S,c.tot); need.豁免.push({k,v:'2～6 級失能免繳主約'}); if(age>=69) tot.住院+=c.S*0.003; }
    if(k==='HSV'){ const l=HSVL[c.plan]; need.住院.push({k:'HSV'+c.plan,v:`實支：病房每天 ${F(l.room)}＋雜費每次 ${F(l.med)}（或日額每天 ${F(l.day)}）`}); need.手術.push({k:'HSV'+c.plan,v:`住院手術最高 ${F(l.surg*5)}、門診手術 ${F(l.op)}（實支）`}); }
    if(k==='HSY'){ const l=HSYL[c.plan]; need.住院.push({k:'HSY'+c.plan,v:`扣自負額後：病房每天 ${F(l.R-l.dR)}、醫療每次 ${F(l.M-l.dM)}`}); need.手術.push({k:'HSY'+c.plan,v:`門診手術最多 ${F(l.O-l.dO)}（扣自負額）`}); }
    if(k==='SJR1'){ need.手術.push({k,v:`保額 ${F(c.sum)} × 1～90 倍＝${F(c.sum)}～${F(c.sum*90)}`}); }
    if(k==='SDG'){ need.重症癌症.push({k,v:`重大傷病 ${F(c.S)}`}); tot.重症癌症+=c.S; need.身故.push({k,v:`至少 ${F(Math.max(c.S,c.tot*1.06))}`}); tot.身故+=Math.max(c.S,c.tot*1.06); need.豁免.push({k,v:'意外 2～6 級失能免繳主約'}); }
    if(k==='CLZ'||k==='CLX'){ need.重症癌症.push({k,v:`重度癌症 ${F(c.S)}＋特定癌症最高 ${F(c.S*0.5)}`}); need.重症癌症.push({k,v:`初期／輕度癌症 ${F(c.S*0.1)}（第 2 年起）`}); tot.重症癌症+=c.S*1.5; need.身故.push({k,v:`繳滿後 年繳總和×1.06＝${F(c.tot*1.06)}`}); pt.push(k); tot.身故+=c.tot*1.06; need.豁免.push({k,v:'重度癌症後免繳'}); }
    // v1.52：CIA/CIB 依條款第十四、十五條、第二條第十九款手算
    if(k==='CIA'||k==='CIB'){ const p=c.tot*1.06, sev=Math.max(c.S,p); need.重症癌症.push({k,v:`重度癌症至少 ${F(c.S)}${p>c.S?`（與已繳保費×1.06 取高，最高 ${F(p)}）`:''}＋特定癌症第 6 年起 ${F(c.S*0.5)}`}); tot.重症癌症+=sev+c.S*0.5;
      need.身故.push({k,v:`保險年齡 16 歲起 已繳年繳總和×1.06（扣已領）、繳滿 ${F(p)}${age<16?'；16 歲前退還所繳保費':''}`}); pt.push(k); tot.身故+=p; need.豁免.push({k,v:'繳費期間重度癌症或意外 1～6 級失能後免繳'});
      need.重症癌症.push({k,v:`初期／輕度癌症 ${F(c.S*0.1)}（第 2 年起）`}); need.手術.push({k,v:`特定手術 ${F(c.S*0.02)}（限 1 次）`}); (need.其他保障=need.其他保障||[]).push({k,v:`特定傷病（限意外）${F(c.S*0.1)}`}); }
    if(k==='OLA6'){ need.身故.push({k,v:`第 4 年起 ${F(c.S)}`}); tot.身故+=c.S; }
    // v1.48：其餘商品依各自 explain/<CODE>.js 卡片（取自 DM／條款）自動歸類，不另算合計
    if(!HAND.includes(k)){ let cs=[]; try{cs=D.cards(c)||[]}catch(e){}
      const strip=t=>String(t||'').replace(/<[^>]+>/g,'').trim();
      let hit=0; const pv={};
      cs.forEach(q=>{const t=strip(q.t), v=strip(q.big), tv=t+' '+v; let n=null;
        // v1.50：新增失能長照；住院先於手術；擴充醫材／放化療／移植等關鍵字；未歸類卡片進「其他保障」，不再默默丟掉
        if(/免繳|豁免|觸發條件/.test(tv)) n='豁免'; else if(/身故/.test(t)) n='身故';
        else if(/長期照顧|長照|失智|失能|扶助|關懷金|每月給付|燒燙傷(?!中心)/.test(t)) n='失能長照';
        else if(/癌|重大傷病|重大疾病|特定傷病|特定重大|放射線|化學治療|放化療|標靶|免疫|質子|粒子|基因檢測/.test(t)&&!/住院|門診/.test(t)&&/\d.*(元|萬)|US\$|^[\d,.]+$/.test(v)) n='重症癌症';
        else if(/住院/.test(t)) n='住院';
        else if(/手術|植入|置換|支架|調節器|ECMO|移植|復位|縫合|骨折|醫材/.test(t)) n='手術';
        else if(/病房|日額|醫療|療養|加護|燒燙傷中心|門診/.test(t)) n='住院';
        if(n==='豁免'&&/觸發條件/.test(t)){ const ln=strip(q.line); if(ln) need.豁免.push({k,v:`何時免繳：${ln}`}); hit++; return; }
        if(n){ need[n].push({k,v:`${t}：${v}`}); hit++;
          if(n==='身故'||n==='重症癌症'){ const a=amt(v); pv[n]=pv[n]||[]; if(a!=null) pv[n].push(a); } }
        else { need.其他保障=need.其他保障||[]; need.其他保障.push({k,v:`${t}：${v}`}); hit++; } });
      // v1.50：每張商品同類多張卡為擇一情境（如 ADG 一般／大眾運輸），身故取最低（至少）、重症取最高；無法估值者合計改標「主要商品合計」
      ['身故','重症癌症'].forEach(n=>{ if(!need[n].some(r=>r.k===k)) return; const a=pv[n]||[]; if(a.length) tot[n]+=n==='身故'?Math.min(...a):Math.max(...a); else part[n]++; });
      if(!hit) other.push(x); }
  });
  // v1.72 富邦產物併入分類框（綠色產險標籤）；只有癌症一次金（初次罹癌）與壽險重症一次金同類，計入重症癌症合計
  { let q=[]; try{ q=JSON.parse(new URLSearchParams(location.search).get('pc')||'[]')||[]; }catch(e){}
    q.forEach(x=>(x.c||[]).forEach(([n,v,lump])=>{ (need[n]=need[n]||[]).push({k:x.s||x.n,v:`${v}<small style="color:#888">（${x.p}）</small>`,pc:1}); if(lump&&n==='重症癌症') tot.重症癌症+=lump; })); }
  const IC={住院:'🏥',手術:'🔪',重症癌症:'🎗️',失能長照:'♿',身故:'🕊️',豁免:'🛡️',其他保障:'📌'};
  const TL=n=>part[n]?'主要商品合計':'合計';
  const TT={住院:age>=69?`日額型每天合計 ${F(tot.住院)} 元＋實支另計`:'',重症癌症:tot.重症癌症?`確診最高${TL('重症癌症')} ${F(tot.重症癌症)} 元`:'',身故:tot.身故?(pt.length?`繳費期滿後${TL('身故')} ${F(tot.身故)} 元`:`${TL('身故')}至少 ${F(tot.身故)} 元`):''};
  // v1.53：CIA/CIB/CLZ/CLX 身故依已繳保費增加，合計以繳費期滿後計，灰字說明繳費期間
  const PTN=pt.length?`<div class="ndl" style="color:#888;font-size:12px">繳費期間身故：${pt.join('、')} 給付已繳保費×1.06（扣已領）${age<16&&pt.some(k=>k==='CIA'||k==='CIB')?'；保險年齡 16 歲前退還所繳保費':''}</div>`:'';
  // v1.71 富邦產物（報價頁 &pc= 帶入；保費為 DM 印製數字，null＝另計不入合計）
  let PCI=[]; try{ PCI=JSON.parse(new URLSearchParams(location.search).get('pc')||'[]')||[]; }catch(e){}
  const pcT=PCI.reduce((a,x)=>a+(+x.y||0),0), pcX=PCI.filter(x=>x.y==null).length;
  const yNT=L.reduce((a,x)=>a+(+x.y||0),0)+pcT, yUS=L.reduce((a,x)=>a+(+x.u||0),0), pend=L.filter(x=>x.pd).length, nM=L.filter(x=>x.h<0).length;
  let h=`<section class="card bsum"><div class="bhd">${age} 歲・${sex==1?'男':'女'}｜主約 ${nM}・附約 ${L.length-nM}${PCI.length?`・富邦產物 ${PCI.length}`:''}</div>
    <div class="bprem">首年實繳合計 <b>NT$ ${F(yNT)}</b>${yUS?` ＋ US$ <b>${F(yUS)}</b>`:''}<small>≈ 每月約 ${F(yNT/12)} 元${pend?`｜另 ${pend} 項待試算`:''}${pcX?`｜富邦產物 ${pcX} 項另計`:''}</small></div>
    ${swapped.length?`<div class="warn">${swapped.map(([a,b])=>`${a} 限${E[a].sexOnly===1?'男':'女'}性投保，被保人為${sex==1?'男':'女'}性，以下改以 ${b} 解說；請回報價頁更換商品`).join('；')}</div>`:''}<div class="bchips">${L.map(x=>`<span class="bchip${x.h<0?' m':''}">${x.h<0?'':'└ '}${x.c}</span>`).join('')}${PCI.map(x=>`<span class="bchip m">${x.n}</span>`).join('')}</div></section>`;
  h+=`<h2 class="h2">🧭 保障總覽</h2><section class="needs">`+Object.keys(need).map(n=>`<div class="nd${need[n].length?'':' off'}"><div class="ndh"><span class="ic">${IC[n]}</span><b>${n}</b>${TT[n]?`<span class="ndt">${TT[n]}</span>`:''}</div>`+(n==='身故'?PTN:'')+(need[n].length?need[n].map(r=>`<div class="ndl"><span class="pc${r.pc?' pcx':''}">${r.k}</span>${r.v}</div>`).join(''):'<div class="ndl none">這組沒有這項保障</div>')+`</div>`).join('')+(other.length?`<div class="nd"><div class="ndh"><span class="ic">📝</span><b>其他保單</b><span class="ndt">解說製作中</span></div>`+other.map(x=>`<div class="ndl"><span class="pc">${x.c}</span>${x.n||''}${x.a?'｜'+x.a:''}</div>`).join('')+`</div>`:'')+`</section>`;
  // v1.78：什麼情況賠哪張（t387u／t388u）；只列報價內有的類型
  { const W2=[], pn=re=>PCI.some(x=>re.test(x.n)||re.test(x.p||''));
    if(has('HSV').length||has('HSY').length) W2.push(['🏥','醫療實支','不管生病或意外都有']);
    if(has('TMR').length||pn(/加選|加值/)&&pn(/兒童|十全大補/)) W2.push(['🩹','意外實支','一定要意外造成才有']);
    if(['CLZ','CLX','CIA','CIB'].some(k=>has(k).length)||pn(/防癌|愛藥/)) W2.push(['🎗️','癌症','一定要癌症相關治療或住院才有']);
    if(W2.length) h+=`<section class="card" style="padding:10px 14px"><b>🧩 什麼情況賠哪張</b>`+W2.map(([i,a,b])=>`<div style="font-size:14px;margin-top:4px">${i} <b>${a}</b>：${b}</div>`).join('')+`</section>`; }
  // ---------- 合併理賠範例 ----------
  const ex=[]; const note=[];
  { // v1.48：住院範例依年齡分段（SJR1 倍數僅用 repo 內有出處者：膽囊切除 20 倍＝條款附表第 764 項；其餘標「依附表倍數」不估算）
    const ACC={t:'意外住院：前臂（橈骨尺骨）骨折開刀，住院 3 天',room:2000,med:80000,days:3,op:'骨折開放性復位術',acc:1};
    const HB0=age<=6?{t:'小兒肺炎住院 5 天（未開刀）',room:1500,med:20000,days:5,op:null}
      :age<=17?{t:'闌尾炎（盲腸炎）切除術，住院 4 天',room:2000,med:60000,days:4,op:'闌尾切除術'}
      :age<=39?ACC
      :{t:'腹腔鏡膽囊切除術，住院 5 天',room:2500,med:120000,days:5,op:'腹腔鏡膽囊切除術',x:20};
    const RUN=HB=>{
    const rows=[]; let sum=0; const room=HB.room, med=HB.med, days=HB.days; let hsvRoom=0, hsvMed=0;
    has('HSV').forEach(({c})=>{const l=HSVL[c.plan]; const r=Math.min(room,l.room)*days, m=Math.min(med,l.med), real=r+m, d=l.day*days; if(real>=d){hsvRoom=r;hsvMed=m;} rows.push([`HSV${c.plan}`, real>=d?`病房 ${F(r)}＋雜費 ${F(m)}（實支＞日額 ${F(d)}）`:`日額 ${F(l.day)}×${days}（日額＞實支 ${F(real)}）`, Math.max(real,d)]);});
    has('HSY').forEach(({c})=>{const l=HSYL[c.plan]; const r=Math.max(0,Math.min(room*days-Math.max(l.dR*days,hsvRoom),(l.R-l.dR)*days)), m=Math.max(0,Math.min(med-Math.max(l.dM,hsvMed),l.M-l.dM)); const noM=!hsvMed&&med<=l.dM;   // v1.51：未超過自負額時講清楚，不只寫 0（自負額取自 HSY 條款附表一）
      rows.push([`HSY${c.plan}`, noM?`醫療本次 ${W(med)}，未超過自負額 ${W(l.dM)}，HSY 不賠${r>0?`；病房差額 ${F(r)}`:''}`:`病房 ${F(r)}＋醫療 ${F(m)}（扣自負額或 HSV 已賠較大者）`, r+m]);});
    has('SJR1').forEach(({c})=>rows.push(['SJR1',!HB.op?'沒有手術，手術險不給付':HB.x?`${HB.op} ${HB.x} 倍：${F(c.sum)}×${HB.x}`:`${HB.op}：保額 ${F(c.sum)} × 條款附表倍數（範例未計入）`,HB.x?c.sum*HB.x:0]));
    // v1.58：意外骨折範例加 ADH／TMR；住院範例加 HKR5（銘旭大帝回報 ADH 漏算）
    const paid=rows.filter(r=>/^HS[VY]/.test(r[0])).reduce((t,r)=>t+r[2],0);   // 只扣實支型（HSV/HSY），定額型不扣
    if(HB.acc){ has('ADH').forEach(({c})=>rows.push(['ADH',`橈骨與尺骨完全骨折 40%：${F(c.S)}×40% ＋ 關懷 2%`,c.S*0.4*1.02]));
      has('ADM').forEach(({c})=>{const d=c.sum, fd=40, rest=Math.max(0,fd-days); rows.push(['ADM',`日額型：住院 ${F(d)}×${days} 天＋骨折日數表 40 天未住院部分 ${F(d)}×1/2×${rest} 天`,d*days+d*0.5*rest]);});
      has('TMR').forEach(({c})=>{const left=Math.max(0,room*days+med-paid), p=Math.min(c.S,left); rows.push(['TMR',p>0?`實支型：自付 ${F(room*days+med)} 扣 HSV/HSY 已賠 ${F(paid)} 後實支（上限 ${F(c.S)}）`:`實支型：自付 ${F(room*days+med)} 已由 HSV/HSY 憑收據正本賠完，不重複賠（TMR 第五條）`,p]);}); }
    has('HKR5').forEach(({c})=>{const d=c.sum; rows.push(['HKR5',`住院 ${F(d)}＋看護 ${F(d*0.5)}＋療養 ${F(d*0.5)}，×${days} 天${HB.op?`；${HB.op}另按附表比率（範例未計入）`:''}`,d*2*days]);});
    has('XWS5').forEach(({c})=>rows.push(['XWS5',age>=69?`老年住院 ${F(c.S*0.003)}×${days} 天`:`未滿 69 歲，老年住院不給付`,age>=69?c.S*0.003*days:0]));
    // v1.73：富邦產物併入理賠範例（依所選計畫；金額取自 DM／條款）
    const PI=x=>'ABCD'.indexOf((String(x.p).match(/計畫([A-D])/)||[])[1]), orig=has('HSV').length||has('HSY').length||has('TMR').length;
    PCI.forEach(x=>{const i=PI(x), s=x.s||x.n; if(i<0) return;
      if(/健康守護/.test(x.n)){const d=[1000,2000,3000][i]; rows.push([s,`住院 ${F(d)}×${days} 天＋看顧 ${F(d*0.5)}×${days} 天${HB.op?`；外科手術 ${F(d*30)}×附表比率（範例未計入）`:''}${HB.acc?'':'（假設已過首年 30 日等待期）'}`,d*1.5*days,1]);}
      if(/兒童/.test(x.n)&&HB.acc){const d=[1000,1500,2000][i], q=[500,750,1000][i], cap=[30000,45000,60000][i], rest=Math.max(0,40-days), fr=Math.min(cap,d*0.5*rest), lv=days>=3?3000:0;
        rows.push([s,`傷害住院 ${F(d)}×${days} 天＋安心療養 ${F(q)}×${days} 天${lv?'＋生活補助 3,000':''}＋骨折未住院 ${F(d)}×1/2×${rest} 天（橈骨與尺骨 40 天）`,d*days+q*days+lv+fr,1]);
        if(/加選/.test(x.p)){const lim=[30000,40000,50000][i], p=orig?0:Math.min(lim,room*days+med); rows.push([s,(orig?`傷害醫療實支：限收據正本，正本已交 HSV/HSY/TMR，不重複賠`:`傷害醫療實支 每次上限 ${F(lim)}`)+`；傷害骨折 ${['1','1.5','2'][i]} 萬×骨折表比例（範例未計入）`,p,1]);}}
      if(/十全大補/.test(x.n)&&HB.acc){const d=[500,600,700,1200][i]; rows.push([s,`傷害住院 ${F(d)}×${days} 天`,d*days,1]);}
      if(/璀璨/.test(x.n)&&HB.acc){const d=[500,1500,1500][i]; rows.push([s,`傷害住院 ${F(d)}×${days} 天`,d*days,1]);}
    });
    if(rows.some(r=>r[2]>0)||has('HSY').length){ ex.push({ic:'🏥',t:HB.t,d:`病房差額每天 ${F(room)}、自費醫療 ${F(med)}`,rows,n:HB.acc&&has('HSV').length&&has('TMR').length?'意外受傷住院，醫療實支（HSV）和意外實支（TMR）都可以申請：同一張收據正本先由 HSV 賠，HSV 沒賠完的部分再由 TMR 賠，不重複賠。':''}); }
    };
    RUN(HB0); if(!HB0.acc&&['ADH','ADM','TMR'].some(k=>has(k).length)) RUN(ACC);   // v1.58：有意外附約就一定出意外骨折範例
    // v1.51：只有 HSY（沒有 HSV）時，加一個超過自負額的大額範例；自負額／限額取自 HSY 條款附表一（每次限額 30 萬）
    if(has('HSY').length&&!has('HSV').length){ const big=250000, r2=[];
      has('HSY').forEach(({c})=>{const l=HSYL[c.plan], p=Math.min(Math.max(0,big-l.dM),l.M-l.dM); r2.push([`HSY${c.plan}`,`${W(big)} − 自負額 ${W(l.dM)}｜計劃 ${c.plan} 每次最多 ${W(l.M-l.dM)}`,p]);});
      ex.push({ic:'🧾',t:'住院開刀，醫療＋手術共 25 萬',d:'住院醫療、手術、前後門診合併成一筆計算',rows:r2}); }
  }
  { const rows=[]; const d6=age+5,   /* 第 6 保單年度＝投保年齡＋5 */ CA=P.filter(p=>p.D&&['CLZ','CLX','CIA','CIB'].includes(p.k));
    // v1.48：癌別依 window.CXS（有特定癌症加碼商品時）或 window.CX 的年齡／性別規則
    const R=CA.length?window.CXR(sex,d6):{x:window.CX(sex,d6),sp:false}, cx=R.x, cxT=window.CXT(cx);
    CA.forEach(({k,c})=>{const n6=Math.min(6,c.term), p6=c.annual*n6*1.06, sev=Math.max(c.S,p6);
      rows.push([k,R.sp?`重度：保額 ${F(c.S)} 與已繳 ${n6} 年保費×1.06 取較高者 ${F(sev)}＋特定癌症 50% ${F(c.S*0.5)}；之後保費免繳`:`重度癌症：保額 ${F(c.S)} 與已繳 ${n6} 年保費×1.06 取較高者 ${F(sev)}（${cx}不在特定癌症清單，不加碼）；之後保費免繳`,R.sp?sev+c.S*0.5:sev]);});
    has('SDG').forEach(({c})=>{const v=Math.max(c.S,c.annual*Math.min(6,c.term)*1.06); rows.push(['SDG',`取得重大傷病卡，一次給 ${F(v)}`,v]);});
    PCI.forEach(x=>{const s=x.s||x.n;
      if(/防癌/.test(x.n)) rows.push([s,'初次罹患癌症 5 萬（已過 90 日等待期）',50000,1]);
      if(/愛藥/.test(x.n)) rows.push([s,`若使用標靶藥物：依實際標靶藥費實支（3 年累計上限 ${/計畫B/.test(x.p)?'500':'300'} 萬；範例未計入）`,0,1]);
      if(/健康守護/.test(x.n)) rows.push([s,'若住院：癌症住院實支（範例未住院，未計入）',0,1]);});
    if(rows.length) ex.push({ic:'🎗️',t:`第 6 年確診${cxT}（${d6} 歲）`,d:'重度癌症＋取得健保重大傷病卡',rows});
  }
  if(ex.length){ h+=`<h2 class="h2">💡 合併理賠範例</h2><section class="exs">`+ex.map(e=>{const s=e.rows.reduce((a,r)=>a+r[2],0); return `<div class="ex"><div class="et">${e.ic} ${e.t}</div><div class="ec">${e.d}</div>${e.n?`<div class="ec" style="color:#0b5f8a">${e.n}</div>`:''}`+e.rows.map(r=>`<div class="exr"><span class="pc${r[3]?' pcx':''}">${r[0]}</span><span class="exd">${r[1]}</span><b>${r[2]>0?F(r[2]):'—'}</b></div>`).join('')+`<div class="ep">合計賠 ${F(s)} 元</div></div>`;}).join('')+`</section>`;
    const A=[]; if(has('HSV').length) A.push('HSV 實支實付與住院日額二擇一，範例自動取較高者');
    if(has('HSV').length&&has('HSY').length) A.push('HSV＋HSY 同一筆：先由 HSV 憑收據正本理賠，HSY 再扣「自負額」與「HSV 已賠」較大者（依 HSY 條款／DM 推算，實際以理賠審核為準）');
    if(has('HSY').length&&!has('HSV').length) A.push('搭配 HSV 時，HSV 已依收據賠付的部分可抵 HSY 自負額');
    if(has('HSV').length) A.push('住院手術費依 HSV 手術比率另行實支，範例未計入；收據金額為假設');
    if(has('SDG').length&&ex.length>1) A.push('癌症範例假設已取得健保重大傷病卡，SDG 才給付');
    A.push('各張保單依各自條款分別理賠；上方合計為報價頁首年實繳，各商品解說內保費為未折扣標準費率');
    h+=`<div class="card bnote"><b>📝 合併計算假設</b><ul>${A.map(a=>`<li>${a}</li>`).join('')}</ul></div>`;
  }
  // ---------- 各商品解說（可收合） ----------
  h+=`<h2 class="h2">📚 各商品解說（點開看）</h2>`;
  h+=P.map(({x,k,D,c})=>{const amt=x.a||'', pr=x.pd?'保費待試算':x.e?'設定不符':x.u?`US$ ${F(x.u)}`:`NT$ ${F(x.y||0)}`;
    const am2=k==='SJR1'&&c?`保額 ${F(c.sum)} 元`:amt;
    const head=`<summary><span class="pic">${D?D.icon||'📄':'📄'}</span><span class="st">${x.h<0?'':'└ '}<b>${x.c}</b> ${x.n||(D&&D.name)||''}<small>${am2}${am2?'｜':''}首年 ${pr}${D?'':'｜📝 解說製作中'}</small></span></summary>`;
    if(!D) return `<details class="bp todo">${head}<div class="ndl none">📝 解說製作中（先以 DM／建議書說明）</div></details>`;
    let b=''; try{ b+=`<div class="tag1">${D.tagline}</div><section class="grid">`+D.cards(c).map(q=>`<div class="bc"><div class="ic">${q.ic}</div><div class="bt">${q.t}</div><div class="big">${q.big}</div><div class="ln">${q.line}</div>${q.sub?`<div class="sb">${q.sub}</div>`:''}</div>`).join('')+`</section>`;
      if(D.tl){const t=D.tl(c); if(t) b+=`<div class="card">${t.svg}</div>`;}
      b+=`<section class="exs">`+D.examples(c).map(e=>`<div class="ex"><div class="et">${e.ic} ${e.t}</div><div class="ec">${e.calc}</div><div class="ep">${e.pay>0?(e.lbl||'賠')+' '+F(e.pay)+' 元':(e.zero||'—')}</div>${e.note?`<div class="en">${e.note}</div>`:''}</div>`).join('')+`</section>`;
      b+=`<div class="src">資料來源：${D.src.join('；')}</div><a class="src" href="explain.html?code=${k}&age=${age}&sex=${sex}${c.plan?'&plan='+c.plan:''}${c.sum?'&sum='+c.sum:''}${c.term?'&term='+c.term:''}">🔍 單獨打開（可調整）</a>`;
    }catch(e){ b='<div class="ndl none">📝 解說製作中</div>'; }
    return `<details class="bp">${head}${b}</details>`;}).join('');
  if(PCI.length) h+=`<h2 class="h2">🏢 富邦產物</h2>`+PCI.map(x=>`<details class="bp"><summary><span class="pic">🏢</span><span class="st"><b>${x.n}</b> ${x.t||''}<small>富邦產物｜${x.p}｜首年 ${x.y!=null?'NT$ '+F(x.y):'另計'}</small></span></summary><div class="ndl">${x.b||''}</div>${x.y==null?'<div class="ndl" style="color:#888;font-size:12px">另計：DM 無此年齡／計畫之印製保費，未計入合計</div>':''}</details>`).join('');
  h+=`<div class="src"><a href="index.html">← 回報價修改組合</a></div>`;
  $('#app').innerHTML=h;
};
})();
