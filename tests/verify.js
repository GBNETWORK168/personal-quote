#!/usr/bin/env node
// 富邦四季春快速報價 自動驗證（v1.42）：node tests/verify.js
// 無外部相依：用 Node vm 載入網站實際的 data*.js／catalog.js／app.js／combo 引擎／解說檔，DOM 以空殼代替。
// 期望值：CIA／CIB 費率取自 tests/fixtures/cia_cib_rates.json（官方費率表 PDF 擷取）；其他數字取自 DM 公版範例（見各項註記）。
'use strict';
const vm=require('vm'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let pass=0,fail=0;const fails=[];
const ok=(c,name,info)=>{if(c)pass++;else{fail++;fails.push(name+(info!==undefined?'  → '+JSON.stringify(info):''));}};
const eq=(a,b,name)=>ok(JSON.stringify(a)===JSON.stringify(b),name,{got:a,want:b});
function sandbox(){const noop=()=>{};
  const el=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='length'?0:(k==='style'||k==='dataset'||k==='classList')?new Proxy({},{get:()=>noop}):el,apply:()=>el,set:()=>true});
  const doc={querySelector:()=>el,querySelectorAll:()=>[],getElementById:()=>el,addEventListener:noop,createElement:()=>el,body:el,head:el,documentElement:el,readyState:'complete'};
  const w={document:doc,localStorage:{getItem:()=>null,setItem:noop},location:{search:'',hash:'',href:''},addEventListener:noop,navigator:{},setTimeout:noop,console,Intl,Date,Math,JSON};
  w.window=w;return vm.createContext(w);}
const ctx=sandbox();const run=f=>vm.runInContext(rd(f),ctx,{filename:f});
['data.js','data_life.js','data_mains.js','catalog.js','riders_rates.js','app.js'].forEach(run);
const W=ctx,E=W.QuoteEngine,P=c=>W.PRODUCTS.find(x=>x.code===c),CAT=c=>W.CATALOG.find(x=>x.code===c);
const Q=(c,o)=>E.quote(P(c),Object.assign({occ:1,mode:'年繳',payDisc:false,sum:100},o));

// ---------- 1. CIA／CIB 費率 336 格 ----------
const FX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/cia_cib_rates.json'),'utf8'));
for(const c of ['CIA','CIB']){const {sex,rates}=FX[c];
  for(const t of ['10','20','30']){const row=W.RATES[c][`${c}|${t}|${sex}`];ok(row&&row[0]===0,`${c} ${t}年 費率起始年齡 0`);
    ok(row&&row[1].length===rates[t].length,`${c} ${t}年 費率格數 ${rates[t].length}`,row&&row[1].length);
    rates[t].forEach((v,a)=>ok(row&&row[1][a]===v,`${c} ${t}年 ${a}歲 費率 ${v}`,row&&row[1][a]));
    // 引擎實際報價（100 萬、年繳、無折扣）＝費率×100
    [0,Math.floor(rates[t].length/2),rates[t].length-1].forEach(a=>eq(Q(c,{age:a,sex,term:+t}).annual,rates[t][a]*100,`${c} ${t}年 ${a}歲 引擎年繳`));}}
// ---------- 2. 繳別係數（費率表註：半年 0.52、季 0.262、月 0.088） ----------
for(const c of ['CIA','CIB']){const sex=FX[c].sex,base=FX[c].rates['20'][40]*100;
  eq(P(c).mf,{"年繳":1,"躉繳":1,"半年繳":0.52,"季繳":0.262,"月繳":0.088},`${c} 繳別係數`);
  [['半年繳',0.52],['季繳',0.262],['月繳',0.088]].forEach(([m,f])=>eq(Q(c,{age:40,sex,term:20,mode:m}).modal,Math.round(base*f),`${c} 40歲 20年 ${m} 保費`));}
// ---------- 3. 折扣（保費規定：繳費方式 1%、主約折扣上限 1%、無高保額折扣） ----------
eq([Q('CIA',{age:30,sex:1,term:20,payDisc:true}).annual,Q('CIA',{age:30,sex:1,term:20,payDisc:true}).paid],[30000,29700],'CIA DM 範例 30歲男 100萬 20年 30,000→29,700');
eq([Q('CIB',{age:30,sex:2,term:20,payDisc:true}).annual,Q('CIB',{age:30,sex:2,term:20,payDisc:true}).paid],[29300,29007],'CIB DM 範例 30歲女 100萬 20年 29,300→29,007');
eq(Q('CIA',{age:30,sex:1,term:20,sum:500,payDisc:true}).paid,148500,'CIA 500萬 無高保額折扣（只 1%）');
for(const c of ['CIA','CIB']){eq([P(c).pay,P(c).cap,P(c).health,!!P(c).hi],[0.01,0.01,0.01,false],`${c} 折扣設定 pay/cap/health 1%、無高保額`);}
// ---------- 4. 投保年齡／保額（投保規則 115.10.23） ----------
for(const c of ['CIA','CIB']){const sex=FX[c].sex;
  eq(P(c).terms,{"10":[0,65],"20":[0,55],"30":[0,45]},`${c} 繳費年期／投保年齡`);
  ok(!Q(c,{age:65,sex,term:10}).errs,`${c} 65歲 10年 可投保`);ok(!!Q(c,{age:66,sex,term:10}).errs,`${c} 66歲 10年 擋`);
  ok(!Q(c,{age:55,sex,term:20}).errs,`${c} 55歲 20年 可`);ok(!!Q(c,{age:56,sex,term:20}).errs,`${c} 56歲 20年 擋`);
  ok(!Q(c,{age:45,sex,term:30}).errs,`${c} 45歲 30年 可`);ok(!!Q(c,{age:46,sex,term:30}).errs,`${c} 46歲 30年 擋`);
  ok(!Q(c,{age:30,sex,term:20,sum:50}).errs,`${c} 50萬 可`);ok(!!Q(c,{age:30,sex,term:20,sum:49}).errs,`${c} 49萬 擋`);
  ok(!Q(c,{age:30,sex,term:20,sum:500}).errs,`${c} 500萬 可`);ok(!!Q(c,{age:30,sex,term:20,sum:501}).errs,`${c} 501萬 擋`);
  ok(!!Q(c,{age:30,sex,term:20,sum:50.5}).errs,`${c} 非萬元單位 擋`);}
// ---------- 5. 性別專屬：CIA 男、CIB 女 ----------
eq([P('CIA').sex,P('CIB').sex,CAT('CIA').sex,CAT('CIB').sex],[1,2,1,2],'CIA=男 CIB=女（PRODUCTS／CATALOG）');
ok(!!Q('CIA',{age:30,sex:2,term:20}).errs,'CIA 女性 擋');ok(!!Q('CIB',{age:30,sex:1,term:20}).errs,'CIB 男性 擋');
ok(/男性專屬/.test(CAT('CIA').other)&&/女性專屬/.test(CAT('CIB').other),'CATALOG 標示男／女性專屬');
// ---------- 6. 附約：防癌主約不得附加防癌險附約 ----------
for(const m of ['CIA','CIB','CLZ','CLX']){const mi=E.mInfo(m);
  for(const r of ['CWR4','PCC5','CMR','CNR','HSW'])ok(!E.riderOnMain(r,mi).ok,`${m} 不可附加 ${r}`);
  for(const r of ['ADG','HSV','HSY','TMR'])ok(E.riderOnMain(r,mi).ok,`${m} 可附加 ${r}`);}
// ---------- 7. 保額型癌症險累計 ≦500 萬 ----------
ok(!Q('CIA',{age:30,sex:1,term:20,sum:200,grpOther:300}).errs,'CIA 200萬＋其他癌症 300萬＝500 可');
ok(!!Q('CIA',{age:30,sex:1,term:20,sum:201,grpOther:300}).errs,'CIA 201萬＋其他癌症 300萬 擋');
ok(!!Q('CIB',{age:30,sex:2,term:20,sum:300,grpOther:300}).errs,'CIB 300萬＋其他癌症 300萬 擋');
eq([...E.CANCER_GRP].sort(),['CIA','CIB','CLQ','CLX','CLZ'],'累計癌症險群組');
// ---------- 8. CLX／CLZ 照常販售、無停售提示 ----------
const app=rd('app.js'),idx=rd('index.html');
ok(/const STOPSALE = \{\};/.test(app),'STOPSALE 為空（CLX／CLZ 不下架）');
ok(!/停售/.test(idx),'index.html 無停售字樣');
for(const c of ['CLZ','CLX'])ok(E.eligible?E.eligible(P(c),30)!==false:true,`${c} 30歲 可投保`);
ok(!Q('CLZ',{age:30,sex:1,term:20}).errs&&!Q('CLX',{age:30,sex:2,term:20}).errs,'CLZ／CLX 可報價');
// ---------- 9. 其他商品代表性 DM 範例（MAIN_RATES_PROGRESS.md） ----------
const dm=[['SDG',{age:30,sex:2,term:20},38600,38214],['CLX',{age:30,sex:2,term:20},29000,28710],['CLZ',{age:30,sex:1,term:20},29600,29304],['CLQ',{age:60,sex:1,term:20},33900,33561]];
for(const [c,o,a,p] of dm){const r=Q(c,Object.assign({payDisc:true},o));eq([r.annual,r.paid],[a,p],`${c} DM 範例 ${o.age}歲 100萬 20年 ${a}→${p}`);}
ok(W.PRODUCTS.length>=53,'主約數量 ≥53',W.PRODUCTS.length);
let bad=[];for(const p of W.PRODUCTS){if(!W.RATES[p.code])bad.push(p.code);}ok(!bad.length,'每個主約都有費率表',bad);
// ---------- 10. 搭配專區 PFD＋癌症險（combo.js 同邏輯；手算驗證 2026-10-22） ----------
run('combo/pfd_engine.js');run('combo/pfd_data.js');const ENG=vm.runInContext('ENG',ctx),PF=W.PFD_P,M=PF.meta;
function cRows(code,sex,age,S,T){const r=E.quote(P(code),{age,sex,occ:1,term:T,sum:S,mode:'年繳',payDisc:true});const rows=[];let c=0;for(let t=1;t<=120;t++){const py=t>T?0:(r.from2&&t>=r.from2&&r.paid2!=null?r.paid2:r.paid);c+=py;rows.push({py,cum:c});}return {rows,first:r.paid};}
function pfd(sex,age,S){const pr=ENG.prem(M,PF.data,sex,age,20,S,M.m1,M.m2);if(!pr)return null;return Object.assign(ENG.quote(M,PF.data,sex,age,20,S,2,'PUA',pr.p1,pr.p2),{p1:pr.p1});}
function combo(code,sex,age,S,T,Y,fx){const C=cRows(code,sex,age,S,T);for(let s=Math.round(M.smin*10);s<=Math.round(M.smax*10);s++){const x=pfd(sex,age,s/10);if(!x)continue;const r=x.rows[Y-1];if(r&&r.X*fx>=C.rows[Y-1].cum+r.cum*fx)return {Sp:s/10,p1:x.p1,first:C.first,tot:C.rows[Y-1].cum+r.cum*fx};}return null;}
for(const [code,sex,Sp,p1,first,tot] of [['CIA',1,21.7,4993,39105,3877760],['CIB',2,26.5,3488,29007,2742700],['CLZ',1,21.6,4970,38808,3857560]]){
  const age=sex===1?40:30,r=combo(code,sex,age,100,20,20,31);
  ok(!!r,`combo ${code} 有解`);if(!r)continue;
  eq(r.Sp,Sp,`combo ${code} ${age}歲 PFD 保額 ${Sp} 萬美元`);eq(Math.round(r.p1),p1,`combo ${code} PFD 年繳 US$${p1}`);eq(r.first,first,`combo ${code} 癌症險年繳 ${first}`);
  eq(Math.round(r.tot),tot,`combo ${code} 第20年累計已繳 ${tot}`);eq(Math.round(r.tot),(first+Math.round(p1*31))*20,`combo ${code} 累計＝(癌症險＋PFD×31)×20 手算`);}
// ---------- 11. 商品解說 CIAB（DM p2、條款第二條：年繳總和＝實際繳費年度數） ----------
vm.runInContext('window.EXPLAIN_TL=()=>"";',ctx);vm.runInContext(rd('explain/explain.js').split('\n').filter(l=>/^window\.CX[A-Z]?=/.test(l)).join('\n'),ctx);run('explain/CIAB.js');const X=W.EXPLAIN;
const ctxOf=(code,sex,age,T,sum)=>{const annual=FX[code].rates[String(T)][age]*sum;return {age,sum,S:sum*1e4,term:T,annual,tot:annual*T,payEnd:age+T};};
for(const [code,sex,age,T,sum,want] of [['CIA',1,60,10,100,1500000],['CIB',2,30,20,100,1500000],['CIA',1,65,10,500,7500000]]){
  const ex=X[code].examples(ctxOf(code,sex,age,T,sum))[0];eq(ex.pay,want,`解說 ${code} ${age}歲 ${T}年 ${sum}萬 第6年確診範例 ${want}`);
  ok(/已繳 6 年/.test(ex.calc),`解說 ${code} 範例文字寫已繳 6 年`);}
for(const c of ['CIA','CIB']){const d=X[c];ok(/等待期/.test(d.warn()),`解說 ${c} 有等待期`);ok(/無解約金/.test(d.warn()),`解說 ${c} 無解約金`);
  const cards=d.cards(ctxOf(c,FX[c].sex,30,20,100)).map(k=>k.t+k.line+k.sub).join('|');
  ok(/95 歲/.test(cards),`解說 ${c} 95歲祝壽`);ok(/取高/.test(cards)&&/第 1 年：年繳保費總和 ×1.06/.test(cards),`解說 ${c} 重度取高＋第1年規則`);
  ok(/嚴重頭部創傷、嚴重第三度燒燙傷/.test(cards),`解說 ${c} 特定傷病`);ok(/1～6 級失能/.test(cards),`解說 ${c} 豁免`);}
ok(/1\.5 倍/.test(X.CIA.tagline)&&/1\.5 倍/.test(X.CIB.tagline),'解說 特定癌症標語 1.5 倍');
ok(!/大腸/.test(X.CIB.examples(ctxOf('CIB',2,30,20,100)).map(e=>e.t).join()),'解說 CIB 範例不用大腸癌（不在女性 11 項）');
// ---------- 11b. v1.42 特定手術範例年齡不早於投保年齡、金額不變 ----------
for(const [code,sex,age,T,want] of [['CIA',1,30,20,60],['CIA',1,65,10,66],['CIB',2,30,20,60],['CIB',2,59,10,60],['CIB',2,60,10,61]]){
  const ex=X[code].examples(ctxOf(code,sex,age,T,100))[1];ok(ex.t.startsWith(want+' 歲'),`解說 ${code} ${age}歲投保 特定手術範例 ${want} 歲`,ex.t);eq(ex.pay,20000,`解說 ${code} ${age}歲 特定手術 2萬`);}
// ---------- 12. 禁用字（不顯示佣金、無團隊行銷字樣） ----------
for(const f of ['index.html','explain.html','combo.html','app.js','explain/CIAB.js'])ok(!/佣金|富爸爸/.test(rd(f)),`${f} 無佣金／富爸爸字樣`);
// ---------- 結果 ----------
console.log(`\n通過 ${pass}／${pass+fail}　失敗 ${fail}`);
if(fail){console.log('\n失敗項目：');fails.forEach(x=>console.log(' ✗ '+x));process.exit(1);}
