const L=document.querySelector('#leads'),E=document.querySelector('#error');
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CHANNELS=['email','call','linkedin','whatsapp','meeting','other'];
function add(){const d=document.createElement('div');d.className='lead';d.innerHTML=`<button class="rm" type="button">Remove</button>
<div class="grid2"><label>Lead name<input class="lname" placeholder="e.g. Sarah Al Mansoori"></label><label>Company<input class="lco" placeholder="e.g. Gulf Retail Group"></label></div>
<div class="grid2"><label>Role<input class="lrole" placeholder="e.g. Head of Digital"></label><label>Deal context<input class="lctx" placeholder="e.g. D365 evaluation, 40 users"></label></div>
<label>Interaction history - one per line: date | channel | what happened</label><textarea class="lint" rows="6" placeholder="2026-09-21 | email | Asked for pricing tiers and implementation timeline&#10;2026-09-18 | call | 30-min discovery, shared current CRM pain points&#10;2026-09-12 | linkedin | Viewed our D365 case study twice, liked the post"></textarea>`;
d.querySelector('.rm').onclick=()=>{if(document.querySelectorAll('.lead').length>1)d.remove()};L.appendChild(d)}
add();document.querySelector('#add').onclick=add;
function parseInts(t){return String(t||'').split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.split('|').map(s=>s.trim());if(p.length<3)return null;const[channelRaw,...noteParts]=p.slice(1);const channel=CHANNELS.includes(channelRaw.toLowerCase())?channelRaw.toLowerCase():'other';const note=noteParts.join(' | ');return{date:p[0],channel,note}}).filter(Boolean)}
function gather(){return[...document.querySelectorAll('.lead')].map(d=>({name:d.querySelector('.lname').value.trim(),company:d.querySelector('.lco').value.trim(),role:d.querySelector('.lrole').value.trim(),context:d.querySelector('.lctx').value.trim(),interactions:parseInts(d.querySelector('.lint').value)})).filter(l=>l.name||l.interactions.length)}
document.querySelector('#run').onclick=async()=>{E.textContent='';const leads=gather();const btn=document.querySelector('#run');btn.disabled=true;btn.querySelector('span').textContent='Jev is reading behaviour patterns…';
try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leads})});const x=await r.json().catch(()=>null);if(!x)throw Error('Analysis service returned an unreadable response. Try again.');if(!r.ok)throw Error((x.error||'Analysis failed.')+(x.detail?` ${x.detail}`:''));
render(leads.map((l,i)=>({...l,...x.results[i]})),x.meta)}catch(e){E.textContent=e.message}finally{btn.disabled=false;btn.querySelector('span').textContent='Run live Jev pattern analysis'}};
const dots=l=>`<span class="dots">${[0,1,2,3].map(i=>`<span class="dot ${i<=l?'on':''}"></span>`).join('')}</span>`;
const LBL=['none','early','active','clear'];
const velClass=v=>({accelerating:'c-acc',steady:'c-steady',stalling:'c-stall','gone-cold':'c-cold'})[v]||'c-steady';
const pretty=s=>String(s||'').replaceAll('-',' ');
function timeline(lead){const ints=[...lead.interactions].sort((a,b)=>{const da=new Date(a.date),db=new Date(b.date);if(isNaN(da)||isNaN(db))return 0;return da-db});const mix={};ints.forEach(i=>mix[i.channel]=(mix[i.channel]||0)+1);
const rows=ints.map(i=>{const d=new Date(i.date);const ds=isNaN(d)?esc(i.date):d.toLocaleDateString(undefined,{month:'short',day:'numeric'});return`<div class="tl"><span class="ch ch-${esc(i.channel)}">${esc(i.channel.toUpperCase())}</span>${esc(i.note)}<time>${ds}</time></div>`}).join('');
return`<div class="timeline">${rows}</div><p style="margin-top:8px">${Object.entries(mix).map(([c,n])=>`<span class="pill">${n}x ${esc(c)}</span>`).join('')}</p>`}
function render(leads,meta){document.querySelector('#results').hidden=false;
document.querySelector('#facts').innerHTML=`${esc(meta.model||'Jev')} · ${meta.latencyMs||0}ms<br>${meta.inputTokens||'—'} input tokens`;
document.querySelector('#cards').innerHTML=leads.map(l=>`<article class="lcard"><h3>${esc(l.name)} <span class="chip ${velClass(l.velocity.trend)}">${esc(pretty(l.velocity.trend)).toUpperCase()}</span></h3>
<p class="sub">${[l.company,l.role,l.context].filter(Boolean).map(esc).join(' · ')||'No company context supplied'} · ${l.interactions.length} interactions · ${l.confidence}% Jev confidence</p>
<div class="grid4"><div class="metric"><b>${LBL[l.intent.level]||'—'}</b><small>buying intent</small>${dots(l.intent.level)}</div><div class="metric"><b>${LBL[l.trust.level]||'—'}</b><small>relationship trust</small>${dots(l.trust.level)}</div><div class="metric"><b>${Math.round(((l.velocity.probabilities||{})[l.velocity.trend]||0)*100)}%</b><small>velocity confidence</small></div><div class="metric"><b>${l.interactions.length}</b><small>cross-channel touches</small></div></div>
<div class="pattern"><b>Pattern: ${esc(pretty(l.pattern.signal))}</b><small>explainable signal - Jev probability ${Math.round(((l.pattern.probabilities||{})[l.pattern.signal]||0)*100)}%; runner-up ${esc(pretty(Object.entries(l.pattern.probabilities||{}).sort((a,b)=>b[1]-a[1])[1]?.[0]||'none'))}</small></div>
<div class="nextmove"><b>Next move: ${esc(pretty(l.nextMove.move))}</b><small>Jev recommendation at ${Math.round(((l.nextMove.probabilities||{})[l.nextMove.move]||0)*100)}% probability - review against your own read before acting</small></div>
${timeline(l)}</article>`).join('');
document.querySelector('#results').scrollIntoView({behavior:'smooth'})}
