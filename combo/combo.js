// 搭配專區 CLZ＋PFD 試作：CLZ 用四季春引擎（window.QuoteEngine），PFD 用張仕鎮已驗證的 engine.js（ENG.quote）＋k4 資料，展開時才載入
(function(){
const $=id=>document.getElementById(id), f=n=>Math.round(n).toLocaleString('zh-TW');
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});
let ready=null;
const SC=['保證','L','M'];
function clzRows(age,S,T,Y){const Q=window.QuoteEngine,p=window.PRODUCTS.find(x=>x.code==='CLZ');const r=Q.quote(p,{age,sex:1,occ:1,term:T,sum:S,mode:'年繳',payDisc:true});
  if(r.errs)return {err:r.errs.join('；')};const out=[];let c=0;for(let t=1;t<=Y;t++){const py=t>T?0:(r.from2&&t>=r.from2&&r.paid2!=null?r.paid2:r.paid);c+=py;out.push({py,cum:c});}return {rows:out,first:r.paid};}
function pfd(age,T,S,sc){const P=window.PFD_P,M=P.meta,D=P.data;const pr=ENG.prem(M,D,1,age,T,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,D,1,age,T,S,sc,'PUA',pr.p1,pr.p2),{p1:pr.p1,p2:pr.p2});}
function solve(age,pT,clz,Y,fx,sc){const M=window.PFD_P.meta;const ok=S=>{const q=pfd(age,pT,S,sc);if(!q)return false;const r=q.rows[Y-1];return r.X*fx>=clz[Y-1].cum+r.cum*fx;};
  for(let s=Math.round(M.smin*10);s<=Math.round(M.smax*10);s++)if(ok(s/10))return s/10;return null;}
function run(){const age=+$('age').value,S=+$('clzS').value,T=+$('clzT').value,pT=+$('pfdT').value,Y=+$('tgt').value,fx=+$('fx').value,bs=+$('basis').value;
  const o=$('out');const tA=window.PFD_P.meta.terms[pT];if(age<tA[0]||age>tA[1]){o.innerHTML=`<div class="card warn">PFD ${pT} 年期投保年齡 ${tA[0]}–${tA[1]} 歲</div>`;return;}
  const C=clzRows(age,S,T,120);if(C.err){o.innerHTML=`<div class="card warn">CLZ：${C.err}</div>`;return;}
  const need=[0,1,2].map(sc=>solve(age,pT,C.rows,Y,fx,sc));const Sp=need[bs];
  let h=`<div class="card"><b>結果（第 ${Y} 年解約拿回 CLZ＋PFD 全部已繳保費）</b><div class="res">${[0,1,2].map(sc=>`<div>${sc?'紅利 '+SC[sc]+'<span class="nong">（非保證）</span>':'只看保證解約金'}<b>${need[sc]==null?'30 萬美元內做不到':'PFD '+need[sc]+' 萬美元'}</b></div>`).join('')}</div>`;
  if(Sp==null){o.innerHTML=h+'<div class="warn">所選情境在 PFD 保額上限 30 萬美元內無法達成，請改目標年度或情境。</div></div>';return;}
  const q=[0,1,2].map(sc=>pfd(age,pT,Sp,sc)),be=[0,1,2].map(sc=>{const i=q[sc].rows.findIndex((r,i)=>r.X*fx>=C.rows[i].cum+r.cum*fx);return i<0?null:i+1;});
  h+=`<p class="note">採用：PFD <b>${Sp} 萬美元</b> ${pT} 年期，年繳 US$ ${f(q[0].p1)}（續期 US$ ${f(q[0].p2)}）≈ NT$ ${f(q[0].p2*fx)}；CLZ ${S} 萬 ${T} 年，年繳 NT$ ${f(C.first)}。<br>
  回本年度（解約金 ≥ 兩張累計保費）：保證 <b>${be[0]?'第 '+be[0]+' 年':'—'}</b>｜L <b>${be[1]?'第 '+be[1]+' 年':'—'}</b>｜<span class="nong">M <b>${be[2]?'第 '+be[2]+' 年':'—'}</b>（非保證）</span></p></div>`;
  h+=`<div class="card"><div style="overflow:auto;max-height:70vh"><table><thead><tr><th>年度<br>(年齡)</th><th>CLZ 累計</th><th>PFD 累計<br>(台幣)</th><th>合計已繳</th><th>PFD 解約金<br>保證</th><th>L</th><th class="nong">M<br>非保證</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++){const i=t-1,cl=C.rows[i].cum,pc=q[0].rows[i].cum*fx,tot=cl+pc,cls=t===be[bs]?'be':(t===Y?'k':'');
    h+=`<tr class="${cls}"><td>${t} (${age+t-1})</td><td>${f(cl)}</td><td>${f(pc)}</td><td>${f(tot)}</td>${[0,1,2].map(sc=>`<td${q[sc].rows[i].X*fx>=tot?' style="color:#1e7d3c"':''}>${f(q[sc].rows[i].X*fx)}</td>`).join('')}</tr>`;}
  h+=`</tbody></table></div><p class="note">金額為新台幣，PFD 依上方假設匯率換算（實際以繳費／解約當時匯率為準，有匯率風險）。PFD 為分紅保單，<b>沒有宣告利率</b>；L／M 為建議書紅利情境（非保證），保證欄只含保證解約金。PFD 資料：紅富美好建議書 V2.4-1150630（引擎與建議書總表／L／M 逐年核對一致）。綠底＝回本年度、黃底＝目標年度。</p></div>`;
  o.innerHTML=h;}
window.ComboRun=run;
$('open').onclick=()=>{$('open').disabled=true;$('open').textContent='載入中…';ready=ready||Promise.all([load('combo/pfd_engine.js?v=c01'),load('combo/pfd_data.js?v=c01')]);
  ready.then(()=>{try{$('open').style.display='none';run();document.querySelectorAll('input,select').forEach(e=>e.addEventListener('change',run));}catch(e){$('out').innerHTML='<div class="card warn">試算錯誤：'+e.message+'</div>';}}).catch(()=>{$('open').textContent='載入失敗，請重新整理';});};
})();
