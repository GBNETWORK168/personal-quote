// 依確診年齡／性別選常見癌症（範例用）。重度：<15 白血病；男 15–39 淋巴瘤、40–59 大腸癌、60+ 肺癌；女 15–29 淋巴瘤、30–59 乳癌、60+ 大腸癌。輕度：<40 甲狀腺癌；男 40–59 大腸癌、60+ 攝護腺癌；女 40+ 乳癌
window.CX=(sex,d,mild)=>{if(mild) return d<40?'甲狀腺癌':(sex===1?(d<60?'大腸癌':'攝護腺癌'):'乳癌'); if(d<15) return '急性白血病'; return sex===1?(d<40?'第二期以上淋巴瘤':d<60?'大腸癌':'肺癌'):(d<30?'第二期以上淋巴瘤':d<60?'乳癌':'大腸癌');};
// 特定癌症（CIA／CIB／CLZ／CLX 加碼清單內）：男 <40 睪丸癌、40+ 大腸癌；女 <25 卵巢癌、25–39 子宮頸癌、40+ 乳癌
window.CXS=(sex,d)=>sex===1?(d<40?'睪丸癌':'大腸癌'):(d<25?'卵巢癌':d<40?'子宮頸癌':'乳癌');
// v1.48 寫實癌別：0–14 歲用 CX（白血病，不在特定癌症清單、不加碼）；女性 15–24 用 CX（淋巴瘤，不加碼）；其餘用特定癌症 CXS（加碼）
window.CXR=(sex,d)=>(d<15||(sex===2&&d<25))?{x:window.CX(sex,d),sp:false}:{x:window.CXS(sex,d),sp:true};
window.CXT=x=>/白血病|淋巴瘤/.test(x)?x:'第二期'+x;
// 同頁避免重複：與 y 相同時換另一個常見癌症
window.CXD=(x,y)=>x!==y?x:({'急性白血病':'第二期以上淋巴瘤','第二期以上淋巴瘤':'急性白血病','大腸癌':'肺癌','肺癌':'大腸癌','乳癌':'大腸癌','甲狀腺癌':'第二期以上淋巴瘤','攝護腺癌':'大腸癌'}[x]||x);
/* 解說頁通用模板 v1.32：explain.html?bundle=[...] 保障總覽；?code=XWS5&age=30&sex=1&sum=100&term=20&plan=2 ；無 code＝商品選單 */
(function(){
const $=s=>document.querySelector(s), q=new URLSearchParams(location.search), E=window.EXPLAIN||{};
const fm=n=>Math.round(n).toLocaleString('zh-TW');
let ls={}; try{ls=JSON.parse(localStorage.getItem('fbq2')||'{}')}catch(e){}
const code=(q.get('code')||'').toUpperCase(), D=E[code];
const gAge=+(q.get('age')??ls.age??30), gSex=+(q.get('sex')??ls.sex??1);
// ---------- 共用時間軸：bars [{from,to,label,color,row}] pts [[age,label]] ----------
window.EXPLAIN_TL=function(c,end,bars,pts){
  // v1.31：年齡標籤自動分行避免重疊（每行記錄右緣，放不下就往下一行）；兩端靠齊不出界
  const a0=c.age, X=a=>20+(Math.min(a,end)-a0)/Math.max(1,end-a0)*560;
  const P=[]; [...pts].sort((x,y)=>x[0]-y[0]).forEach(([a,l])=>{const q=P.find(p=>p[0]===a); if(q){ if(l&&!q[1].split('・').includes(l)) q[1]=q[1]?q[1]+'・'+l:l; } else P.push([a,l||''])});
  const rowsR=[], L=P.map(([a,l])=>{const x=X(a), txt=`${a}歲${l?' '+l:''}`, w=txt.length*13+8;
    let anc='middle', x0=x-w/2; if(x0<4){anc='start';x0=Math.max(4,x-6);} else if(x+w/2>596){anc='end';x0=Math.min(x+6,596)-w;}
    let r=0; while(rowsR[r]!=null&&rowsR[r]>x0) r++; rowsR[r]=x0+w; return {x,txt,anc,r,tx:anc==='start'?Math.max(4,x-6):anc==='end'?Math.min(596,x+6):x};});
  const nr=Math.max(1,rowsR.length), top=52+nr*24;
  let s=`<svg class="tls" viewBox="0 0 600 ${top+6+bars.length*40}" role="img">`;
  s+=`<line x1="${X(a0)}" y1="20" x2="${X(end)}" y2="20" stroke="#9aa7b5" stroke-width="3"/>`;
  L.forEach(o=>{s+=`<circle cx="${o.x}" cy="20" r="6" fill="var(--c1)"/>`+(o.r?`<line x1="${o.x}" y1="26" x2="${o.x}" y2="${30+o.r*24}" stroke="#c5ced8" stroke-width="1"/>`:'')+`<text x="${o.tx}" y="${44+o.r*24}" text-anchor="${o.anc}" font-size="15" fill="#333">${o.txt}</text>`;});
  bars.forEach((b,i)=>{const y=top+i*40, x1=X(Math.max(b.from,a0)), x2=X(b.to); s+=`<rect x="${x1}" y="${y}" width="${Math.max(4,x2-x1)}" height="12" rx="6" fill="${b.color||'var(--c2)'}"/><text x="20" y="${y+30}" font-size="15" fill="#333">${b.label}</text>`;});
  // v1.54：窄螢幕改用直式時間軸（字級 ≥14px）
  const vt=`<ol class="vtl">`+P.map(([a,l])=>`<li><b>${a} 歲</b>${l?' '+l:''}</li>`).join('')+bars.map(b=>`<li class="bar"><i style="background:${b.color||'var(--c2)'}"></i>${Math.max(b.from,a0)}～${Math.min(b.to,end)} 歲｜${b.label}</li>`).join('')+`</ol>`;
  return s+`</svg>`+vt;
};
if(q.get('bundle')){ try{ window.EXPLAIN_BUNDLE(JSON.parse(q.get('bundle')), gAge, gSex); }catch(e){ console.error(e); $('#app').innerHTML='<div class="card warn">保障總覽資料讀取失敗，請回報價頁重新按「📖 保障總覽」。</div>'; } return; }
if(!D){ picker(); return; }
// ---------- 商品選單 ----------
function picker(){
  document.body.classList.toggle('fem',gSex===2);
  $('#ttl').textContent='商品解說・選商品';
  const NEW=['CIA','CIB','SDP'].filter(k=>E[k]); const groups={}; if(NEW.length) groups['🆕 新商品']=NEW; Object.keys(E).forEach(k=>{if(NEW.includes(k))return; (groups[E[k].cat]=groups[E[k].cat]||[]).push(k)});
  let h=(code?`<div class="card warn">此商品（${code}）的解說頁尚未建立，請從下方選擇。</div>`:'');
  h+=Object.keys(groups).map(g=>`<h2 class="h2">${g}</h2><div class="plist">`+groups[g].map(k=>{const d=E[k];
    const sx=d.sexOnly&&d.sexOnly!==gSex?` <span class="sx">${d.sexOnly==1?'男性':'女性'}專屬</span>`:'';
    return `<a class="pitem" href="explain.html?code=${k}&age=${gAge}&sex=${d.sexOnly||gSex}"><span class="pic">${d.icon||'📄'}</span><span><b>${k}</b> ${d.name}${sx}<br><small>${d.tagline}</small></span></a>`}).join('')+`</div>`).join('');
  $('#app').innerHTML=h;
}
// ---------- 狀態 ----------
const I=D.input||{kind:'none'};
const st={age:gAge, sex:D.sexOnly||gSex, term:+(q.get('term')||0)||(D.terms?D.terms[D.defTerm??0]:0)};
if(I.kind==='plan') st.plan=+(q.get('plan')||I.def||1); else if(I.kind!=='none') st.sum=+(q.get('sum')||((ls.sel||{})[code]||{}).sum||I.def);
if(I.kind!=='plan'&&I.kind!=='none'&&!(st.sum>0)) st.sum=I.def;
if(D.terms&&!D.terms.includes(st.term)) st.term=D.terms[D.defTerm??0];
const ageRange=()=>D.ageOf?D.ageOf(st.term):D.ages;
const H={fm, rateMain(sfx){const R=(window.RATES||{})[code]; const r=R&&R[`${code}|${st.term}|${st.sex}`]; if(!r) return null; const v=r[1][st.age-r[0]]; return v==null?null:v;},
  rateRider(rc,key){const R=(window.RIDER_RATES||{})[rc]; const r=R&&R.t[key]; if(!r) return null; const v=r[1][st.age-r[0]]; return v==null?null:v;}};
function draw(){
  document.body.classList.toggle('fem',st.sex===2);
  let autoT=''; if(D.terms&&D.ageOf){const [b0,b1]=ageRange(); if(st.age<b0||st.age>b1){const t=D.terms.slice().reverse().find(t=>{const [x,y]=D.ageOf(t); return st.age>=x&&st.age<=y;}); if(t){autoT=`👉 ${st.age} 歲不能投保 ${st.term} 年期，已自動改為 ${t} 年期`; st.term=t;}}}   // v1.60：年齡超過所選年期時自動換可投保年期，避免顯示 0 元
  const [a0,a1]=ageRange(); const ageOk=st.age>=a0&&st.age<=a1;
  const c={age:st.age, sex:st.sex, term:st.term, sum:st.sum, plan:st.plan, S:(st.sum||0)*(I.unit==='萬'?1e4:1), payEnd:st.age+(st.term||0), H, fm};
  const pr=ageOk&&D.prem? D.prem(c) : null; c.annual=pr&&pr.annual||0; c.tot=c.annual*(st.term||0);
  $('#ttl').textContent=`${code} ${D.name}`;
  let inp='';
  let planRow=''; if(I.kind==='plan') planRow=`<div class="seg terms">${I.plans.map(p=>`<button data-p="${p.v}" class="${st.plan==p.v?'on':''}">${p.lbl}</button>`).join('')}</div>`;
  else if(I.kind!=='none') inp=`<label class="lsum">${(I.label||'保額')+((I.label||'').includes(I.unit)?'':'（'+I.unit+'）')}<div class="agebox"><button data-m="-1">−</button><input class="nin" data-in="m" type="number" inputmode="${I.round?'numeric':'decimal'}" step="${I.round||'any'}" min="${I.min}" max="${I.max}" value="${st.sum}"><button data-m="1">＋</button></div></label>`;
  let h=(D.key30&&ageOk?`<section class="k30"><b>⏱️ 30 秒重點</b>${D.key30(c,D.cards(c)).map(([t,i])=>`<button class="k30l" data-go="${i}">${t}<small>點一下看細節 ›</small></button>`).join('')}</section>`:'')+`<section class="card ctl"><div class="row3">
   <label>年齡<div class="agebox"><button data-a="-1">−</button><input class="nin" data-in="a" type="number" inputmode="numeric" min="0" value="${st.age}"><button data-a="1">＋</button></div></label>
   <label>性別<div class="seg">${D.sexOnly?`<button class="on">${D.sexOnly==1?'男性專屬':'女性專屬'}</button>`:`<button data-s="1" class="${st.sex==1?'on':''}">男</button><button data-s="2" class="${st.sex==2?'on':''}">女</button>`}</div></label>
   ${inp}</div>${planRow}
   ${D.terms&&D.terms.length>1?`<div class="seg terms">${D.terms.map(t=>`<button data-t="${t}" class="${st.term==t?'on':''}">${t} 年期</button>`).join('')}</div>`:''}
   ${autoT?`<div class="prem" style="color:#b45309">${autoT}</div>`:''}<div class="prem">${!ageOk?`此年齡無法投保（${st.term?st.term+' 年期 ':''}投保年齡 ${a0}–${a1} 歲）`:pr?pr.txt:''}</div>
   ${D.warn&&D.warn(c)?`<div class="warn">${D.warn(c)}</div>`:''}</section>`;
  h+=(D.key30?'':`<div class="tag1">${D.tagline}</div>`)+`<section class="grid">`+D.cards(c).map((k,i)=>`<div class="bc" id="bc${i}"><div class="ic">${k.ic}</div><div class="bt">${k.t}</div><div class="big">${k.big}</div><div class="ln">${k.line}</div>${k.sub?`<div class="sb">${k.sub}</div>`:''}</div>`).join('')+`</section>`;
  if(D.tl){const t=D.tl(c); if(t) h+=`<h2 class="h2">${t.title}</h2><div class="card">${t.svg}</div>`;}
  h+=`<h2 class="h2">💡 理賠範例（${D.exLabel?D.exLabel(c):I.kind==='plan'?'計劃 '+st.plan:'保額 '+(D.cur==='USD'?'US$ '+fm(st.sum):fm(st.sum)+' '+I.unit)}）</h2><section class="exs">`+D.examples(c).map(e=>`<div class="ex"><div class="et">${e.ic} ${e.t}</div><div class="ec">${e.calc}</div><div class="ep">${e.pay>0?(e.lbl||'賠')+' '+(D.cur==='USD'?'US$ '+fm(e.pay):fm(e.pay)+' 元'):(e.zero||'—')}</div>${e.note?`<div class="en">${e.note}</div>`:''}</div>`).join('')+`</section>`;
  h+=`<div class="src">資料來源：${D.src.join('；')}</div><div class="src"><a href="explain.html?age=${st.age}&sex=${st.sex}">📚 其他商品解說</a></div>`;
  $('#app').innerHTML=h;
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!D)return;
  if(b.dataset.go!=null){const el=document.getElementById('bc'+b.dataset.go); if(el){el.scrollIntoView({behavior:'smooth',block:'center'}); el.classList.remove('hl'); void el.offsetWidth; el.classList.add('hl');} return;}
  const [a0,a1]=ageRange();
  if(b.dataset.a){st.age=Math.min(Math.max(a1,a0),Math.max(0,st.age+ +b.dataset.a));}
  if(b.dataset.s){st.sex=+b.dataset.s;}
  if(b.dataset.p){st.plan=+b.dataset.p;}
  if(b.dataset.t){st.term=+b.dataset.t;}
  if(b.dataset.m){st.sum=Math.min(I.max,Math.max(I.min, (I.stepFn?I.stepFn(st.sum,+b.dataset.m):st.sum+ +b.dataset.m*I.step)));}
  draw();});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.in||!D)return; const v=parseFloat(t.value); if(isNaN(v)){draw();return;}
  const [a0,a1]=ageRange();
  if(t.dataset.in==='a') st.age=Math.min(Math.max(a1,a0),Math.max(0,Math.round(v)));
  if(t.dataset.in==='m') st.sum=Math.min(I.max,Math.max(I.min,I.round?Math.round(v/I.round)*I.round:v));   // v1.49：有 round 的商品保額取整數單位
  draw();});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.in) e.target.blur();});
draw();
})();
