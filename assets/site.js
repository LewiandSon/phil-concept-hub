/* phil space - shared script for all pages: reveal, language, nav */
window.__reveal=true;
/* scroll reveal: staggered fade/slide-in, clip-wipe for hero & room image.
   Own block, so an error elsewhere can never leave content hidden. */
(function(){
  var root=document.documentElement;
  try{
    var stag='.uses,.equip,.abcards,.cater,.gallery,.quotes,.facts,.seatings,.loc-list,.faq,.logos,.occ-chips,.facts-bar,.tiles,.pteaser,.mosaic';
    document.querySelectorAll(stag).forEach(function(g){ g.classList.remove('rv'); Array.prototype.forEach.call(g.children,function(c,i){ c.classList.add('rv'); c.style.setProperty('--d',Math.min(i,8)*70+'ms'); }); });
    [['.hero .place',0],['.hero h1',90],['.hero .lede',180],['.hero-cta',270],['.hero-view',360],['.hero-figure',120],['.page-hero .kicker',0],['.page-hero h1',90],['.page-hero .lede',180]].forEach(function(p){ var el=document.querySelector(p[0]); if(el){ el.classList.add('rv'); el.style.setProperty('--d',p[1]+'ms'); } });
    var els=document.querySelectorAll('.rv');
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -6% 0px',threshold:0});
    els.forEach(function(e){ io.observe(e); });
    /* safety sweep: reveal whatever is already on screen once fonts/layout settle */
    var sweep=function(){ els.forEach(function(e){ if(e.classList.contains('in')) return; var r=e.getBoundingClientRect(); if(r.top<innerHeight && r.bottom>0){ e.classList.add('in'); io.unobserve(e); } }); };
    window.addEventListener('load',sweep);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(sweep);
  }catch(err){ root.classList.remove('js'); }
})();


function setLang(lang){
  document.documentElement.lang=lang;
  document.getElementById('lDe').classList.toggle('on',lang==='de');
  document.getElementById('lEn').classList.toggle('on',lang==='en');
  document.querySelectorAll('[data-de]').forEach(el=>{ const v=el.getAttribute('data-'+lang); if(v===null) return; const arr=el.querySelector(':scope > .arr'); el.innerHTML=v; if(arr && !el.querySelector('.arr')) el.appendChild(arr); });
  document.querySelectorAll('[data-de-ph]').forEach(el=>{ const v=el.getAttribute('data-'+lang+'-ph'); if(v!==null) el.setAttribute('placeholder',v); });
  try{ if(window.__renderCal) window.__renderCal(); }catch(e){}
  try{ if(typeof recalc==='function') recalc(); }catch(e){}
  try{ localStorage.setItem('philspace_lang',lang);}catch(e){}
}
document.getElementById('burger').addEventListener('click',function(){ const o=document.getElementById('navMid').classList.toggle('open'); this.setAttribute('aria-expanded',o); });
document.querySelectorAll('#navMid a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navMid').classList.remove('open')));
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!window.matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.btn-primary').forEach(btn=>{
    btn.addEventListener('pointermove',e=>{ const r=btn.getBoundingClientRect(); const x=(e.clientX-r.left-r.width/2)/r.width; const y=(e.clientY-r.top-r.height/2)/r.height; btn.style.transform=`translate(${x*5}px, ${y*4}px)`; });
    btn.addEventListener('pointerleave',()=>{ btn.style.transform=''; });
  });
})();
document.getElementById('yr').textContent=new Date().getFullYear();
(function(){let s='de';try{s=localStorage.getItem('philspace_lang')||'de';}catch(e){}if(s!=='de')setLang(s);})();
