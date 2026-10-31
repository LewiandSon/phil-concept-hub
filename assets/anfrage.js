/* phil space - pricing calculator, calendar & enquiry form (anfrage page only) */
/* =========================================================
   PREISE - alle Beträge an EINER Stelle. Hier anpassen.
   Raummiete = Grundpreis je Zeitfenster inkl. `incl` Personen,
   jede weitere Person kostet `extra`. Kuchen und Catering pro Person.
   ========================================================= */
const PRICING = {
  room: {                                       // Grundpreis inkl. 15 Pers. + je weitere Person (netto)
    am:      { base:480,  incl:15, extra:15 },   // Vormittag 09-14 (Halbtag, 5 h)
    pm:      { base:480,  incl:15, extra:15 },   // Nachmittag 14-19 (Halbtag, 5 h)
    full:    { base:780,  incl:15, extra:20 },   // Ganztag 09-18 (9 h)
    evening: { base:480,  incl:15, extra:15 },   // Abend 18-22 (4 h)
    dayeve:  { base:1050, incl:15, extra:25 }    // Tag + Abend 09-22 (13 h, Bundle)
  },
  drinksValue: '6–15 €',                        // Marktwert der inkludierten Getränkeflat p. P. (nur Anzeige)
  addons: {
    cake:     { type:'perHead', amount:6 },     // pro Person
    catering: { type:'perHead', amount:16 }     // pro Person
  }
};

/* ---- calculator state ---- */
const calcState = { time:'am', people:20, cake:false, catering:false };

function fmt(n){ return n.toLocaleString('de-AT'); }

function recalc(){
  const L = document.documentElement.lang==='de';
  const n = Math.max(1, Math.min(60, calcState.people||1));

  const LBL = { am:['Vormittag','Morning'], pm:['Nachmittag','Afternoon'], full:['Ganztag','Full day'], evening:['Abend','Evening'], dayeve:['Tag + Abend','Day + evening'] };
  const roomLbl = (LBL[calcState.time] || LBL.am)[L?0:1];
  const R = PRICING.room[calcState.time] || PRICING.room.am;
  const extraP = Math.max(0, n - R.incl);

  let total = R.base + extraP*R.extra;
  const lines = [];
  lines.push(`<b>${L?'Raummiete':'Room'}</b> ${roomLbl} ${fmt(R.base)} € (${L?'inkl.':'incl.'} ${R.incl} ${L?'Pers.':'ppl'})`);
  if(extraP) lines.push(`${L?'Weitere Personen':'Additional people'} ${extraP}×${R.extra} € = +${fmt(extraP*R.extra)} €`);
  lines.push(`${L?'Kaffee & Getränke für':'Coffee & drinks for'} ${n} ${L?'Pers.':'ppl'} · <b>${L?'inklusive':'included'}</b> (${L?'sonst':'elsewhere'} ${PRICING.drinksValue} ${L?'p. P.':'p.p.'})`);

  if(calcState.cake){ const a=PRICING.addons.cake.amount*n; total+=a; lines.push(`${L?'Kuchen':'Cake'} ${n}×${PRICING.addons.cake.amount} € = +${fmt(a)} €`); }
  if(calcState.catering){ const a=PRICING.addons.catering.amount*n; total+=a; lines.push(`${L?'Catering':'Catering'} ${n}×${PRICING.addons.catering.amount} € = +${fmt(a)} €`); }

  document.getElementById('totalNum').innerHTML = 'ca. '+fmt(total)+' €<small>'+(L?'unverbindlich':'non-binding')+'</small>';
  document.getElementById('breakdown').innerHTML = lines.join('<br>');
  const pf=document.getElementById('p'); if(pf && document.activeElement!==pf) pf.value=n;
  return { timeLbl:roomLbl, total, people:n };
}

/* ---- time segment ---- */
document.querySelectorAll('#segTime button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#segTime button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); calcState.time=b.dataset.time; recalc();
}));
/* ---- people stepper ---- */
const cp=document.getElementById('calcPpl');
function setPeople(v){ v=Math.max(1,Math.min(60,v||1)); calcState.people=v; cp.value=v; recalc(); }
document.getElementById('pMinus').addEventListener('click',()=>setPeople(calcState.people-1));
document.getElementById('pPlus').addEventListener('click',()=>setPeople(calcState.people+1));
cp.addEventListener('input',()=>{ calcState.people=parseInt(cp.value||'1',10); recalc(); });
cp.addEventListener('blur',()=>setPeople(parseInt(cp.value||'1',10)));
/* ---- addon toggles ---- */
document.querySelectorAll('.addon').forEach(a=>a.addEventListener('click',()=>{
  const k=a.dataset.addon; calcState[k]=!calcState[k]; a.classList.toggle('on',calcState[k]); recalc();
}));

/* ---- ab-cards jump to calculator with preset time ---- */
document.querySelectorAll('[data-time-jump]').forEach(a=>a.addEventListener('click',()=>{
  const time=a.getAttribute('data-time-jump');
  document.querySelectorAll('#segTime button').forEach(x=>x.classList.toggle('on', x.dataset.time===time));
  calcState.time=time; recalc();
}));

/* ---- step 1 -> step 2 ---- */
document.getElementById('toStep2').addEventListener('click',()=>{
  const L=document.documentElement.lang==='de';
  const r=recalc();
  const step2=document.getElementById('step2');
  step2.classList.remove('locked');
  // recap chip in step 2
  const adds=[]; if(calcState.cake)adds.push(L?'Kuchen':'Cake'); if(calcState.catering)adds.push(L?'Catering':'Catering');
  const recap=document.getElementById('recap');
  recap.innerHTML='<span><b>'+r.timeLbl+'</b> · '+calcState.people+' '+(L?'Personen':'people')+(adds.length?' · '+adds.join(', '):'')+'</span><span class="chip">ca. '+fmt(r.total)+' €</span>';
  recap.classList.add('show');
  step2.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>document.getElementById('n').focus(),420);
});

/* =========================================================
   CUSTOM CALENDAR
   ========================================================= */
const CALS=[];
function makeCal(sfx){
  const $=id=>document.getElementById(id+sfx);
  const btn=$('dateBtn'), cal=$('cal'), txt=$('dateText'), hidden=$('d');
  const title=$('calTitle'), dowRow=$('calDow'), daysRow=$('calDays');
  if(!btn||!cal) return null;
  const today=new Date(); today.setHours(0,0,0,0);
  let view=new Date(today.getFullYear(),today.getMonth(),1);
  let selected=null;
  const monthsDe=['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const monthsEn=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dowDe=['M','D','M','D','F','S','S'], dowEn=['M','T','W','T','F','S','S'];

  function lang(){ return document.documentElement.lang==='de'?'de':'en'; }
  function fmtSel(){ return selected.toLocaleDateString(lang()==='de'?'de-AT':'en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'}); }
  function renderDow(){ const d=lang()==='de'?dowDe:dowEn; dowRow.innerHTML=d.map(x=>`<div class="cal-dow">${x}</div>`).join(''); }
  function setSel(d){
    selected=d;
    if(d){ txt.textContent=fmtSel(); btn.classList.remove('empty'); hidden.value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    else { txt.textContent=lang()==='de'?'Datum wählen':'Pick a date'; btn.classList.add('empty'); hidden.value=''; }
  }
  function render(){
    const L=lang()==='de';
    title.textContent=(L?monthsDe:monthsEn)[view.getMonth()]+' '+view.getFullYear();
    renderDow();
    if(selected) txt.textContent=fmtSel(); else txt.textContent=L?'Datum wählen':'Pick a date';
    const first=new Date(view.getFullYear(),view.getMonth(),1);
    let start=(first.getDay()+6)%7; // Monday-first
    const dim=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    let html='';
    for(let i=0;i<start;i++) html+='<button class="cal-day" disabled></button>';
    for(let d=1;d<=dim;d++){
      const date=new Date(view.getFullYear(),view.getMonth(),d);
      const past=date<today;
      const isToday=date.getTime()===today.getTime();
      const isSel=selected&&date.getTime()===selected.getTime();
      html+=`<button class="cal-day${isToday?' today':''}${isSel?' sel':''}" data-d="${d}"${past?' disabled':''}>${d}</button>`;
    }
    daysRow.innerHTML=html;
    daysRow.querySelectorAll('.cal-day:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{
      setSel(new Date(view.getFullYear(),view.getMonth(),parseInt(b.dataset.d,10)));
      render(); close();
    }));
  }
  function open(){ CALS.forEach(c=>{ if(c!==api) c.close(); }); cal.classList.add('open'); render(); }
  function close(){ cal.classList.remove('open'); }
  btn.addEventListener('click',()=> cal.classList.contains('open')?close():open());
  btn.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
  $('calPrev').addEventListener('click',()=>{ view.setMonth(view.getMonth()-1); render(); });
  $('calNext').addEventListener('click',()=>{ view.setMonth(view.getMonth()+1); render(); });
  $('calToday').addEventListener('click',()=>{ view=new Date(today.getFullYear(),today.getMonth(),1); setSel(new Date(today)); render(); close(); });
  $('calClear').addEventListener('click',()=>{ setSel(null); render(); close(); });
  document.addEventListener('click',e=>{ if(!cal.contains(e.target)&&!btn.contains(e.target)) close(); });
  const api={render,close};
  CALS.push(api);
  return api;
}
makeCal(''); makeCal('2');
window.__renderCal=()=>CALS.forEach(c=>c.render()); // re-render on language switch

/* alternative date: revealed on demand */
(function(){
  const t=document.getElementById('altToggle'), w=document.getElementById('altWrap');
  if(!t||!w) return;
  t.addEventListener('click',()=>{ w.hidden=false; t.hidden=true; const b=document.getElementById('dateBtn2'); if(b) b.focus(); });
})();

/* ---- submit: send via Web3Forms (no mail client needed); mailto stays as fallback ---- */
const W3F_KEY = "REPLACE_WITH_WEB3FORMS_ACCESS_KEY"; // kostenlos auf web3forms.com holen (deine E-Mail eintragen)
document.getElementById('send').addEventListener('click',async ()=>{
  const lang=document.documentElement.lang; const g=id=>(document.getElementById(id).value||'').trim(); const L=lang==='de';
  const r=recalc();
  const adds=[]; if(calcState.cake)adds.push(L?'Kuchen':'Cake'); if(calcState.catering)adds.push(L?'Catering':'Catering');

  // --- light validation: name + valid email ---
  const nameEl=document.getElementById('n'), mailEl=document.getElementById('e');
  let ok=true;
  const emailOk=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('e'));
  nameEl.classList.toggle('err', !g('n'));
  mailEl.classList.toggle('err', !emailOk);
  if(!g('n') || !emailOk){
    ok=false;
    const first = !g('n') ? nameEl : mailEl;
    first.focus();
  }
  if(!ok) return;

  const parseD=s=>{ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const fmtD=s=>parseD(s).toLocaleDateString(L?'de-AT':'en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
  const dateStr = g('d') ? fmtD(g('d')) : (L?'offen':'open');
  const altStr = g('d2') ? fmtD(g('d2')) : '';

  const body=[
    (L?'Name: ':'Name: ')+g('n'),
    (L?'Firma/Team: ':'Company/team: ')+(g('o')||'-'),
    (L?'E-Mail: ':'Email: ')+g('e'),
    (L?'Personen: ':'People: ')+calcState.people,
    (L?'Leistung: ':'Service: ')+r.timeLbl+' · '+calcState.people+' '+(L?'Personen':'people'),
    (L?'Zusatz: ':'Add-ons: ')+(adds.length?adds.join(', '):(L?'keine':'none')),
    (L?'ca. Richtpreis: ':'approx. guide price: ')+'ca. '+fmt(r.total)+' € '+(L?'(exkl. USt., unverbindlich)':'(excl. VAT, non-binding)'),
    (L?'Wunschdatum: ':'Preferred date: ')+dateStr+(altStr?('\n'+(L?'Ersatztermin: ':'Alternative date: ')+altStr):''),
    '',
    (L?'Details:':'Details:'), (g('m')||'-')
  ].join('\n');
  const subj=encodeURIComponent('phil space '+(L?'Anfrage':'enquiry')+(g('n')?(' - '+g('n')):''));
  const mailHref='mailto:events@phil.info?subject='+subj+'&body='+encodeURIComponent(body);

  // --- summary + real send via Web3Forms (works without a mail client) ---
  const sent=document.getElementById('sent');
  const summaryHtml=
    '<div class="ssum">'+
      '<b>'+g('n')+'</b>'+(g('o')?' · '+g('o'):'')+'<br>'+
      '<b>'+r.timeLbl+'</b> · <b>'+calcState.people+'</b> '+(L?'Personen':'people')+'<br>'+
      (adds.length?((L?'Zusatz: ':'Add-ons: ')+adds.join(', ')+'<br>'):'')+
      (L?'Wunschdatum: ':'Preferred date: ')+dateStr+(altStr?(' · '+(L?'Ersatztermin: ':'alternative: ')+altStr):'')+'<br>'+
      (L?'ca. Richtpreis: ':'approx. guide price: ')+'<b>ca. '+fmt(r.total)+' €</b> '+(L?'(unverbindlich)':'(non-binding)')+
    '</div>';
  const show=(title,tail)=>{
    sent.innerHTML='<div class="sh"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'+title+'</div>'+summaryHtml+(tail||'');
    sent.classList.add('show'); sent.scrollIntoView({behavior:'smooth', block:'center'});
  };
  const mailTail='<div class="smail">'+(L?'Oder direkt per Mailprogramm: ':'Or use your mail app: ')+'<a href="'+mailHref+'">'+(L?'hier klicken':'click here')+'</a>.</div>';
  const btn=document.getElementById('send'), orig=btn.innerHTML;

  if(W3F_KEY && W3F_KEY.indexOf('REPLACE')===-1){
    btn.disabled=true; btn.textContent=(L?'Wird gesendet…':'Sending…');
    try{
      const res=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({
        access_key:W3F_KEY,
        subject:'phil space '+(L?'Anfrage':'enquiry')+(g('n')?(' – '+g('n')):''),
        from_name:'phil space Website', replyto:g('e'),
        Name:g('n'), 'Firma/Team':g('o')||'-', 'E-Mail':g('e'), Personen:calcState.people,
        Leistung:r.timeLbl, Zusatz:(adds.length?adds.join(', '):(L?'keine':'none')),
        Richtpreis:'ca. '+fmt(r.total)+' € '+(L?'(exkl. USt., unverbindlich)':'(excl. VAT)'),
        Wunschdatum:dateStr, Ersatztermin:altStr||'-', Details:g('m')||'-', message:body
      })});
      const data=await res.json().catch(()=>({}));
      if(data.success){ show((L?'Anfrage gesendet ✓':'Enquiry sent ✓'),'<div class="smail">'+(L?'Danke! Wir melden uns werktags binnen 24 Stunden.':'Thanks! We reply within 24 hours on working days.')+'</div>'); }
      else { show((L?'Senden hat nicht geklappt':'Sending failed'),mailTail); }
    }catch(e){ show((L?'Senden hat nicht geklappt':'Sending failed'),mailTail); }
    finally{ btn.disabled=false; btn.innerHTML=orig; }
  } else {
    show((L?'Anfrage zusammengestellt':'Enquiry ready'),mailTail);
    window.location.href=mailHref;
  }
});

// clear error state as the user types
['n','e'].forEach(id=>{ const el=document.getElementById(id); el && el.addEventListener('input',()=>el.classList.remove('err')); });

/* ---- preselect time slot from ?zeit=am|pm|full|evening|dayeve (links from the home page) ---- */
(function(){ const z=new URLSearchParams(location.search).get('zeit'); if(!z || !PRICING.room[z]) return;
  document.querySelectorAll('#segTime button').forEach(x=>x.classList.toggle('on', x.dataset.time===z)); calcState.time=z; })();
recalc();
