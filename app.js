/* 富邦個人險快速報價 v1.1 — 計算引擎 + UI（純前端，無外部相依） */
(function(){
const P = window.PRODUCTS, RT = window.RATES;
const fmt = n => n==null ? '-' : Math.round(n).toLocaleString('zh-TW');
const pick = (tbl, age) => { for (const [up, v] of tbl) if (age <= up) return v; return null; };
const UNIT = {day:'元／日', wan:'萬元', unit:'單位'};

// ---------- 規則 ----------
function termsFor(p, age, plan){
  const t = (plan && plan.startsWith('HAD')) ? p.terms80 : p.terms;
  return Object.keys(t).map(Number).filter(k => age >= t[k][0] && age <= t[k][1]);
}
function eligible(p, age){
  if (p.plans) return termsFor(p, age, 'HAC1').length + termsFor(p, age, 'HAD1').length > 0;
  return termsFor(p, age).length > 0;
}
function ageRangeText(p){
  const f = t => Object.entries(t).map(([k,[a,b]]) => `${k==0?'躉繳':k==1?'一年期':k+'年期'} ${a}–${b}歲`).join('、');
  return p.plans ? `HAC(75歲啟動) ${f(p.terms)}；HAD(80歲啟動) ${f(p.terms80)}` : f(p.terms);
}
function limits(p, age, occ){
  // 回傳以「輸入單位」計的 [min, max, step]；day=元/日、wan=萬元、unit=單位
  if (p.unit === 'unit') return [1, 1, 1];
  if (p.fixed) { const v = pick(p.fixed.age, age); return [v, v, 1]; }
  let mn = typeof p.min === 'object' ? pick(p.min.age, age) : p.min;
  let mx;
  const m = p.max;
  if (m.all != null) mx = m.all;
  else if (m.occ) mx = m.occ[occ-1];
  else if (m.age) mx = pick(m.age, age);
  else if (m.occage) mx = pick(m.occage, age)[occ-1];
  const step = p.unit === 'day' ? 100 : (p.step || 1);
  return [mn, mx, step];
}

// ---------- 計算（對齊建議書 OP 公式） ----------
// 原始年繳 = ROUND(保額單位數 × 費率, 1)；繳別保費 = ROUND(年繳 × 繳別係數, 0)；實繳 = ROUND(繳別保費 × (1 − 折扣), 0)
function quote(p, q){
  const errs = [];
  if (!eligible(p, q.age)) errs.push(`投保年齡不符：${ageRangeText(p)}`);
  const plan = p.plans ? q.plan : p.code;
  const terms = termsFor(p, q.age, plan);
  if (!terms.includes(q.term)) errs.push(`此年齡不可選 ${q.term} 年期（可選：${terms.map(t=>t==0?'躉繳':t+'年').join('、')||'無'}）`);
  const [mn, mx, step] = limits(p, q.age, q.occ);
  const S = q.sum;
  if (!(S >= mn - 1e-9)) errs.push(`保額低於最低 ${mn.toLocaleString()} ${UNIT[p.unit]}`);
  if (!(S <= mx + 1e-9)) errs.push(`保額超過上限 ${mx.toLocaleString()} ${UNIT[p.unit]}`);
  if (Math.abs(Math.round(S/step)*step - S) > 1e-6) errs.push(`保額需以 ${step} ${UNIT[p.unit]} 為單位`);
  if (errs.length) return {errs};
  const row = RT[p.code][`${plan}|${q.term}|${q.sex}`];
  const rate = row && row[1][q.age - row[0]];
  if (rate == null) return {errs:['查無費率（此組合不在費率表內）']};
  const units = p.unit === 'day' ? S/100 : S;
  const annual = Math.round(units * rate * 10 + 1e-7) / 10;
  const f = p.mf[q.mode] || 1;
  const modal = Math.round(annual * f + 1e-7);
  let bp = 0; const dl = [];
  if (q.payDisc && p.pay) { bp += p.pay*10000; dl.push(`繳費方式 ${p.pay*100}%`); }
  if (p.hi) for (const [th, r] of p.hi) if (S >= th) { bp += r*10000; dl.push(`高保額 ${r*100}%`); break; }
  bp = Math.min(bp, Math.round((p.cap||0)*10000));
  const paid = Math.round(modal * (10000 - bp) / 10000 + 1e-7);
  const n = {年繳:1,躉繳:1,半年繳:2,季繳:4,月繳:12}[q.mode];
  const firstYear = q.mode === '月繳' ? paid*12 : paid*n;  // 月繳首年實繳＝首期2個月＋續期10個月，首續期折扣相同時即 ×12
  const warn = p.warn && p.warn[`${q.term}|${q.sex}|${q.age}`];
  return {rate, units, annual, modal, paid, bp, dl, firstYear, n, warn};
}
// ---------- 主約／附約目錄（尚未收錄費率者：只做投保年齡／性別／職業篩選＋商品說明） ----------
const CAT = window.CATALOG || [];
const KIND = {main:'主約', rider:'附約', waiver:'豁免附約'};
function catElig(c, age, sex, occ, pAge){
  if (c.sex && c.sex !== sex) return {ok:false, why:c.sex===1?'男性專屬商品':'女性專屬商品'};
  if (c.occx && c.occx.includes(occ)) return {ok:false, why:`職業第 ${c.occx.join('、')} 類不可附加`};
  const par = c.ages.filter(x => x.who === 'parent');
  if (par.length){
    if ((pAge == null || pAge === '') && age + 15 > Math.max(...par.map(x=>x.b))) return {ok:false, why:`被保險人 ${age} 歲，父母（要保人）年齡必超過 ${Math.max(...par.map(x=>x.b))} 歲上限`};
    if (pAge == null || pAge === '') return {ok:'cond', why:`看要保人（父母）年齡 ${par.map(x=>x.a+'–'+x.b).join('、')} 歲`};
    const hit = par.some(x => pAge >= x.a && pAge <= x.b);
    return hit ? {ok:true, terms:[`要保人 ${pAge} 歲`]} : {ok:false, why:`要保人（父母）年齡需 ${par.map(x=>x.a+'–'+x.b).join('、')} 歲`};
  }
  const prim = c.ages.filter(x => !x.who);
  const hit = prim.filter(x => age >= x.a && age <= x.b);
  if (hit.length) return {ok:true, terms:hit.map(x=>x.t)};
  const kid = c.ages.filter(x => x.who === '子女' && age >= x.a && age <= x.b);
  if (kid.length) return {ok:true, terms:['以子女身分附加'], child:true};
  return {ok:false, why:'投保年齡 '+agesText(c)};
}
function agesText(c){ return c.ages.map(x => `${x.t} ${x.a}–${x.b}歲`).join('、'); }

window.QuoteEngine = {quote, limits, termsFor, eligible, catElig};
if (typeof document === 'undefined') return;

// ---------- UI ----------
const $ = s => document.querySelector(s);
const st = {age:30, sex:1, occ:1, pAge:null, open:null, sel:{}, cart:[]};
try { Object.assign(st, JSON.parse(localStorage.getItem('fbq1')||'{}'), {open:null}); } catch(e){}
const save = () => localStorage.setItem('fbq1', JSON.stringify({age:st.age,sex:st.sex,occ:st.occ,pAge:st.pAge,cart:st.cart}));

function insAge(bd){
  const b = new Date(bd), t = new Date();
  let y = t.getFullYear()-b.getFullYear(), m = t.getMonth()-b.getMonth(), d = t.getDate()-b.getDate();
  if (d < 0) m -= 1; if (m < 0) { y -= 1; m += 12; }
  const extra = (m > 6 || (m === 6 && d > 0)) ? 1 : 0;   // 零數超過六個月加一歲
  return y + extra;
}
function defaultsFor(p){
  const s = st.sel[p.code] || {};
  const plan = p.plans ? (s.plan || 'HAC1') : p.code;
  const terms = termsFor(p, st.age, plan);
  const [mn, mx] = limits(p, st.age, st.occ);
  let term = terms.includes(s.term) ? s.term : terms[terms.length-1];
  let sum = s.sum != null ? s.sum : (p.unit==='day' ? Math.min(Math.max(1000,mn),mx) : mn);
  const mode = p.modes.includes(s.mode) ? s.mode : p.modes[0];
  return Object.assign({plan, term, sum, mode, payDisc: s.payDisc !== false}, {terms});
}

function catItem(c, e){
  const key = 'c:'+c.code, open = st.open === key;
  const tag = e.ok==='cond' ? '<span class="tag cond">看要保人年齡</span>' : e.child ? '<span class="tag cond">子女身分</span>' : '';
  return `<div class="prod pend${open?' open':''}" data-c="${key}">
    <div class="ph"><span class="code ${c.kind}">${c.code}</span><span class="nm">${c.name}${tag}<span class="meta">${e.ok===true?e.terms.join('／')+'｜':''}${c.cover}｜<em>費率整理中</em></span></span><span class="arrow">${open?'▲':'▼'}</span></div>
    <div class="pb">${open ? catPanel(c, e) : ''}</div></div>`;
}
function catPanel(c, e){
  const row = (k, v) => v ? `<tr><th>${k}</th><td>${v}</td></tr>` : '';
  let h = `<div class="what"><b>這是甚麼？</b> 富邦人壽${c.name}（${c.code}）｜${KIND[c.kind]}｜${c.cat}</div>`;
  h += `<table class="info">${row('投保年齡', c.ages.map(x=>`${x.t}：${x.a}–${x.b} 歲`).join('<br>'))}${row('保障期間', c.cover)}${row('保額規定', c.sum)}${row(c.kind==='main'?'附加附約':'附加條件', c.attach)}${row('其他', [c.other, c.note].filter(Boolean).join('<br>'))}${row('職業限制', c.occx.length?`第 ${c.occx.join('、')} 類不可附加`:'')}</table>`;
  if (e.ok === false) h += `<div class="err">⛔ ${e.why}</div>`;
  if (c.ben.length) h += `<div class="ben"><b>主要給付項目</b>（金額依條款／商品內容說明）<div class="chips">${c.ben.map(b=>`<span class="chip">${b}</span>`).join('')}</div></div>`;
  h += `<div class="stub">💡 保費試算：此商品費率資料整理中（尚未從費率表抽取並驗證），請先以公司建議書系統試算。可先「加入組合」記下，保費標示為待試算。</div>`;
  h += `<div class="note">依據：${c.rule}（投保規則）</div>`;
  h += `<button class="add" data-cadd="${c.code}" ${e.ok===false?'disabled':''}>＋ 加入組合（保費待試算）</button>`;
  return h;
}

function v1Item(p){
  const ts = p.plans ? [...new Set([...termsFor(p,st.age,'HAC1'),...termsFor(p,st.age,'HAD1')])].sort((a,b)=>a-b) : termsFor(p, st.age);
  const [mn,mx] = limits(p, st.age, st.occ);
  const lim = p.unit==='unit' ? '1 單位' : (mn===mx ? `限 ${mn.toLocaleString()} ${UNIT[p.unit]}` : `${mn.toLocaleString()}–${mx.toLocaleString()} ${UNIT[p.unit]}`);
  return `<div class="prod${st.open===p.code?' open':''}" data-c="${p.code}">
    <div class="ph"><span class="code main">${p.code}</span><span class="nm">${p.name}<span class="meta">${ts.map(t=>t==0?'躉繳':t==1?'一年期':t+'年').join('／')}｜${lim}｜保障 ${p.cover}</span></span><span class="arrow">${st.open===p.code?'▲':'▼'}</span></div>
    <div class="pb">${st.open===p.code ? panel(p) : ''}</div></div>`;
}
function grouped(items, fn){
  let h = '', cat = '';
  for (const it of items){ const c = it.c || it; if (c.cat !== cat){ cat = c.cat; h += `<div class="cat">${cat}</div>`; } h += fn(it); }
  return h;
}

function render(){
  $('#age').value = st.age;
  document.querySelectorAll('#sex button').forEach(b => b.classList.toggle('on', +b.dataset.v === st.sex));
  $('#occ').value = st.occ;
  $('#page').value = st.pAge == null ? '' : st.pAge;
  // 主約：v1 可試算
  const ok = P.filter(p => eligible(p, st.age)), no = P.filter(p => !eligible(p, st.age));
  // 目錄：其他主約、附約、豁免
  const ev = CAT.map(c => ({c, e:catElig(c, st.age, st.sex, st.occ, st.pAge)}));
  const mOk = ev.filter(x => x.c.kind==='main' && x.e.ok), mNo = ev.filter(x => x.c.kind==='main' && !x.e.ok);
  const rOk = ev.filter(x => x.c.kind!=='main' && x.e.ok), rNo = ev.filter(x => x.c.kind!=='main' && !x.e.ok);
  const nMain = ok.length + mOk.length, nRider = rOk.length;
  $('#cnt').textContent = `${st.age} 歲${st.sex==1?'男':'女'}｜職業第 ${st.occ} 類`;
  $('#sumMain').textContent = nMain; $('#sumRider').textContent = nRider;
  $('#subMain').textContent = `可試算 ${ok.length}｜費率整理中 ${mOk.length}`;
  $('#subRider').textContent = `全部費率整理中`;
  // 主約區
  let h = `<div class="subhd">✅ 可立即試算（${ok.length}）</div>` + (grouped(ok, v1Item) || '<div class="empty">此年齡沒有可試算的主約。</div>');
  h += `<div class="subhd pendhd">🕒 費率整理中，可先看商品內容（${mOk.length}）</div>` + (grouped(mOk, x => catItem(x.c, x.e)) || '<div class="empty">無</div>');
  $('#list').innerHTML = h;
  const noM = no.map(p => `<div class="nl"><b>${p.code}</b> ${p.name}<br>${ageRangeText(p)}</div>`).join('') + mNo.map(x => `<div class="nl"><b>${x.c.code}</b> ${x.c.name}<br>${x.e.why}</div>`).join('');
  $('#nl').innerHTML = noM; $('#nolist').style.display = noM ? '' : 'none';
  $('#nolistcnt').textContent = `（${no.length + mNo.length}）`;
  // 附約區
  $('#rlist').innerHTML = grouped(rOk, x => catItem(x.c, x.e)) || '<div class="empty">此條件沒有可附加的附約。</div>';
  const noR = rNo.map(x => `<div class="nl"><b>${x.c.code}</b> ${x.c.name}<br>${x.e.why}</div>`).join('');
  $('#rnl').innerHTML = noR; $('#rnolist').style.display = noR ? '' : 'none';
  $('#rnolistcnt').textContent = `（${rNo.length}）`;
  renderCart();
}

function panel(p){
  const s = defaultsFor(p); st.sel[p.code] = s;
  const [mn, mx, step] = limits(p, st.age, st.occ);
  let h = `<div class="what"><b>這是甚麼？</b> 富邦人壽${p.name}（${p.code}）｜主約｜${p.cat}｜保障 ${p.cover}｜投保年齡 ${ageRangeText(p)}</div>`;
  if (p.plans){
    const pl = s.plan.slice(3), start = s.plan.startsWith('HAD') ? 80 : 75;
    h += `<div class="fl">計劃別</div><div class="chips">${[1,2,3].map(i=>`<button class="chip${pl==i?' on':''}" data-k="plan" data-v="${start==75?'HAC':'HAD'}${i}">計劃 ${i}</button>`).join('')}</div>`;
    h += `<div class="fl">實支實付保險金啟動日</div><div class="chips">${[75,80].map(a=>{const code=(a==75?'HAC':'HAD')+pl; const can=termsFor(p,st.age,code).length>0; return `<button class="chip${start==a?' on':''}" data-k="plan" data-v="${code}" ${can?'':'disabled'}>${a} 歲（${a==75?'HAC':'HAD'}${pl}）${can?'':'－年齡不符'}</button>`}).join('')}</div>`;
  }
  h += `<div class="fl">繳費年期</div><div class="chips">${s.terms.map(t=>`<button class="chip${t===s.term?' on':''}" data-k="term" data-v="${t}">${t==0?'躉繳':t==1?'一年期':t+' 年'}</button>`).join('')}</div>`;
  if (p.unit !== 'unit'){
    h += `<div class="fl">${p.unit==='day'?'住院醫療日額':'保額'}（${mn===mx?'固定':mn.toLocaleString()+'–'+mx.toLocaleString()}，${p.unit==='day'?'以百元為單位':'每 '+step+' '+UNIT[p.unit]}）</div>
      <div class="sumrow"><button class="pm" data-k="sumd" data-v="-1">−</button><input id="sum" type="number" inputmode="decimal" step="${step}" value="${s.sum}" ${mn===mx?'readonly':''}><span class="unit">${UNIT[p.unit]}</span><button class="pm" data-k="sumd" data-v="1">＋</button></div>`;
  }
  if (p.modes.length > 1) h += `<div class="fl">繳別</div><div class="chips">${p.modes.map(m=>`<button class="chip${m===s.mode?' on':''}" data-k="mode" data-v="${m}">${m}</button>`).join('')}</div>`;
  if (p.pay) h += `<label class="chk"><input type="checkbox" id="pd" ${s.payDisc?'checked':''}> 繳費方式折扣 ${p.pay*100}%（首期匯款／轉帳／富邦信用卡；續期轉帳／富邦信用卡／自行繳費）</label>`;
  const r = quote(p, Object.assign({age:st.age, sex:st.sex, occ:st.occ}, s));
  if (r.errs) h += `<div class="err">⛔ ${r.errs.join('<br>⛔ ')}</div>`;
  else {
    h += `<div class="res"><div>${s.mode}${s.mode!=='年繳'&&s.mode!=='躉繳'?'每期':''}實繳保費</div><div class="big">NT$ ${fmt(r.paid)}</div>
      <table><tr><td>${s.mode==='躉繳'?'躉繳':'年繳'}保費（折扣前）</td><td>${fmt(r.annual)}</td></tr>
      ${s.mode!=='年繳'&&s.mode!=='躉繳'?`<tr><td>${s.mode}每期（折扣前）</td><td>${fmt(r.modal)}</td></tr><tr><td>首年實繳合計</td><td>${fmt(r.firstYear)}</td></tr>`:''}
      <tr><td>折扣</td><td>${r.bp? (r.bp/100)+'%（'+r.dl.join('＋')+'）':'無'}</td></tr>
      <tr><td>費率</td><td>${r.rate.toLocaleString()} 元／每${p.unit==='day'?'百元日額':p.unit==='wan'?'萬元':'單位'}</td></tr></table></div>`;
    if (r.warn) h += `<div class="warn">⚠ ${r.warn}</div>`;
  }
  if (p.health) h += `<div class="note">另有健康管理保險費折扣（${p.health*100}%，依保費規定／條款於續期適用，未計入上方金額）。</div>`;
  if (p.note) h += `<div class="note">${p.note}</div>`;
  if (p.keyfmt==='yrt') h += `<div class="note">一年期自然費率：上方為首年保費，續保依續保年齡費率計收。</div>`;
  h += `<div class="ben"><b>主要給付項目</b>（金額依條款／商品內容說明）<div class="chips">${p.ben.map(b=>`<span class="chip">${b}</span>`).join('')}</div></div>`;
  h += `<div class="note">保障期間：${p.cover}｜建議書 ${p.ver}｜費率來源：${p.src.split('/').pop()}</div>`;
  h += `<button class="add" data-k="add" ${r.errs?'disabled':''}>＋ 加入組合</button>`;
  return h;
}

function renderCart(){
  const c = $('#cart');
  if (!st.cart.length){ c.classList.add('hidden'); return; }
  c.classList.remove('hidden');
  const tot = st.cart.reduce((a,x)=>a+(x.firstYear||0),0), pend = st.cart.filter(x=>x.pending).length;
  $('#cartsum').textContent = `組合 ${st.cart.length} 項｜首年實繳 NT$ ${fmt(tot)}${pend?`（另 ${pend} 項待試算）`:''}`;
  $('#cartbody').innerHTML = st.cart.map((x,i)=>`<div class="ci"><div>${x.code} ${x.name}<small>${x.desc}</small></div><div style="text-align:right">${x.pending?'待試算':fmt(x.paid)}<small>${x.mode||''}</small><button data-rm="${i}">刪除</button></div></div>`).join('')
    + `<div style="display:flex;gap:8px;margin-top:10px"><button id="copy">複製文字（貼 LINE）</button><button id="clear">清空</button></div>`;
}

function cartText(){
  const tot = st.cart.reduce((a,x)=>a+(x.firstYear||0),0), pend = st.cart.filter(x=>x.pending).length;
  return `【富邦保費試算】${st.age}歲${st.sex==1?'男':'女'}\n` + st.cart.map(x=>x.pending?`・${x.code} ${x.name}｜${x.desc}｜保費待試算`:`・${x.code} ${x.name}｜${x.desc}｜${x.mode} ${fmt(x.paid)} 元`).join('\n') + `\n首年實繳合計：${fmt(tot)} 元${pend?`（不含 ${pend} 項待試算）`:''}\n※僅供參考，以公司正式建議書為準`;
}

document.addEventListener('click', e => {
  const pm = e.target.closest('#step1 .pm');
  if (pm){ st.age = Math.max(0, Math.min(85, st.age + +pm.dataset.d)); save(); render(); return; }
  const sx = e.target.closest('#sex button');
  if (sx){ st.sex = +sx.dataset.v; save(); render(); return; }
  const ph = e.target.closest('.ph');
  if (ph){ const c = ph.parentNode.dataset.c; st.open = st.open===c ? null : c; render(); return; }
  const k = e.target.closest('[data-k]');
  if (k){
    const p = P.find(x => x.code === st.open); if (!p) return; const s = st.sel[p.code];
    const v = k.dataset.v;
    if (k.dataset.k==='plan'){ s.plan = v; }
    else if (k.dataset.k==='term') s.term = +v;
    else if (k.dataset.k==='mode') s.mode = v;
    else if (k.dataset.k==='sumd'){ const [mn,mx,step]=limits(p,st.age,st.occ); s.sum = Math.round((Math.min(mx,Math.max(mn,(+s.sum||0)+ +v*step)))*100)/100; }
    else if (k.dataset.k==='add'){
      const r = quote(p, Object.assign({age:st.age,sex:st.sex,occ:st.occ}, s));
      if (!r.errs){
        const desc = (p.plans?`計劃${s.plan.slice(3)}(${s.plan.startsWith('HAD')?80:75}歲啟動)｜`:'') + (s.term==0?'躉繳':s.term==1?'一年期':s.term+'年期') + (p.unit==='unit'?'｜1單位':`｜${s.sum.toLocaleString()}${UNIT[p.unit]}`);
        st.cart.push({code:p.plans?s.plan:p.code, name:p.name, desc, mode:s.mode, paid:r.paid, firstYear:r.firstYear}); save();
      }
    }
    render(); return;
  }
  const ca = e.target.closest('[data-cadd]');
  if (ca){ const c = CAT.find(x=>x.code===ca.dataset.cadd); st.cart.push({code:c.code, name:c.name, desc:KIND[c.kind]+'｜'+c.cat, pending:true}); save(); renderCart(); ca.textContent='✓ 已加入組合'; return; }
  const jp = e.target.closest('[data-jump]');
  if (jp){ document.getElementById(jp.dataset.jump).scrollIntoView({behavior:'smooth', block:'start'}); return; }
  const rm = e.target.closest('[data-rm]');
  if (rm){ st.cart.splice(+rm.dataset.rm,1); save(); renderCart(); return; }
  if (e.target.id==='cartopen'){ $('#cart').classList.toggle('open'); return; }
  if (e.target.id==='clear'){ st.cart=[]; save(); renderCart(); return; }
  if (e.target.id==='copy'){ const t=cartText(); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>alert('已複製'),()=>prompt('請複製以下文字',t)); return; }
});
document.addEventListener('change', e => {
  if (e.target.id==='age'){ st.age = Math.max(0, Math.min(85, parseInt(e.target.value)||0)); save(); render(); }
  if (e.target.id==='page'){ const v = e.target.value.trim(); st.pAge = v==='' ? null : Math.max(0, Math.min(99, parseInt(v)||0)); save(); render(); }
  if (e.target.id==='occ'){ st.occ = +e.target.value; save(); render(); }
  if (e.target.id==='bd' && e.target.value){ st.age = insAge(e.target.value); $('#agehint').textContent = `生日 ${e.target.value} → 今日保險年齡 ${st.age} 歲`; save(); render(); }
  if (e.target.id==='sum'){ st.sel[st.open].sum = parseFloat(e.target.value)||0; render(); }
  if (e.target.id==='pd'){ st.sel[st.open].payDisc = e.target.checked; render(); }
});
$('#ver').textContent = '可試算主約：' + P.map(p=>p.code).join('、') + '｜費率整理中：' + CAT.map(c=>c.code).join('、');
render();
})();
