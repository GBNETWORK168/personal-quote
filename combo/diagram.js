// 搭配專區 v1.26（v1.61 淺色卡、兩條路、回本用語）：男女癌＋PFD「保障示意圖／回本時間軸」。數據全取自 combo.js run() 的結果（CLZ/CLX rows、ENG.quote rows），不寫死數字；預設收合
(function(){
const f=n=>Math.round(n).toLocaleString('zh-TW'),u=n=>'US$ '+f(n),t=n=>'NT$ '+f(n);
let open=false,sel=null,D=null,key='';
const css=`#dg{background:#fff;color:#1d2733;border:1px solid #e3e8ef;border-radius:14px;margin:10px;padding:12px}
#dgBtn{font-size:18px;padding:12px;border-radius:12px;border:2px solid var(--m);background:#fff;color:var(--d);width:calc(100% - 20px);margin:0 10px;font-weight:700}
#dg h3{margin:0 0 6px;font-size:18px;color:var(--d)}#dg .lg{font-size:12px;color:#5a6577;display:flex;flex-wrap:wrap;gap:4px 12px;margin:4px 0}
#dg .lg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:3px}
#dg svg{width:100%;display:block;touch-action:none;user-select:none}#dg .nav{display:flex;gap:8px;align-items:center;justify-content:center;margin:4px 0 8px}
#dg .nav button{font-size:20px;width:46px;height:40px;border-radius:10px;border:2px solid var(--m);background:#fff;color:var(--d)}
#dg .nav b{font-size:15px;color:#5a6577;min-width:9em;text-align:center}
#dg .cd{background:#f7f9fc;color:#1d2733;border-radius:12px;padding:12px;border-top:4px solid #d4a64a}
#dg .hd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}#dg .yr{font-size:30px;font-weight:800;color:#0f2340}#dg .ag{font-size:20px;font-weight:700;color:#8a6a1f}
#dg .tag{display:inline-block;font-size:13px;font-weight:700;border-radius:999px;padding:2px 10px;background:#f3d48a;color:#0f2340}
#dg .sec{margin-top:10px;font-size:13px;font-weight:700;color:#5a6577;border-bottom:1px solid #e3e8ef}
#dg .ln{display:flex;justify-content:space-between;gap:8px;font-size:16px;padding:3px 0}#dg .ln span{color:#4a5562}#dg .ln b{text-align:right}
#dg .bigv{font-size:24px;font-weight:800;color:#0f2340}#dg .ng{font-size:11px;color:#b3261e;font-weight:700;margin-left:2px}
#dg .ok{color:#1e7d3c;font-weight:800}#dg .x{color:#b3261e;font-weight:800}#dg .ft{font-size:12px;color:#7a8594;margin-top:8px}
#dg .g{color:#7a8594;font-size:13px}#dg details summary{font-size:14px;color:#5a6577;margin-top:6px}#dg .s3{display:grid;gap:10px;margin-bottom:12px}#dg .sc{background:#f7f9fc;color:#1d2733;border-radius:12px;padding:12px 14px;border-left:8px solid #d4a64a}
#dg .sc h4{margin:0 0 6px;font-size:20px;color:#0f2340}#dg .sc .bn{font-size:28px;font-weight:800;color:#0f2340;line-height:1.25}#dg .sc ul{margin:4px 0 0;padding-left:1.2em;font-size:15px}
#dg .ms{display:flex;align-items:stretch;gap:0;margin:6px 0 12px}#dg .ms>div{flex:1;text-align:center;padding:8px 2px;font-size:14px;line-height:1.3;border-right:2px dashed #cbd5e1}#dg .ms>div:last-child{border:0}
#dg .ms b{display:block;font-size:20px;color:var(--d)}#dg .ms .ic{font-size:24px}#dg .sub2{font-size:15px;color:#8a6a1f;font-weight:700;margin:8px 0 4px}
@media(min-width:900px){#dg .s3{grid-template-columns:1fr 1fr 1fr}}
@media(min-width:900px){#dg .wrap{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;align-items:start}}`;
function ensure(o){if(!document.getElementById('dgCss')){const s=document.createElement('style');s.id='dgCss';s.textContent=css;document.head.appendChild(s);}
  const b=document.createElement('button');b.id='dgBtn';b.type='button';o.appendChild(b);const d=document.createElement('div');d.id='dg';o.appendChild(d);
  b.onclick=()=>{open=!open;paint();};}
function nz(k){return D.q.rows.some(r=>r[k]);}
function paint(){const b=document.getElementById('dgBtn'),d=document.getElementById('dg');if(!b||!d)return;
  b.textContent=open?'▲ 收合保障示意圖':'📊 看保障示意圖';d.hidden=!open;if(!open)return;
  const {age,fx,C,q,code,T,be,cEnd}=D,N=D.N,PT=q.rows.reduce((m,r)=>r.py?r.t:m,0);
  // SVG：上半時間軸＋下半身故保障／解約金曲線（美元）
  const W=640,L=44,R=12,H=250,x=y=>L+(y-1)*(W-L-R)/(N-1),tl0=34,tl1=58,c0=82,c1=H-22;
  const mx=Math.max(...q.rows.slice(0,N).map(r=>Math.max(r.W,r.X,r.cum)))||1,yy=v=>c1-(v/mx)*(c1-c0);
  const pl=k=>q.rows.slice(0,N).map((r,i)=>`${x(i+1).toFixed(1)},${yy(r[k]).toFixed(1)}`).join(' ');
  const cy=cEnd?Math.min(N,cEnd-age+1):0;
  let s=`<svg viewBox="0 0 ${W} ${H}" id="dgSvg" role="img" aria-label="保單年度時間軸">`;
  const hb=(tl1-tl0-4)/2, r1=tl0, r2=tl0+hb+4, ce=cy||N;
  s+=`<rect x="${x(1)}" y="${r1}" width="${x(ce)-x(1)}" height="${hb}" rx="3" fill="#9fc3ff"/><text x="${x(1)+4}" y="${r1+hb-3}" fill="#0f2340" font-size="10" font-weight="700">${code} ${D.kw||'癌症'}保障到 ${cEnd||'—'} 歲</text>`;
  const pe=be||Math.min(PT,N);s+=`<rect x="${x(1)}" y="${r2}" width="${x(pe)-x(1)}" height="${hb}" rx="3" fill="#3d6fb5"/><text x="${x(1)+4}" y="${r2+hb-3}" fill="#fff" font-size="10">PFD 繳 ${PT} 年</text>`;
  if(be&&be<N)s+=`<rect x="${x(be)}" y="${r2}" width="${x(N)-x(be)}" height="${hb}" rx="3" fill="none" stroke="#d4a64a" stroke-dasharray="4 3"/><text x="${Math.min(x(be)+4,W-R-150)}" y="${r2+hb-3}" fill="#8a6a1f" font-size="10" font-weight="700">A 解約拿回｜B 不解約，繼續放</text>`;
  for(let y=1;y<=N;y++){const mj=y===1||y%5===0;s+=`<line x1="${x(y)}" x2="${x(y)}" y1="${tl1}" y2="${tl1+(mj?6:3)}" stroke="#94a3b8"/>`;if(mj)s+=`<text x="${x(y)}" y="${tl1+18}" fill="#5a6577" font-size="11" text-anchor="middle">${y}</text>`;}
  const pin=(y,lab,col,row)=>`<line x1="${x(y)}" x2="${x(y)}" y1="${tl0-4}" y2="${c1}" stroke="${col}" stroke-dasharray="3 3"/><text x="${Math.max(L,Math.min(x(y),W-R-40))}" y="${row}" fill="${col}" font-size="12" font-weight="700" text-anchor="middle">${lab}</text>`;
  s+=pin(PT,'繳費期滿','#3d6fb5',12);if(be)s+=pin(be,'★回本 第'+be+'年','#b07d12',27);
  if(cy)s+=pin(cy,code+' 到期 '+cEnd+'歲','#c0392b',cy===PT||Math.abs(x(cy)-x(PT))<70?27:12);
  s+=`<line x1="${L}" x2="${W-R}" y1="${c1}" y2="${c1}" stroke="#94a3b8"/><text x="${L-4}" y="${c0+4}" fill="#5a6577" font-size="10" text-anchor="end">${f(mx/1e3)}k</text><text x="${L-4}" y="${c1}" fill="#5a6577" font-size="10" text-anchor="end">0</text>`;
  s+=`<polyline points="${pl('cum')}" fill="none" stroke="#3d6fb5" stroke-width="2" stroke-dasharray="5 4"/><polyline points="${pl('W')}" fill="none" stroke="#e57373" stroke-width="2.5"/><polyline points="${pl('X')}" fill="none" stroke="#d4a64a" stroke-width="2.5"/>`;
  const r=q.rows[sel-1];s+=`<line x1="${x(sel)}" x2="${x(sel)}" y1="${tl0-2}" y2="${c1}" stroke="#0f2340" stroke-width="1.5"/><circle cx="${x(sel)}" cy="${(tl0+tl1)/2}" r="9" fill="#fff" stroke="#d4a64a" stroke-width="3"/>`;
  s+=`<circle cx="${x(sel)}" cy="${yy(r.W)}" r="4" fill="#e57373"/><circle cx="${x(sel)}" cy="${yy(r.X)}" r="4" fill="#d4a64a"/>`;
  s+=`<rect x="0" y="0" width="${W}" height="${H}" fill="transparent" id="dgHit"/></svg>`;
  const a=age+sel-1,cC=C.rows[sel-1].cum,pU=r.cum,tot=cC+pU*fx,cov=cEnd?a<=cEnd:true;
  const tags=[];if(sel<=PT)tags.push('繳費期');if(sel===PT)tags.push('繳費期滿');if(be&&sel===be)tags.push('★ 回本年');if(be&&sel>be)tags.push('已回本');
  const ln=(k,v,ng)=>`<div class="ln"><span>${k}</span><b>${v}</b></div>`;
  const ud=v=>`${u(v)}<br><small>≈ ${t(v*fx)}</small>`;
  let c=`<div class="cd"><div class="hd"><span class="yr">第 ${sel} 年</span><span class="ag">${a} 歲</span>${tags.map(z=>`<span class="tag">${z}</span>`).join(' ')}</div>
  ${ln('兩張已繳','<span class="bigv">'+t(tot)+'</span>')}${ln('PFD 解約可拿回','<span class="bigv">'+t(r.X*fx)+'</span>')}
  ${ln('差額',r.X*fx>=tot?'<span class="ok">＋'+t(r.X*fx-tot)+'</span>':'<span class="x">−'+t(tot-r.X*fx)+'</span>')}
  <details><summary>展開明細</summary><div class="sec">累計已繳</div>${ln('PFD',ud(pU))}${ln(code,t(cC))}
  <div class="sec">當年 PFD 解約可拿回</div>${ln('保證解約金',ud(r.b))}${nz('y')?ln('增額繳清解約金',ud(r.y),1):''}${nz('e')?ln('解約紅利',ud(r.e),1):''}${nz('c')?ln('累積紅利',ud(r.c),1):''}${ln('合計',u(r.X))}
  <div class="sec">保障</div>${ln('PFD 身故保障',ud(r.W),nz('y')||nz('e'))}${ln(code+' '+(D.kw||'癌症')+'保障',cov?'<span class="ok">✓ 仍有保障'+(cEnd?'（至 '+cEnd+' 歲）':'')+'</span>':'<span class="x">已到期</span>')}</details></div>`;
  const cat=(window.CATALOG||[]).find(z=>z.code===code)||{},ben=(cat.ben||[]).filter(z=>!/豁免|事後給付/.test(z)),rb=be?q.rows[be-1]:null,tb=be?C.rows[be-1].cum+rb.cum*fx:0,ba=be?age+be-1:0,last=q.rows[q.rows.length-1];
  const SW=D.S*1e4,yP=q.rows[0].py,yC=C.rows[0].py,yT=yC+yP*fx,NG='';
  const sum=`<div class="s3"><div class="sc"><h4>① 繳費規劃</h4>
   <div><b>PFD</b> 繳 ${PT} 年（到 ${age+PT-1} 歲）</div><div class="bn" style="font-size:22px">${u(yP)}／年</div><div>≈ ${t(yP*fx)}</div>
   <div style="margin-top:6px"><b>${code}</b> 繳 ${T} 年（到 ${age+T-1} 歲）</div><div class="bn" style="font-size:22px">${t(yC)}／年</div>
   <div style="margin-top:6px;border-top:1px solid #e3e8ef;padding-top:6px">兩張合計 <b class="bn" style="font-size:24px">${t(yT)}</b>／年<br>約每月 <b>${t(yT/12)}</b></div></div>
   <div class="sc"><h4>② 保障內容</h4><div><b>${code} ${D.kn||'防癌險'}</b> 保額 ${D.S} 萬，保障到 <b>${cEnd||'—'} 歲</b></div>${D.isN?`<ul><li>重度癌症至少 ${t(SW)}，之後保費免繳</li><li>特定癌症最高 ${t(SW*1.5)} <span class="g">（第 6 年起）</span></li><li>初期癌症 ${t(SW*0.1)}</li><li>特定手術 ${t(SW*0.02)}</li><li>特定傷病 ${t(SW*0.1)} <span class="g">（意外）</span></li><li>身故／95 歲祝壽：已繳×1.06 <span class="g">（扣除已領）</span></li></ul>`:`<ul>${ben.map(z=>'<li>'+z+'</li>').join('')}</ul>`}
   <div style="margin-top:8px"><b>PFD 身故保障</b></div><div class="g">第 1 年約 ${u(q.rows[0].W)}，逐年增加</div></div>
   <div class="sc"><h4>③ 第 ${be||'—'} 年兩條路</h4>${be?`<div><b>A　第 ${be} 年解約拿回</b>（${ba} 歲）</div><div class="bn" style="font-size:30px;color:#1e7d3c">${t(rb.X*fx)}</div><div class="g">≈ ${u(rb.X)}；已繳 ${t(tb)}</div><div>之後只剩 ${code} ${D.kw||'癌症'}保障到 <b>${cEnd} 歲</b></div>
   <div style="margin-top:8px;border-top:1px solid #e3e8ef;padding-top:6px"><b>B　PFD 不解約，繼續放</b></div><div>${code} 到 ${cEnd} 歲；PFD ${last.age} 歲身故保障約 ${u(last.W)}</div>`:'<div class="bn">—</div>'}</div></div>
  <div class="ms"><div><span class="ic">✍️</span><b>${age} 歲</b>投保</div><div><span class="ic">💳</span><b>${age+Math.max(T,PT)-1} 歲</b>繳費期滿</div>${be?`<div><span class="ic">💰</span><b>${ba} 歲</b>★ 回本</div>`:''}<div><span class="ic">🛡️</span><b>${cEnd} 歲</b>${code} 保障到期</div><div><span class="ic">🔀</span><b>A／B</b>解約拿回或不解約</div></div>
  <div class="sub2">👇 點選或拖動圖上年度，看當年明細</div>`;
  d.innerHTML=`<h3>📊 保障示意圖／回本時間軸</h3>${sum}<div class="wrap"><div>${s}
  <div class="lg"><span><i style="background:#d4a64a"></i>PFD 解約金</span><span><i style="background:#e57373"></i>PFD 身故保障</span><span><i style="background:#3d6fb5"></i>PFD 累計已繳</span><span>（美元）</span></div>
  <div class="nav"><button type="button" id="dgP">◀</button><b>點選或拖動選年度</b><button type="button" id="dgN">▶</button></div></div>${c}</div>
  <div class="ft">解約金含增額繳清及解約紅利（依中分紅情境）；台幣以匯率 ${fx} 換算。僅供試算參考，以公司正式建議書為準。</div>`;
  const sv=document.getElementById('dgSvg'),pick=e=>{const b=sv.getBoundingClientRect(),px=(e.clientX-b.left)*W/b.width;const y=Math.round((px-L)/((W-L-R)/(N-1)))+1;go(y);};
  let drag=false;sv.onpointerdown=e=>{drag=true;sv.setPointerCapture&&sv.setPointerCapture(e.pointerId);pick(e);};sv.onpointermove=e=>{if(drag)pick(e);};sv.onpointerup=sv.onpointercancel=()=>{drag=false;};
  document.getElementById('dgP').onclick=()=>go(sel-1);document.getElementById('dgN').onclick=()=>go(sel+1);}
function go(y){y=Math.max(1,Math.min(D.N,y));if(y!==sel){sel=y;paint();}}
window.ComboDiagram=function(o,d){D=d;const c=(window.CATALOG||[]).find(x=>x.code===d.code),m=c&&/(\d+)\s*歲/.exec(c.cover||'');D.cEnd=d.cEnd||(m?+m[1]:0);
  const lim=D.cEnd?D.cEnd-d.age+1:0;D.N=Math.min(d.q.rows.length,Math.max(30,d.Y,d.be,lim));
  const k=[d.age,d.code,d.T,d.Sp,d.fx,d.be,d.Y].join('|');if(k!==key){key=k;sel=d.be||d.Y;}ensure(o);paint();};
window.ComboDiagramSel=y=>go(y);
})();
