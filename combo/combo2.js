// 搭配專區 第二組：PFD 20 年期＋FDE 或 FDF（美元），最可能紅利（M），紅利選增額繳清。PFD 用 engine.js（ENG.quote），附約保費用 QuoteEngine.rQuote。
// 全部解約版（YT 2026-10-20 向保全科確認）：FDE／FDF 20 年繳費期滿後不受主約影響，PFD 全部解約後附約仍持續有效至 100 歲。
// 第 Y 年 PFD 全部解約，拿回當年解約金（含增額繳清與解約紅利）；找最低 PFD 保額使拿回 ≥ PFD＋附約累計已繳。附約 >2 萬時須 ≦PFD 保額（1 倍）。
// 單張 30 萬做不到時才拆兩張 PFD（附約掛第 1 張），兩張都全部解約。
(function(){
const $=id=>document.getElementById(id), f=n=>Math.round(n).toLocaleString('zh-TW'), SC=2, KEEP=2, MINY=20;
const st={sex:1,rd:'FDE',Y:30};let ok=false;
const color=()=>document.body.classList.toggle('f',st.sex===2);
const seg=(id,k,num)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{st[k]=num?+b.dataset.v:b.dataset.v;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(k==='sex')color();if(k==='Y')fillY();run();});
seg('b_sex','sex',1);seg('b_rd','rd');seg('b_yb','Y',1);
const maxY=()=>Math.max(MINY,100-(+$('b_age').value||0)+1);
function fillY(){const m=maxY();if(st.Y>m)st.Y=m;if(st.Y<MINY)st.Y=MINY;$('b_yb').querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.v===st.Y));
  $('b_ysel').innerHTML=Array.from({length:m-MINY+1},(_,i)=>i+MINY).map(y=>`<option value="${y}"${y===st.Y?' selected':''}>${y}</option>`).join('');}
fillY();$('b_ysel').onchange=()=>{st.Y=+$('b_ysel').value;fillY();run();};
['b_age','b_rs','b_fx'].forEach(i=>$(i).addEventListener('input',()=>{fillY();run();}));
function pfd(age,S){const P=window.PFD_P,M=P.meta,D=P.data;const pr=ENG.prem(M,D,st.sex,age,20,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,D,st.sex,age,20,S,SC,'PUA',pr.p1,pr.p2),{p1:pr.p1,p2:pr.p2,S});}
const back=(x,y)=>x.rows[y-1].X;
function calc(age,rs,Y){const Q=window.QuoteEngine,r=Q.rQuote(st.rd,{age,sex:st.sex,occ:1,mode:'年繳',term:20,sum:rs,payDisc:false});
  if(r.errs)return {err:st.rd+'：'+r.errs.join('；')};const rp=r.paid,rcum=t=>rp*Math.min(t,20);
  const M=window.PFD_P.meta,smin=Math.max(+M.smin,+M.smin,rs>2?rs:0),qs=[];
  for(let s=Math.round(smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(age,s/10);if(x)qs.push(x);}
  const okY=(x,y)=>!!x.rows[y-1]&&back(x,y)>=x.rows[y-1].cum+rcum(y);
  const hit=qs.find(x=>okY(x,Y));let sp=null;
  if(!hit)sp=split(age,rs,Y,rcum);
  return {rp,rcum,qs,okY,smin,hit,sp};}
// 拆單：單張 30 萬做不到時，PFD 拆兩張（各 2–30 萬，各自依保額算高保費折扣）。A 張掛附約（方式 a 繳費期滿後減到 2 萬保留），B 張第 Y 年全部解約。取兩張年繳合計最低者。
const ALL={};function allQ(age){const k=st.sex+'_'+age;if(ALL[k])return ALL[k];const M=window.PFD_P.meta,a=[];for(let s=Math.round(M.smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(age,s/10);if(x)a.push(x);}return ALL[k]=a;}
function split(age,rs,Y,rcum){const a=allQ(age).filter(x=>x.rows[Y-1]);let best=null;
  const backA=x=>x.rows[Y-1].X;
  for(const A of a){if(rs>2&&A.S<rs)continue;const bA=backA(A),cA=A.rows[Y-1].cum;
    for(const B of a){const need=cA+B.rows[Y-1].cum+rcum(Y);if(bA+B.rows[Y-1].X>=need){const pp=A.p1+B.p1;if(!best||pp<best.pp)best={A,B,pp};break;}}}
  return best;}
window.Combo2Split=(sex,age,rs,Y,rd)=>{st.sex=sex;if(rd)st.rd=rd;return calc(age,rs,Y);};
function run(){if(!ok)return;const o=$('b_out'),age=+$('b_age').value,rs=+$('b_rs').value,fx=+$('b_fx').value,Y=st.Y,R=st.rd,M=window.PFD_P.meta,tA=M.terms['20'];
  const rmax=R==='FDE'?60:65;
  if(age<tA[0]||age>tA[1]){o.innerHTML=`<div class="card no">PFD 20 年期限 ${tA[0]}–${tA[1]} 歲</div>`;return;}
  if(age>rmax){o.innerHTML=`<div class="card no">${R} 限 0–${rmax} 歲</div>`;return;}
  if(!(rs>=1&&rs<=10)||Math.round(rs*10)!==rs*10){o.innerHTML=`<div class="card no">${R} 保額 1–10 萬美元（以千美元為單位）</div>`;return;}
  const c=calc(age,rs,Y);if(c.err){o.innerHTML=`<div class="card no">${c.err}</div>`;return;}
  const x=c.hit;
  if(!x&&c.sp){o.innerHTML=splitHtml(c,age,rs,Y,fx,R);return;}
  if(!x){let e=null;for(let y=MINY;y<=maxY()&&e==null;y++)if(c.qs.some(q=>c.okY(q,y)))e=y;
    o.innerHTML=`<div class="card big"><div class="no">第 ${Y} 年拿回：PFD 買到 ${M.smax} 萬美元也做不到</div><div class="be" style="color:var(--d)">${e?'最早可以：第 '+e+' 年':'到 100 歲都做不到'}</div>${e?`<div style="text-align:center"><button type="button" id="b_goE" style="font-size:18px;padding:8px 16px;border:0;border-radius:10px;background:var(--d);color:#fff">改成第 ${e} 年</button></div>`:''}</div>`;
    if(e)$('b_goE').onclick=()=>{st.Y=e;fillY();run();};return;}
  const tot=t=>x.rows[t-1].cum+c.rcum(t),be=x.rows.findIndex((r,i)=>back(x,i+1)>=tot(i+1))+1,yr=x.p1+c.rp;
  const ntd=v=>`<br><span class="k">≈ NT$ ${f(v*fx)}</span>`;
  let h=`<div class="card big">
   <div class="k">PFD 要買</div><div class="v">${x.S} 萬美元</div>
   <div class="grid" style="margin-top:8px">
    <div><div class="k">PFD 年繳（20 年）</div><b>US$ ${f(x.p1)}</b>${ntd(x.p1)}</div>
    <div><div class="k">${R} ${rs} 萬 年繳（20 年）</div><b>US$ ${f(c.rp)}</b>${ntd(c.rp)}</div>
    <div><div class="k">兩張合計年繳</div><b>US$ ${f(yr)}</b>${ntd(yr)}</div>
    <div><div class="k">第 ${Y} 年</div>已繳 <b>US$ ${f(tot(Y))}</b><br>拿回 <b>US$ ${f(back(x,Y))}</b></div>
   </div>
   <div class="be">✅ 第 ${be} 年回本</div>
   <div class="k" style="text-align:center">PFD 全部解約拿回；${R} ${rs} 萬美元繳費期滿，繼續保障到 100 歲</div>
</div>
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳<br>US$</th><th>解約金<br>US$</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(back(x,t))}</td></tr>`;
  o.innerHTML=h+'</tbody></table><div class="k" style="font-size:12px">美元；中分紅</div></details></div>';}
function splitHtml(c,age,rs,Y,fx,R){const {A,B}=c.sp,ntd=v=>`<br><span class="k">≈ NT$ ${f(v*fx)}</span>`;
  const bk=x=>0;
  const tot=t=>A.rows[t-1].cum+B.rows[t-1].cum+c.rcum(t),bb=t=>A.rows[t-1].X+B.rows[t-1].X,n=Math.min(A.rows.length,B.rows.length);
  let be=0;for(let t=1;t<=n;t++)if(bb(t)>=tot(t)){be=t;break;}const yr=A.p1+B.p1+c.rp;
  let h=`<div class="card big">
   <div class="k">PFD 拆兩張（每張上限 30 萬）</div><div class="v">${A.S} 萬＋${B.S} 萬美元</div>
   <div class="grid" style="margin-top:8px">
    <div><div class="k">PFD 第 1 張 ${A.S} 萬（掛 ${R}）年繳</div><b>US$ ${f(A.p1)}</b>${ntd(A.p1)}</div>
    <div><div class="k">PFD 第 2 張 ${B.S} 萬 年繳</div><b>US$ ${f(B.p1)}</b>${ntd(B.p1)}</div>
    <div><div class="k">${R} ${rs} 萬 年繳（20 年）</div><b>US$ ${f(c.rp)}</b>${ntd(c.rp)}</div>
    <div><div class="k">三張合計年繳</div><b>US$ ${f(yr)}</b>${ntd(yr)}</div>
   </div>
   <div class="grid" style="margin-top:8px"><div style="grid-column:1/3"><div class="k">第 ${Y} 年</div>已繳 <b>US$ ${f(tot(Y))}</b>　拿回 <b>US$ ${f(bb(Y))}</b></div></div>
   ${be?`<div class="be">✅ 第 ${be} 年回本</div>`:''}
   <div class="k" style="text-align:center">兩張 PFD 全部解約拿回；${R} ${rs} 萬美元繼續保障到 100 歲</div>
</div>
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳<br>US$</th><th>拿回 US$</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.min(n,Math.max(30,Y));t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(bb(t))}</td></tr>`;
  return h+'</tbody></table><div class="k" style="font-size:12px">美元；中分紅</div></details></div>';}
window.Combo2Run=run;
const tab=b=>{$('tA').classList.toggle('on',!b);$('tB').classList.toggle('on',b);$('secA').hidden=b;$('secB').hidden=!b;
  if(b){color();window.pfdLoad().then(()=>{ok=true;run();}).catch(()=>{$('b_out').innerHTML='<div class="card no">載入失敗，請重新整理</div>';});}
  else document.body.classList.toggle('f',(document.querySelector('#sexb .on')||{}).dataset?.v==='2');};
$('tA').onclick=()=>tab(false);$('tB').onclick=()=>tab(true);
if(location.hash==='#fde')tab(true);
})();
