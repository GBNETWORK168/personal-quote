// 原檔：/workspace/pipeline/engine.js（張仕鎮 已驗證；勿在此修改）
// Generic Fubon participating engine (mirrors engine.py, verified vs workbooks)
const IIF=(c,a,b)=>c?a:(b===undefined?false:b),AND=(...a)=>a.every(Boolean),OR=(...a)=>a.some(Boolean),NN=x=>typeof x=='number'?x:0,RND=(x,d)=>Math.round(x*10**d)/10**d;
const ENG={
 rh:x=>Math.floor(x+0.5), cu:x=>Math.ceil(Math.round(x*1e6)/1e6),
 key(M,g,age,term){const a=M.code+String(term).padStart(2,'0')+String(g).padStart(2,'0')+String(age).padStart(2,'0'),b=M.code+String(g).padStart(2,'0')+String(age).padStart(2,'0');if(term!=1)return a;const D=ENG._D;if(D&&D.DIE){if(D.DIE[a])return a;if(D.DIE[b])return b;}return M.termOmit1?b:a;},
 // 依建議書「年度保單紅利給付方式」不可選（輸入頁 E19 無下拉、固定「繳清保險金額」）＝條款限購買增額繳清：起領前不會有現金紅利，紅利增加保額→起領後生存金變多
 PUAONLY:['PAJ','PAK','PALA','PALB','PALC','PAN','PF55','PF60','PF65','PFNA','PFNB','PFNC','PFO','PFVA','PFVB','PFVC','PFVD','PFWA','PFWB','PFWC','PFWD','PFWE','PFWF','PFZA','PFZB'],
 modes(M,D,k){if(M.isr)return M.isrModes||['PS','PC','PUA'];if(ENG.PUAONLY.includes(M.code)&&D.PVFB[k]&&D.PVFB0[k]&&D._DIE2[k])return ['PUA'];const m=[];if(D.PVFB[k]&&D.PVFB0[k]&&D._DIE2[k])m.push('PUA');m.push('SAVE','CASH');return m;},
 prem(M,D,g,age,term,S,m1,m2){ENG._D=D;const k=ENG.key(M,g,age,term),rate=D.GP[k];if(!rate||!D.DIE[k])return null;
   const raw=M.premRoundDown?Math.floor(Math.round(S*rate*1e6)/1e6):ENG.rh(S*rate);
   const ev=e=>{try{return +eval(e)||0}catch(_){return 0}};
   const hf=ev(M.js_hf),cap=ev(M.js_cap),a=ev(M.js_meth[m1]||'0'),b=ev(M.js_meth[m2]||'0');
   const d1=Math.min(RND(hf+a,6),cap),d2=Math.min(RND(hf+b,6),cap);
   return {k,rate,raw,d1,d2,p1:ENG.rh(raw*(1-d1)),p2:ENG.rh(raw*(1-d2))};},
 quote(M,D,g,age,term,S,sc,mode,p1,p2){ENG._D=D;
  const R=M.rup?ENG.cu:ENG.rh,k=ENG.key(M,g,age,term),ymax=M.fixedYears||(M.maxAge-age+1),f=sc?1:0,bk=k+(sc||1);
  if(!ENG.modes(M,D,k).includes(mode))mode='SAVE';
  if(M.isr)return ENG.quoteIsr(M,D,g,age,term,S,sc,mode,p1,p2,M.eff);
  const B=D.BONU[bk],BD=D.BONUDIE[bk],BC=D.BONUCV[bk],SV=D.SRV[k],ar=M.accRate||0,ra=M.accUp?(x=>Math.ceil(Math.round(x*1e4)/1e4)):ENG.rh;
  const payN=M.payYears=='term'?term:term-age;let N=0,A=0,cum=0,rows=[];
  for(let t=1;t<=ymax;t++){
   const H=R(D.DIE[k][t-1]*S),I=R(D.CV[k][t-1]*S),Kb=(f&&B)?B[t-1]:0;
   const K=f?R(S*Kb)+((t>1&&M.puaK&&mode=='PUA')?R(N/1e4*Kb):0):0;
   const pv=mode=='PUA'?(D.PVFB[k][t]||0):0;
   if(mode=='PUA'&&t<ymax&&pv)N+=M.mDiv?ENG.rh(K/(pv/1e4)):ENG.rh(K/pv);
   const ex=(t==ymax&&M.finalExtra&&mode=='PUA')?K:0;
   const Q=mode=='PUA'?R(N/1e4*D._DIE2[k][t-1])+ex:0,R0=mode=='PUA'?R(N/1e4*D.PVFB0[k][t])+ex:0;
   const AD=BD?R(f*S*BD[t-1]):0,AE=BC?R(f*S*BC[t-1]):0;
   const Fs=SV?R(SV[t-1]*S):0,Os=(SV&&mode=='PUA')?R(SV[t-1]*N/1e4):0;
   if(mode=='SAVE')A=t>1?ra(A*Math.pow(1+RND(ar/12,10),12)+K):K;
   const Kc=mode=='CASH'?K:(mode=='SAVE'?A:0);
   const py=t<=payN?(t==1?p1:p2):0;cum+=py;
   rows.push({t,age:age+t-1,py,cum,W:H+Q+AD+Kc,X:I+R0+AE+Kc,surv:Fs+Os,K,cash:mode=='CASH'?K:0,b:I,e:AE,y:R0,c:Kc});
  }return {k,mode,rows};},
 // interest-sensitive: sc = declared rate (decimal)
 // interest-sensitive (verified vs 計算 sheet logic): sc = declared rate; mode PUA(全期增額) / PS(前P4年增額,後儲存生息) / PC(前P4年增額,後現金給付)
 quoteIsr(M,D,g,age,term,S0,decl,mode,p1,p2,eff,rp){let S=S0;
  const cu=x=>Math.ceil(Math.round(x*1e9)/1e9),rh=ENG.rh,r10=x=>Math.ceil(Math.round(x*1e13)/1e3)/1e10,R10=x=>Math.round(x*1e10)/1e10,k=ENG.key(M,g,age,term),as=M.assumed;
  const DL=t=>typeof decl=='function'?decl(t):decl,dF=t=>Math.max(0,RND(RND(Math.max(DL(t),as),4)-as,5)),ymax=M.maxAge-age+1,SV=D.SRV&&D.SRV[k],payN=M.payYears=='term'?term:term-age;
  const JA=M.p4a??16,P4=mode=='PUA'?ymax:Math.max(JA-age,M.p4m??6);
  const E=eff?new Date(eff+'T00:00:00Z'):new Date(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()));
  const ed=E.getUTCDate(),DAY=864e5,dim=(y,m)=>new Date(Date.UTC(y,m+1,0)).getUTCDate();
  const BDj=j=>{const y=E.getUTCFullYear(),m=E.getUTCMonth()+j;return new Date(Date.UTC(y,m,Math.min(ed,dim(y,m))));};
  const rates=j=>{const bd=BDj(j),bc=new Date(Date.UTC(bd.getUTCFullYear(),bd.getUTCMonth(),1)),be=new Date(Date.UTC(bd.getUTCFullYear(),bd.getUTCMonth()+1,0));
    const BF=bc<E?0:Math.round((bd-bc)/DAY),BG=Math.round((be-bd)/DAY)+1,BH=BF+BG;const dd=DL(Math.ceil(j/12));return [R10(dd*BF/365),R10(dd*BG/365),R10(dd*BH/365)];};
  const rdn=x=>{const L=String(Math.floor(Math.abs(x))).length,d=L<=5?10:15-L;return Math.floor(Math.round(x*10**d*1e3)/1e3)/10**d;};
  const TW=!!M.kRound,AD=M.accDig||10,RA=x=>Math.round(x*10**AD)/10**AD,JD=M.juvDig||10,RJ=x=>Math.round(x*10**JD)/10**JD,UP=TW?(x=>rh(x)):(x=>Math.ceil(Math.round(x*1e6)/1e6));
  let N=0,cum=0,BX=0,BZp=0,BT=0,rows=[],CX=0,AK=0,offP=0,offNext=0,offUsed=0;
  for(let t=1;t<=ymax;t++){
   const cvt=!!(rp&&t>rp.n);if(cvt){S=0;if(t==rp.n+1)N+=rp.Sp;}
   const RU=M.isrUp===false?rh:cu,H=RU(D.DIE[k][t-1]*S),I=RU(D.CV[k][t-1]*S),pv=RND(D.PV[k][t-1]*S,10),diff=dF(t),w=D.PVFB[k][t]||0;
   const CA=TW?rh(pv*diff):r10(pv*diff),CB=t>1?(TW?rh(rh(RND(N/1e4*w,3)*diff)):r10(RND(N/1e4*w,3)*diff)):0,Ka=TW?CA:cu(CA),Kb=TW?CB:cu(CB),K=Ka+Kb,late=t>P4;
   const at=age+t-1;let juvW=null,juvX=null;
   if(at<JA){ // juvenile: 回饋金 accumulate (daily interest, monthly) until age 15 year-end, then one-time PUA purchase
     const off=(t<payN)?Math.min(CA,p2):0;let CV=0;
     for(let m=1;m<=12;m++){const j=12*(t-1)+m,[AZ,BA,BB]=rates(j),CR=m==12?CA:0,CT=m==12?off:0;
       CV=RJ(CX*(1+AZ))+CR;const CW=RJ((CR-CT)*(1+BA));CX=CW+RJ(CX*(1+BB));}
     AK=AK+Ka-Math.ceil(offP);offP=off;offNext=off;
     const pz=(t<term&&at<JA-1);juvW=pz?0:AK;juvX=pz?0:UP(CV);
     if(at==JA-1&&w){N+=rh(UP(CV)/(w/1e4));juvX=null;}
   } else if(!late&&at<M.maxAge&&w)N+=rh(K/(w/1e4));
   if(late&&mode=='PS'){let sumZ=0;
     for(let m=1;m<=12;m++){const j=12*(t-1)+m,[AZ,BA,BB]=rates(j);const nw=m==12?CA+CB:0,BY=m==12?RA((BX+BZp)*AZ):0;
       const bx=rdn(nw+BX+BY+BZp);if(m<12)sumZ+=BZp;else sumZ+=BZp;const bz=RA(bx*(m==12?BA:BB));
       if(m==12){const BW=TW?rh(BY+sumZ):Math.ceil(Math.round((BY+sumZ)*1e9)/1e9);BT=K+BW+BT;}
       BX=bx;BZp=bz;}}
   const ex=(t==ymax)?K:0;
   let Q=RU((M.dieRound?rh:cu)(D._DIE2[k][t-1]*N/1e4))+(late?0:ex),R0=RU(RND(N/1e4*D.PVFB0[k][t],3))+(late?0:ex);
   if(juvW!=null)Q=juvW;if(juvX!=null)R0=juvX;
   const Fs=SV?cu(SV[t-1]*S):0,Os=SV?cu(SV[t-1]*N/1e4):0;
   const cash=(late&&mode=='PC')?K:0,acc=(late&&mode=='PS')?BT:0;
   const py=(t<=payN&&!cvt)?(t==1?p1:p2)-(t>1&&at-1<16?offUsed:0):0;cum+=py;offUsed=offNext;offNext=0;
   rows.push({t,age:age+t-1,py,cum,W:H+Q+acc+cash,X:I+R0+acc+cash,surv:Fs+Os,K,cash,b:I,e:0,y:R0,c:acc+cash,base:cvt?rp.Sp:S0*1e4,pua:cvt?N-rp.Sp:N});
  }return {k,mode,rows};},
 // IRR on flows: premium at start of year, survival/cash payouts at end of year, X at end of year t
 irr(rows,t){const fl=[];for(let i=0;i<t;i++){const r=rows[i];fl.push([i,-r.py]);let o=r.surv+(i<t-1?r.cash:0);if(o)fl.push([i+1,o]);}
  fl.push([t,rows[t-1].X+(rows[t-1].cash?0:0)]);
  const npv=x=>fl.reduce((s,[n,v])=>s+v/Math.pow(1+x,n),0);let lo=-0.99,hi=1;if(npv(lo)*npv(hi)>0)return null;
  for(let i=0;i<100;i++){const m=(lo+hi)/2;(npv(m)>0)?lo=m:hi=m;}return (lo+hi)/2;}
};
if(typeof module!='undefined')module.exports={ENG,IIF,AND,OR,NN,RND};
