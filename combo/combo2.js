// 搭配專區 第二組：PFD 20 年期＋FDE 或 FDF（美元），最可能紅利（M）。PFD 用 engine.js（ENG.quote），附約保費用四季春 QuoteEngine.rQuote（費率已與 FDE／FDF 費率表 PDF 逐格核對）
// 拿回方式 a 部分解約：PFD 減額到 2 萬美元（PFD 條款第29條，最低承保金額 2 萬），減少部分依第12條終止給付解約金；
//   假設：減少部分的解約金＝當年全部解約金（含增額繳清與解約紅利）×（PFD 保額−2）÷ PFD 保額；附約不受影響、繼續有效；附約無解約金（以 0 計）。
// 附約 ≦2 萬與主約保額無關；＞2 萬投保時須 ≦PFD 保額（可附加額度暫以 1 倍）。方式 a：PFD 減到 2 萬後附約維持原保額（投保後規則不要求附約減額）；附約無解約金（以 0 計）。
// 拿回方式 b 全部解約：拿回當年全部解約金；附約依 FDE 條款第19條至當期已繳保費期滿後終止。
(function(){
const $=id=>document.getElementById(id), f=n=>Math.round(n).toLocaleString('zh-TW'), SC=2, KEEP=2, MINY=20;
const st={sex:1,rd:'FDE',Y:20,md:'a'};let ok=false;
const color=()=>document.body.classList.toggle('f',st.sex===2);
const seg=(id,k,num)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{st[k]=num?+b.dataset.v:b.dataset.v;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(k==='sex')color();if(k==='Y')fillY();run();});
seg('b_sex','sex',1);seg('b_rd','rd');seg('b_yb','Y',1);seg('b_md','md');
const maxY=()=>Math.max(MINY,100-(+$('b_age').value||0)+1);
function fillY(){const m=maxY();if(st.Y>m)st.Y=m;if(st.Y<MINY)st.Y=MINY;$('b_yb').querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.v===st.Y));
  $('b_ysel').innerHTML=Array.from({length:m-MINY+1},(_,i)=>i+MINY).map(y=>`<option value="${y}"${y===st.Y?' selected':''}>${y}</option>`).join('');}
fillY();$('b_ysel').onchange=()=>{st.Y=+$('b_ysel').value;fillY();run();};
['b_age','b_rs','b_fx'].forEach(i=>$(i).addEventListener('input',()=>{fillY();run();}));
function pfd(age,S){const P=window.PFD_P,M=P.meta,D=P.data;const pr=ENG.prem(M,D,st.sex,age,20,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,D,st.sex,age,20,S,SC,'PUA',pr.p1,pr.p2),{p1:pr.p1,p2:pr.p2,S});}
const back=(x,y)=>{const X=x.rows[y-1].X;return st.md==='a'?X*(x.S-KEEP)/x.S:X;};
function calc(age,rs,Y){const Q=window.QuoteEngine,r=Q.rQuote(st.rd,{age,sex:st.sex,occ:1,mode:'年繳',term:20,sum:rs,payDisc:true});
  if(r.errs)return {err:st.rd+'：'+r.errs.join('；')};const rp=r.paid,rcum=t=>rp*Math.min(t,20);
  const M=window.PFD_P.meta,smin=Math.max(+M.smin,st.md==='a'?KEEP+0.1:+M.smin,rs>2?rs:0),qs=[];
  for(let s=Math.round(smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(age,s/10);if(x)qs.push(x);}
  const okY=(x,y)=>!!x.rows[y-1]&&back(x,y)>=x.rows[y-1].cum+rcum(y);
  return {rp,rcum,qs,okY,smin,hit:qs.find(x=>okY(x,Y))};}
function run(){if(!ok)return;const o=$('b_out'),age=+$('b_age').value,rs=+$('b_rs').value,fx=+$('b_fx').value,Y=st.Y,R=st.rd,M=window.PFD_P.meta,tA=M.terms['20'];
  const rmax=R==='FDE'?60:65;
  if(age<tA[0]||age>tA[1]){o.innerHTML=`<div class="card no">PFD 20 年期限 ${tA[0]}–${tA[1]} 歲</div>`;return;}
  if(age>rmax){o.innerHTML=`<div class="card no">${R} 限 0–${rmax} 歲</div>`;return;}
  if(!(rs>=1&&rs<=10)||Math.round(rs*10)!==rs*10){o.innerHTML=`<div class="card no">${R} 保額 1–10 萬美元（以千美元為單位）</div>`;return;}
  const c=calc(age,rs,Y);if(c.err){o.innerHTML=`<div class="card no">${c.err}</div>`;return;}
  const x=c.hit;
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
   <div class="k" style="text-align:center">${st.md==='a'?`拿回後還有：PFD ${KEEP} 萬美元＋${R} ${rs} 萬美元`:'PFD 全部解約；附約到當期已繳保費期滿後終止'}</div>
</div>
  <div class="card"><details><summary>看每年明細</summary><table><thead><tr><th>第幾年<br>(歲)</th><th>累計已繳<br>US$</th><th>${st.md==='a'?'部分解約<br>拿回 US$':'解約金<br>US$'}</th></tr></thead><tbody>`;
  for(let t=1;t<=Math.max(30,Y);t++)h+=`<tr class="${t===be||t===Y?'hit':''}"><td>${t} (${age+t-1})</td><td>${f(tot(t))}</td><td>${f(back(x,t))}</td></tr>`;
  o.innerHTML=h+'</tbody></table><div class="k" style="font-size:12px">美元；最可能紅利</div></details></div>';}
window.Combo2Run=run;
const tab=b=>{$('tA').classList.toggle('on',!b);$('tB').classList.toggle('on',b);$('secA').hidden=b;$('secB').hidden=!b;
  if(b){color();window.pfdLoad().then(()=>{ok=true;run();}).catch(()=>{$('b_out').innerHTML='<div class="card no">載入失敗，請重新整理</div>';});}
  else document.body.classList.toggle('f',(document.querySelector('#sexb .on')||{}).dataset?.v==='2');};
$('tA').onclick=()=>tab(false);$('tB').onclick=()=>tab(true);
if(location.hash==='#fde')tab(true);
})();
