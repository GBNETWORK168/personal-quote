/* v1.59：手術圖示 🔪（像水果刀）改為內嵌 SVG 手術刀（銘旭大帝建議） */
(function(){ if(typeof MutationObserver==="undefined"||typeof document==="undefined"||!document.createTreeWalker) return;
const SVG='<svg class="scalpel" viewBox="0 0 24 24" width="1em" height="1em" aria-label="手術" role="img" style="vertical-align:-0.125em;display:inline-block"><path d="M3.2 20.8 L12.6 11.4" stroke="#64748b" stroke-width="2.6" stroke-linecap="round"/><path d="M12 12 L14.2 9.8 C16.8 7.2 19.6 4.9 21.4 3.4 C20.6 6.3 18.5 9.6 15.6 12.3 L14.2 13.6 Z" fill="#cbd5e1" stroke="#475569" stroke-width="1.1" stroke-linejoin="round"/><path d="M5.6 18.4 L7.4 16.6" stroke="#e2e8f0" stroke-width="0.9" stroke-linecap="round"/></svg>';
const K='\u{1F52A}';
function fix(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue.includes(K)?1:3}); const L=[]; while(w.nextNode()) L.push(w.currentNode);
  L.forEach(n=>{ if(n.parentNode.closest&&n.parentNode.closest('svg')){ n.nodeValue=n.nodeValue.split(K+' ').join('').split(K).join(''); return; }
    const s=document.createElement('span'); s.innerHTML=n.nodeValue.split(K).map(t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))).join(SVG); n.replaceWith(...s.childNodes); });
  if(document.title.includes(K)) document.title=document.title.split(K).join('');
}
let q=0; const run=()=>{q=0; mo.disconnect(); fix(document.body); mo.observe(document.body,{childList:true,subtree:true,characterData:true});};
const mo=new MutationObserver(()=>{ if(!q){q=1; requestAnimationFrame(run);} });
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run):run();
})();
