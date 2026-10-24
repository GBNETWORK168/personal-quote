// 每日美元換算預設值：讀 data/fx.json（GitHub Actions 每日更新），失敗則維持 31；使用者可自行修改
(function(){const d=new Date(),k=d.getFullYear()+''+(d.getMonth()+1)+d.getDate();
fetch('data/fx.json?d='+k).then(r=>r.json()).then(j=>{if(!j||!(j.usd>0))return;const m=j.date.slice(5).replace('-','/').replace(/^0/,'');
['fx','b_fx'].forEach(id=>{const e=document.getElementById(id);if(!e)return;if(e.value==='31'&&!e.dataset.ed){e.value=j.usd;e.dispatchEvent(new Event('change'))}
const s=document.createElement('span');s.textContent=' '+m;s.style.cssText='color:#999;font-size:11px';e.parentNode.appendChild(s);e.addEventListener('input',()=>e.dataset.ed=1)})}).catch(()=>{})})();
