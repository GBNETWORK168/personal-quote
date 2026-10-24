// 搭配專區 v1.40：新版男女癌 CIA／CIB、CLZ／CLX＋PFD（不做 SDP＋PFD，YT 確認 2026-10-22）（單張 30 萬做不到才拆兩張 PFD）
// 原 v0.2：癌症險（男 CLZ／女 CLX）＋PFD，只用 M 情境。CLZ/CLX 用四季春引擎；PFD 用張仕鎮已驗證 engine.js，按開始才載入
(function(){
const $=id=>document.getElementById(id), f=n=>Math.round(n).toLocaleString('zh-TW'), SC=2;
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});
const st={sex:1,T:20,Y:30,pk:'new'};
const PK={new:{c:{1:'CIA',2:'CIB'},T:[20,10,30],s:[50,500],kw:'癌症',kn:'防癌險'},old:{c:{1:'CLZ',2:'CLX'},T:[20,10],s:[50,300],kw:'癌症',kn:'防癌險'}};
const codeOf=()=>PK[st.pk].c[st.sex];window.ComboState=st;let ready=null,on=false;
window.pfdLoad=()=>window.__pfdP||(window.__pfdP=Promise.all([load('combo/pfd_engine.js?v=c01'),load('combo/pfd_data.js?v=c01')]).catch(e=>{window.__pfdP=null;throw e;}));
const seg=(id,k)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{st[k]=+b.dataset.v;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(k==='sex')document.body.classList.toggle('f',st.sex===2);if(on)run();});
function pkUI(){const k=PK[st.pk];if(!k.T.includes(st.T))st.T=k.T[0];
  $('tb').innerHTML=k.T.map(t=>`<button data-v="${t}" class="${t===st.T?'on':''}">${t} 年</button>`).join('');seg('tb','T');
  document.querySelectorAll('#sexb .cc').forEach((e,i)=>e.textContent=k.c[i+1]);$('sLbl').textContent=st.pk==='sdp'?'重大傷病':'癌症險';
  const S=$('clzS');S.min=k.s[0];S.max=k.s[1];$('sRng').textContent=`${k.s[0]}–${k.s[1]} 萬`;
  document.querySelectorAll('#pkb button').forEach(x=>x.classList.toggle('on',x.dataset.v===st.pk));}
document.querySelectorAll('#pkb button').forEach(b=>b.onclick=()=>{st.pk=b.dataset.v;pkUI();if(on)run();});
seg('sexb','sex');pkUI();
const MINY=20,maxY=()=>Math.max(MINY,100-(+$('age').value||0)+1);
function fillY(){const m=maxY(),sel=$('ysel');document.querySelectorAll('#yb button').forEach(x=>x.classList.toggle('on',+x.dataset.v===st.Y));if(st.Y>m)st.Y=m;if(st.Y<MINY)st.Y=MINY;sel.innerHTML=Array.from({length:m-MINY+1},(_,i)=>i+MINY).map(y=>`<option value="${y}"${y===st.Y?' selected':''}>${y}</option>`).join('');}
seg('yb','Y');document.querySelectorAll('#yb button').forEach(x=>x.addEventListener('click',fillY));fillY();$('ysel').onchange=()=>{st.Y=+$('ysel').value;fillY();if(on)run();};$('age').addEventListener('change',fillY);
function cRows(code,age,S,T,nd){const p=window.PRODUCTS.find(x=>x.code===code);const r=window.QuoteEngine.quote(p,{age,sex:st.sex,occ:1,term:T,sum:S,mode:'年繳',payDisc:!nd});
  if(r.errs)return {err:r.errs.join('；')};const rows=[];let c=0;for(let t=1;t<=120;t++){const py=t>T?0:(r.from2&&t>=r.from2&&r.paid2!=null?r.paid2:r.paid);c+=py;rows.push({py,cum:c});}return {rows,first:r.paid};}
function pfd(age,S){const P=window.PFD_P,M=P.meta,D=P.data;const pr=ENG.prem(M,D,st.sex,age,20,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,D,st.sex,age,20,S,SC,'PUA',pr.p1,pr.p2),{p1:pr.p1,p2:pr.p2});}
function run(){const age=+$('age').value,S=+$('clzS').value,fx=+$('fx').value,Y=st.Y,T=st.T,code=codeOf(),K=PK[st.pk],o=$('out');
  const M=window.PFD_P.meta,tA=M.terms['20'];if(age<tA[0]||age>tA[1]){o.innerHTML=`<div class="card no">PFD 20 年期限 ${tA[0]}–${tA[1]} 歲</div>`;return;}
  const C=cRows(code,age,S,T);if(C.err){o.innerHTML=`<div class="card no">${code}：${C.err}</div>`;return;}
  const qs=[];for(let s=Math.round(M.smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(age,s/10);if(x)qs.push([s/10,x]);}
  const okY=(x,y)=>{const r=x.rows[y-1];return !!r&&r.X*fx>=C.rows[y-1].cum+r.cum*fx;};
  let Sp=null,q=null;for(const [s,x] of qs)if(okY(x,Y)){Sp=s;q=x;break;}
  if(Sp==null){const sp=split(qs,C,Y,fx);if(sp){o.innerHTML=splitHtml(sp,C,code,T,Y,fx,age);return;}
    let e=null;for(let y=MINY;y<=maxY()&&e==null;y++)if(qs.some(([,x])=>okY(x,y)))e=y;
    o.innerHTML=`<div class="card big"><div class="no">第 ${Y} 年領回：PFD 買到 ${M.smax} 萬美元也做不到</div><div class="be" style="color:var(--d)">${e?'最早可以：第 '+e+' 年':'到 100 歲都做不到'}</div>${e?`<div style="text-align:center"><button type="button" id="goE" style="font-size:18px;padding:8px 16px;border:0;border-radius:10px;background:var(--d);color:#fff">改成第 ${e} 年</button></div>`:''}</div>`;
    if(e)$('goE').onclick=()=>{st.Y=e;fillY();run();};return;}
  const tot=t=>C.rows[t-1].cum+q.rows[t-1].cum*fx, sv=t=>q.rows[t-1].X*fx, be=q.rows.findIndex((r,i)=>sv(i+1)>=tot(i+1))+1;
  const yrBoth=C.first+q.p1*fx, cat=(window.CATALOG||[]).find(z=>z.code===code)||{}, mE=/(\d+)\s*歲/.exec(cat.cover||''), cEnd=st.pk==='new'?95:(mE?+mE[1]:0), isN=st.pk==='new', Sw=S*1e4;
  // v1.61：20／25／30 年領回對照（同一套最小保額邏輯，單張不夠才拆兩張）
  const cmp=[20,25,30].filter(y=>y<=maxY()).map(y=>{for(const [s,x] of qs)if(okY(x,y))return {y,mo:(C.first+x.p1*fx)/12,S:s+' 萬',X:x.rows[y-1].X*fx};
    const sp=split(qs,C,y,fx);return sp?{y,mo:(C.first+(sp.A.q.p1+sp.B.q.p1)*fx)/12,S:sp.A.S+'＋'+sp.B.S+' 萬',X:(sp.A.q.rows[y-1].X+sp.B.q.rows[y-1].X)*fx}:{y};});
  const g='style="color:#7a8594;font-size:13px"', c106=(cRows(code,age,S,T,1).rows||C.rows)[T-1].cum*1.06;   // 條款：年繳保費總和（未折扣，同 explain/CIAB.js c.tot）
  let h=`<div class="card big">
   <div class="one">每月 ${f(yrBoth/12)} 元，${K.kw}保障 ${S} 萬到 ${cEnd} 歲，${age+Y-1} 歲時兩張保單繳的錢全部領回。</div>
   <div class="k">PFD 保額</div><div class="v">${Sp} 萬美元</div><div ${g}>第 1 年身故約 US$ ${f(q.rows[0].W)}，逐年增加</div>
   <div class="grid" style="margin-top:8px">
    <div><div class="k">PFD 年繳（20 年）</div><b>US$ ${f(q.p1)}</b><br><span class="k">≈ NT$ ${f(q.p1*fx)}</span></div>
    <div><div class="k">${code} 年繳（${T} 年）</div><b>NT$ ${f(C.first)}</b></div>
    <div><div class="k">兩張合計年繳</div><b>NT$ ${f(yrBoth)}</b></div>
    <div><div class="k">第 ${Y} 年</div>已繳 <b>NT$ ${f(tot(Y))}</b><br>解約領回 <b>NT$ ${f(sv(Y))}</b></div>
   </div>
   <div class="be">✅ 第 ${be} 年回本</div></div>
  <div class="card"><b>幾年領回？</b><table class="cmp"><thead><tr><th>領回年份</th><th>月繳</th><th>PFD 保額<br>(美元)</th><th>領回 NT$</th></tr></thead><tbody>${cmp.map(r=>`<tr class="${r.y===Y?'hit':''}" data-y="${r.y}"><td>第${r.y}年領回</td>${r.mo?`<td>${f(r.mo)}</td><td>${r.S}</td><td>${f(r.X)}</td>`:'<td colspan="3">做不到</td>'}</tr>`).join('')}</tbody></table></div>
  ${isN?`<div class="card"><b>${code} ${K.kn}</b>
   <ul class="pts"><li>重度癌症至少 ${f(Sw)}，之後保費免繳</li><li>特定癌症最高 ${f(Sw*1.5)} <span ${g}>（第 6 年起）</span></li><li>初期癌症 ${f(Sw*0.1)}</li><li>特定手術 ${f(Sw*0.02)}</li><li>特定傷病 ${f(Sw*0.1)} <span ${g}>（意外）</span></li><li>身故／95 歲祝壽：已繳×1.06 <span ${g}>（扣除已領）</span></li></ul>
   <div class="c106">🎁 106% 不白繳<b>NT$ ${f(c106)}</b><span ${g}>沒用到，身故或 95 歲領回（扣除已領）</span></div></div>`:''}
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳</th><th>PFD 解約金</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(sv(t))}</td></tr>`;
  o.innerHTML=h+'</tbody></table><div class="k" style="font-size:12px">金額：新台幣</div></details></div>';
  if(window.ComboDiagram)window.ComboDiagram(o,{age,fx,C,q,code,T,be,Y,Sp,S,kw:K.kw,kn:K.kn,cEnd,isN});
  o.querySelectorAll('table.cmp tr[data-y]').forEach(r=>r.onclick=()=>{st.Y=+r.dataset.y;fillY();run();});}
// v1.40 拆單：單張 30 萬做不到第 Y 年領回時，PFD 拆兩張（A 張 30 萬＋B 張最低，0.1 萬一級），兩張第 Y 年都全部解約
function split(qs,C,Y,fx){const A=qs.find(([s])=>s===qs[qs.length-1][0]);if(!A||!A[1].rows[Y-1])return null;
  for(const [s,x] of qs){const a=A[1].rows[Y-1],b=x.rows[Y-1];if(b&&(a.X+b.X)*fx>=C.rows[Y-1].cum+(a.cum+b.cum)*fx)return {A:{S:A[0],q:A[1]},B:{S:s,q:x}};}return null;}
function splitHtml(sp,C,code,T,Y,fx,age){const {A,B}=sp,tot=t=>C.rows[t-1].cum+(A.q.rows[t-1].cum+B.q.rows[t-1].cum)*fx,sv=t=>(A.q.rows[t-1].X+B.q.rows[t-1].X)*fx;
  const be=A.q.rows.findIndex((r,i)=>B.q.rows[i]&&sv(i+1)>=tot(i+1))+1,yr=A.q.p1+B.q.p1;
  let h=`<div class="card big" id="splitCard"><div class="k">單張 PFD（上限 30 萬）做不到 → PFD 拆兩張</div><div class="v">${A.S} 萬＋${B.S} 萬美元</div>
   <div class="grid" style="margin-top:8px">
    <div><div class="k">PFD 兩張年繳（20 年）</div><b>US$ ${f(yr)}</b><br><span class="k">≈ NT$ ${f(yr*fx)}</span></div>
    <div><div class="k">${code} 年繳（${T} 年）</div><b>NT$ ${f(C.first)}</b></div>
    <div><div class="k">三張合計年繳</div><b>NT$ ${f(C.first+yr*fx)}</b></div>
    <div><div class="k">第 ${Y} 年</div>已繳 <b>NT$ ${f(tot(Y))}</b><br>兩張解約金 <b>NT$ ${f(sv(Y))}</b></div></div>
   <div class="be">✅ 第 ${be} 年回本（兩張 PFD 都全部解約）</div></div>
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳</th><th>兩張 PFD 解約金</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(sv(t))}</td></tr>`;
  return h+'</tbody></table><div class="k" style="font-size:12px">金額：新台幣</div></details></div>';}
window.ComboSplit=split;
window.ComboRun=run;
// v1.61：手機按試算後收起輸入區、結果捲到最上面
function collapse(){if(innerWidth>=900)return;const c=$('open').closest('.card');let t=$('edit');if(!t){t=document.createElement('button');t.id='edit';t.type='button';c.parentNode.insertBefore(t,c);t.onclick=()=>{c.hidden=!c.hidden;t.textContent=c.hidden?'⚙️ 修改條件 ▼':'▲ 收起條件';};}
  c.hidden=true;t.textContent='⚙️ 修改條件 ▼';requestAnimationFrame(()=>t.scrollIntoView({block:'start'}));}
$('open').onclick=()=>{$('open').disabled=true;$('open').textContent='載入中…';ready=window.pfdLoad();
  ready.then(()=>{try{$('open').style.display='none';on=true;run();collapse();['age','clzS','fx'].forEach(i=>$(i).addEventListener('input',()=>{fillY();run();}));}catch(e){$('out').innerHTML='<div class="card no">試算錯誤：'+e.message+'</div>';}}).catch(()=>{$('open').disabled=false;$('open').textContent='載入失敗，再按一次';});};
})();
