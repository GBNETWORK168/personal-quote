/* 解說頁通用模板 v1.27：explain.html?code=XWS5&age=30&sex=1&sum=100 */
(function(){
const $=s=>document.querySelector(s), q=new URLSearchParams(location.search);
const code=(q.get('code')||'XWS5').toUpperCase(), D=(window.EXPLAIN||{})[code];
const fm=n=>Math.round(n).toLocaleString('zh-TW');
if(!D){ $('#app').innerHTML=`<div class="card">此商品（${code}）的解說頁尚未建立，目前有：${Object.keys(window.EXPLAIN||{}).join('、')}</div>`; return; }
let ls={}; try{ls=JSON.parse(localStorage.getItem('fbq2')||'{}')}catch(e){}
const st={age:+(q.get('age')??ls.age??30), sex:+(q.get('sex')??ls.sex??1), sum:+(q.get('sum')||((ls.sel||{})[code]||{}).sum||D.defSum)};
const R=(window.RATES||{})[code];
function rate(){ const r=R&&R[`${code}|${D.term}|${st.sex}`]; return r? r[1][st.age-r[0]] : null; }
function draw(){
  document.body.classList.toggle('fem',st.sex===2);
  const rt=rate(), annual=rt? rt*st.sum : 0, S=st.sum*1e4, payEnd=st.age+D.term;
  const ctx={S,age:st.age,sex:st.sex,annual,tot:annual*D.term,payEnd};
  $('#ttl').textContent=`${code} ${D.name}`;
  let h=`<section class="card ctl"><div class="row3">
   <label>年齡<div class="agebox"><button data-a="-1">−</button><b>${st.age}</b><button data-a="1">＋</button></div></label>
   <label>性別<div class="seg"><button data-s="1" class="${st.sex==1?'on':''}">男</button><button data-s="2" class="${st.sex==2?'on':''}">女</button></div></label>
   <label>保額（萬）<div class="agebox"><button data-m="-10">−</button><b>${st.sum}</b><button data-m="10">＋</button></div></label></div>
   <div class="prem">${rt?`20 年期・年繳 <b>NT$ ${fm(annual)}</b>（未折扣）・20 年共 ${fm(ctx.tot)}`:'此年齡無費率（投保年齡 0–65 歲）'}</div>
   ${st.sum<D.min?`<div class="warn">保額 ${D.minHSV} 萬須同時附加 HSV 住院附約；一般最低 ${D.min} 萬</div>`:''}</section>`;
  h+=`<div class="tag1">${D.tagline}</div><section class="grid">`+D.cards(ctx).map(c=>`<div class="bc${c.from&&st.age<c.from?'':''}"><div class="ic">${c.ic}</div><div class="bt">${c.t}</div><div class="big">${c.big}</div><div class="ln">${c.line}</div><div class="sb">${c.sub}</div></div>`).join('')+`</section>`;
  h+=`<h2 class="h2">📈 一生時間軸</h2><div class="card">${tl(ctx)}</div>`;
  h+=`<h2 class="h2">💡 理賠範例（保額 ${st.sum} 萬）</h2><section class="exs">`+D.examples(ctx).map(e=>`<div class="ex"><div class="et">${e.ic} ${e.t}</div><div class="ec">${e.calc}</div><div class="ep">${e.pay>0?(e.lbl||'賠')+' '+fm(e.pay)+' 元':'—'}</div>${e.note?`<div class="en">${e.note}</div>`:''}</div>`).join('')+`</section>`;
  h+=`<div class="src">資料來源：${D.src.join('；')}</div>`;
  $('#app').innerHTML=h;
}
function tl(c){
  const pts=[[c.age,'投保',`${c.age}歲`],[c.payEnd,'繳費完',`${c.payEnd}歲`],[69,'老年住院起',`69歲`],[110,'祝壽',`110歲`]].sort((a,b)=>a[0]-b[0]);
  const X=a=>20+(a-c.age)/(110-c.age)*560;
  let s=`<svg viewBox="0 0 600 150" role="img">`;
  s+=`<rect x="${X(c.age)}" y="58" width="${X(c.payEnd)-X(c.age)}" height="14" rx="7" fill="var(--c2)"/><text x="${(X(c.age)+X(c.payEnd))/2}" y="50" text-anchor="middle" font-size="13" fill="var(--c1)">💰 繳費 20 年・🛡️失能可免繳</text>`;
  s+=`<rect x="${X(Math.max(69,c.age))}" y="80" width="${X(110)-X(Math.max(69,c.age))}" height="14" rx="7" fill="#e8a33d"/><text x="${(X(Math.max(69,c.age))+X(110))/2}" y="110" text-anchor="middle" font-size="13" fill="#8a5a10">🏥 每天 ${fm(c.S*0.003)} 元</text>`;
  s+=`<line x1="${X(c.age)}" y1="30" x2="${X(110)}" y2="30" stroke="#9aa7b5" stroke-width="3"/><text x="${X(c.age)+4}" y="22" font-size="12" fill="#5a6577">🕊️ 身故／完全失能保障終身</text>`;
  let last=-99; pts.forEach(([a,l,t])=>{const x=X(a),dy=x-last<60?16:0; last=x; s+=`<circle cx="${x}" cy="30" r="6" fill="var(--c1)"/><text x="${x}" y="${132+dy}" text-anchor="middle" font-size="12" fill="#333">${t}${l?' '+l:''}</text>`;});
  return s+`</svg>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.a){st.age=Math.min(65,Math.max(0,st.age+ +b.dataset.a));}
  if(b.dataset.s){st.sex=+b.dataset.s;}
  if(b.dataset.m){const d=+b.dataset.m; st.sum = st.sum<10&&d>0?10 : st.sum+d<10?5 : Math.min(2000,st.sum+d);}
  draw();});
draw();
})();
