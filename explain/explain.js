/* 解說頁通用模板 v1.28：explain.html?code=XWS5&age=30&sex=1&sum=100&term=20&plan=2 ；無 code＝商品選單 */
(function(){
const $=s=>document.querySelector(s), q=new URLSearchParams(location.search), E=window.EXPLAIN||{};
const fm=n=>Math.round(n).toLocaleString('zh-TW');
let ls={}; try{ls=JSON.parse(localStorage.getItem('fbq2')||'{}')}catch(e){}
const code=(q.get('code')||'').toUpperCase(), D=E[code];
const gAge=+(q.get('age')??ls.age??30), gSex=+(q.get('sex')??ls.sex??1);
if(!D){ picker(); return; }
// ---------- 商品選單 ----------
function picker(){
  document.body.classList.toggle('fem',gSex===2);
  $('#ttl').textContent='商品解說・選商品';
  const groups={}; Object.keys(E).forEach(k=>{(groups[E[k].cat]=groups[E[k].cat]||[]).push(k)});
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
  const [a0,a1]=ageRange(); const ageOk=st.age>=a0&&st.age<=a1;
  const c={age:st.age, sex:st.sex, term:st.term, sum:st.sum, plan:st.plan, S:(st.sum||0)*(I.unit==='萬'?1e4:1), payEnd:st.age+(st.term||0), H, fm};
  const pr=ageOk&&D.prem? D.prem(c) : null; c.annual=pr&&pr.annual||0; c.tot=c.annual*(st.term||0);
  $('#ttl').textContent=`${code} ${D.name}`;
  let inp='';
  let planRow=''; if(I.kind==='plan') planRow=`<div class="seg terms">${I.plans.map(p=>`<button data-p="${p.v}" class="${st.plan==p.v?'on':''}">${p.lbl}</button>`).join('')}</div>`;
  else if(I.kind!=='none') inp=`<label>${I.label||'保額'}（${I.unit}）<div class="agebox"><button data-m="-1">−</button><b>${fm(st.sum)}</b><button data-m="1">＋</button></div></label>`;
  let h=`<section class="card ctl"><div class="row3">
   <label>年齡<div class="agebox"><button data-a="-1">−</button><b>${st.age}</b><button data-a="1">＋</button></div></label>
   <label>性別<div class="seg">${D.sexOnly?`<button class="on">${D.sexOnly==1?'男性專屬':'女性專屬'}</button>`:`<button data-s="1" class="${st.sex==1?'on':''}">男</button><button data-s="2" class="${st.sex==2?'on':''}">女</button>`}</div></label>
   ${inp}</div>${planRow}
   ${D.terms&&D.terms.length>1?`<div class="seg terms">${D.terms.map(t=>`<button data-t="${t}" class="${st.term==t?'on':''}">${t} 年期</button>`).join('')}</div>`:''}
   <div class="prem">${!ageOk?`此年齡無法投保（${st.term?st.term+' 年期 ':''}投保年齡 ${a0}–${a1} 歲）`:pr?pr.txt:''}</div>
   ${D.warn&&D.warn(c)?`<div class="warn">${D.warn(c)}</div>`:''}</section>`;
  h+=`<div class="tag1">${D.tagline}</div><section class="grid">`+D.cards(c).map(k=>`<div class="bc"><div class="ic">${k.ic}</div><div class="bt">${k.t}</div><div class="big">${k.big}</div><div class="ln">${k.line}</div>${k.sub?`<div class="sb">${k.sub}</div>`:''}</div>`).join('')+`</section>`;
  if(D.tl){const t=D.tl(c); if(t) h+=`<h2 class="h2">${t.title}</h2><div class="card">${t.svg}</div>`;}
  h+=`<h2 class="h2">💡 理賠範例（${D.exLabel?D.exLabel(c):I.kind==='plan'?'計劃 '+st.plan:'保額 '+fm(st.sum)+' '+I.unit}）</h2><section class="exs">`+D.examples(c).map(e=>`<div class="ex"><div class="et">${e.ic} ${e.t}</div><div class="ec">${e.calc}</div><div class="ep">${e.pay>0?(e.lbl||'賠')+' '+fm(e.pay)+' 元':(e.zero||'—')}</div>${e.note?`<div class="en">${e.note}</div>`:''}</div>`).join('')+`</section>`;
  h+=`<div class="src">資料來源：${D.src.join('；')}</div><div class="src"><a href="explain.html?age=${st.age}&sex=${st.sex}">📚 其他商品解說</a></div>`;
  $('#app').innerHTML=h;
}
// ---------- 共用時間軸：bars [{from,to,label,color,row}] pts [[age,label]] ----------
window.EXPLAIN_TL=function(c,end,bars,pts){
  const a0=c.age, X=a=>20+(Math.min(a,end)-a0)/Math.max(1,end-a0)*560;
  let s=`<svg viewBox="0 0 600 ${76+bars.length*40}" role="img">`;
  s+=`<line x1="${X(a0)}" y1="20" x2="${X(end)}" y2="20" stroke="#9aa7b5" stroke-width="3"/>`;
  let last=-99; [...pts].sort((x,y)=>x[0]-y[0]).forEach(([a,l],i)=>{const x=X(a),dy=x-last<80?18:0; last=dy?-99:x; s+=`<circle cx="${x}" cy="20" r="6" fill="var(--c1)"/><text x="${Math.min(570,Math.max(30,x))}" y="${44+dy}" text-anchor="middle" font-size="15" fill="#333">${a}歲${l?' '+l:''}</text>`;});
  bars.forEach((b,i)=>{const y=70+i*40, x1=X(Math.max(b.from,a0)), x2=X(b.to); s+=`<rect x="${x1}" y="${y}" width="${Math.max(4,x2-x1)}" height="12" rx="6" fill="${b.color||'var(--c2)'}"/><text x="20" y="${y+30}" font-size="15" fill="#333">${b.label}</text>`;});
  return s+`</svg>`;
};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!D)return;
  const [a0,a1]=ageRange();
  if(b.dataset.a){st.age=Math.min(Math.max(a1,a0),Math.max(0,st.age+ +b.dataset.a));}
  if(b.dataset.s){st.sex=+b.dataset.s;}
  if(b.dataset.p){st.plan=+b.dataset.p;}
  if(b.dataset.t){st.term=+b.dataset.t;}
  if(b.dataset.m){st.sum=Math.min(I.max,Math.max(I.min, (I.stepFn?I.stepFn(st.sum,+b.dataset.m):st.sum+ +b.dataset.m*I.step)));}
  draw();});
draw();
})();
