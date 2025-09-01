function toggleMenu(btn){
  const nav = document.getElementById('navmenu');
  if(!nav) return;
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true':'false');
}

(function(){
  const yearEl = document.getElementById('year');
  if (yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Build press filtering (works both EN/HE)
  const list = document.getElementById('press-list');
  const q = document.getElementById('q');
  const yearSel = document.getElementById('year');
  const langSel = document.getElementById('lang');
  if (!list) return;

  const raw = (window.__PRESS || []);
  const data = raw.map(x => Array.isArray(x) ? {title:x[0],date:x[1],url:x[2],lang:x[3]} : x)
                  .sort((a,b)=> (b.date||'').localeCompare(a.date||''));

  // Build Year options
  const years = Array.from(new Set(data.map(x => (x.date||'').slice(0,4)).filter(Boolean))).sort((a,b)=>b.localeCompare(a));
  if (yearSel) {
    years.forEach(y => {
      const o = document.createElement('option');
      o.value = y; o.textContent = y; yearSel.appendChild(o);
    });
  }

  function render(){
    const term = (q && q.value || '').toLowerCase();
    const y = (yearSel && yearSel.value) || '';
    const l = (langSel && langSel.value) || '';
    list.innerHTML = '';
    const filtered = data.filter(item => {
      const okTerm = !term || (item.title||'').toLowerCase().includes(term);
      const okYear = !y || (item.date||'').startsWith(y);
      const okLang = !l || (item.lang||'') === l;
      return okTerm && okYear && okLang;
    });
    filtered.forEach(item => {
      const li = document.createElement('li');
      const date = item.date || '';
      const a = document.createElement('a');
      a.href = item.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = item.title;
      const sd = document.createElement('span'); sd.className = 'press-date'; sd.textContent = date;
      li.appendChild(sd);
      li.insertAdjacentHTML('beforeend', ' — ');
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  window.resetFilters = function(){
    if(q) q.value = '';
    if(yearSel) yearSel.value = '';
    if(langSel) langSel.value = '';
    render();
  }

  if(q) q.addEventListener('input', render);
  if(yearSel) yearSel.addEventListener('change', render);
  if(langSel) langSel.addEventListener('change', render);
  render();
})();
