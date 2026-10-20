// 搭配專區 v0.2：癌症險（男 CLZ／女 CLX）＋PFD，只用 M（最可能紅利）情境。CLZ/CLX 用四季春引擎；PFD 用張仕鎮已驗證 engine.js，按開始才載入
(function(){
const $=id=>document.getElementById(id), f=n=>Math.round(n).toLocaleString('zh-TW'), SC=2;
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});
const st={sex:1,T:20,Y:30};let ready=null,on=false;
const seg=(id,k)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{st[k]=+b.dataset.v;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(k==='sex')document.body.classList.toggle('f',st.sex===2);if(on)run();});
seg('sexb','sex');seg('tb','T');seg('yb','Y');
function cRows(code,age,S,T){const p=window.PRODUCTS.find(x=>x.code===code);const r=window.QuoteEngine.quote(p,{age,sex:st.sex,occ:1,term:T,sum:S,mode:'年繳',payDisc:true});
  if(r.errs)return {err:r.errs.join('；')};const rows=[];let c=0;for(let t=1;t<=120;t++){const py=t>T?0:(r.from2&&t>=r.from2&&r.paid2!=null?r.paid2:r.paid);c+=py;rows.push({py,cum:c});}return {rows,first:r.paid};}
function pfd(age,S){const P=window.PFD_P,M=P.meta,D=P.data;const pr=ENG.prem(M,D,st.sex,age,20,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,D,st.sex,age,20,S,SC,'PUA',pr.p1,pr.p2),{p1:pr.p1,p2:pr.p2});}
function run(){const age=+$('age').value,S=+$('clzS').value,fx=+$('fx').value,Y=st.Y,T=st.T,code=st.sex===1?'CLZ':'CLX',o=$('out');
  const M=window.PFD_P.meta,tA=M.terms['20'];if(age<tA[0]||age>tA[1]){o.innerHTML=`<div class="card no">PFD 20 年期限 ${tA[0]}–${tA[1]} 歲</div>`;return;}
  const C=cRows(code,age,S,T);if(C.err){o.innerHTML=`<div class="card no">${code}：${C.err}</div>`;return;}
  let Sp=null,q=null;for(let s=Math.round(M.smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(age,s/10);if(!x)continue;const r=x.rows[Y-1];if(r.X*fx>=C.rows[Y-1].cum+r.cum*fx){Sp=s/10;q=x;break;}}
  if(Sp==null){o.innerHTML=`<div class="card big"><div class="no">第 ${Y} 年拿回：PFD 買到上限 ${M.smax} 萬美元也做不到</div><div class="k">可改成第 30 年，或降低癌症險保額</div></div>`;return;}
  const tot=t=>C.rows[t-1].cum+q.rows[t-1].cum*fx, sv=t=>q.rows[t-1].X*fx, be=q.rows.findIndex((r,i)=>sv(i+1)>=tot(i+1))+1;
  const yrBoth=C.first+q.p1*fx;
  let h=`<div class="card big">
   <div class="k">PFD 要買</div><div class="v">${Sp} 萬美元</div>
   <div class="grid" style="margin-top:8px">
    <div><div class="k">PFD 年繳（20 年）</div><b>US$ ${f(q.p1)}</b><br><span class="k">≈ NT$ ${f(q.p1*fx)}</span></div>
    <div><div class="k">${code} 年繳（${T} 年）</div><b>NT$ ${f(C.first)}</b></div>
    <div><div class="k">兩張合計年繳</div><b>NT$ ${f(yrBoth)}</b></div>
    <div><div class="k">第 ${Y} 年</div>已繳 <b>NT$ ${f(tot(Y))}</b><br>解約金 <b>NT$ ${f(sv(Y))}</b></div>
   </div>
   <div class="be">✅ 第 ${be} 年回本</div></div>
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳</th><th>PFD 解約金</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(sv(t))}</td></tr>`;
  o.innerHTML=h+'</tbody></table><div class="k" style="font-size:12px">金額：新台幣；解約金以最可能紅利計（非保證）</div></details></div>';}
window.ComboRun=run;
$('open').onclick=()=>{$('open').disabled=true;$('open').textContent='載入中…';ready=ready||Promise.all([load('combo/pfd_engine.js?v=c01'),load('combo/pfd_data.js?v=c01')]);
  ready.then(()=>{try{$('open').style.display='none';on=true;run();['age','clzS','fx'].forEach(i=>$(i).addEventListener('input',run));}catch(e){$('out').innerHTML='<div class="card no">試算錯誤：'+e.message+'</div>';}}).catch(()=>{$('open').disabled=false;$('open').textContent='載入失敗，再按一次';});};
})();
