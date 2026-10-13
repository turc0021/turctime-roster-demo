const KEY='turctime-roster-v1';const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,10);
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)}
function seed(){const P=[["Jake Miller",12,"SS","Wake Forest Cougars","Ava Miller"],["Ethan Brooks",14,"P/1B","Triangle Thunder","Mark Brooks"],["Liam Carter",10,"C","Heritage Huskies","Sara Carter"],["Noah Davis",16,"CF","Wake Forest HS JV","Tom Davis"],["Mason Lee",13,"2B","NC Bandits","Grace Lee"],["Owen Reed",11,"3B","Wake Forest Cougars","Kim Reed"],["Carter Hill",15,"P","Triangle Thunder","Dan Hill"],["Ryan Foster",9,"OF","Heritage Huskies","Jen Foster"]];
 const types=["Hitting","Positional","Pitching","Virtual"];const players=[],sessions=[];
 P.forEach(([n,a,pos,t,g],i)=>{const id=uid(),f=n.split(' ')[0].toLowerCase();players.push({id,sample:true,name:n+" (Sample)",age:a,position:pos,team:t,phone:"(919) 555-01"+(10+i),email:f+".sample@example.com",guardianName:g,guardianPhone:"(919) 555-02"+(10+i),guardianEmail:g.split(' ')[0].toLowerCase()+".parent@example.com",notes:"Sample player for demo."});
  for(let k=0;k<2+(i%4);k++)sessions.push({id:uid(),playerId:id,date:daysAgo(k*9+i*2),type:types[(i+k)%4],duration:[45,60,60,90][k%4],notes:"Sample session"})});
 return{players,sessions}}
let db=JSON.parse(localStorage.getItem(KEY)||'null')||seed();const save=()=>localStorage.setItem(KEY,JSON.stringify(db));save();
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pname=id=>(db.players.find(p=>p.id===id)||{name:'(removed)'}).name;
const countFor=id=>db.sessions.filter(s=>s.playerId===id).length;
function renderRoster(){const q=$('#search').value.toLowerCase();$('#playerList').innerHTML=db.players.filter(p=>JSON.stringify(p).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<div class="card"><span class="count" title="Sessions">${countFor(p.id)} sessions</span><h3>${esc(p.name.replace(' (Sample)',''))}${p.sample?'<span class="badge">Sample</span>':''}</h3>
<small>Age ${esc(p.age)} · ${esc(p.position)} · ${esc(p.team)}</small><small>📞 ${esc(p.phone)} · ✉️ ${esc(p.email)}</small><small>Guardian: ${esc(p.guardianName)} · ${esc(p.guardianPhone)} · ${esc(p.guardianEmail)}</small>${p.notes?`<small><em>${esc(p.notes)}</em></small>`:''}
<div class="actions"><button onclick="editPlayer('${p.id}')">Edit</button><button onclick="quickLog('${p.id}')">Log session</button><button class="danger" onclick="removePlayer('${p.id}')">Remove</button></div></div>`).join('')||'<p>No players.</p>'}
function renderSessions(){$('#sessionForm [name=playerId]').innerHTML=db.players.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
 $('#sessionTable tbody').innerHTML=db.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(s=>`<tr><td>${s.date}</td><td>${esc(pname(s.playerId))}</td><td>${esc(s.type)}</td><td>${s.duration}</td><td>${esc(s.notes)}</td><td><button class="danger" onclick="delSession('${s.id}')">✕</button></td></tr>`).join('')}
function reportRows(){const f=$('#rFrom').value,t=$('#rTo').value;const ss=db.sessions.filter(s=>(!f||s.date>=f)&&(!t||s.date<=t));
 return db.players.map(p=>{const m=ss.filter(s=>s.playerId===p.id),by=x=>m.filter(s=>s.type===x).length;return{Player:p.name,Team:p.team,Sessions:m.length,Minutes:m.reduce((a,s)=>a+ +s.duration,0),Hitting:by('Hitting'),Positional:by('Positional'),Pitching:by('Pitching'),Virtual:by('Virtual'),Other:m.length-by('Hitting')-by('Positional')-by('Pitching')-by('Virtual'),Last:m.map(s=>s.date).sort().pop()||''}}).sort((a,b)=>b.Sessions-a.Sessions)}
function renderReports(){const r=reportRows(),f=$('#rFrom').value,t=$('#rTo').value;$('#reportTitle').textContent='Sessions per Player'+(f||t?` (${f||'start'} → ${t||'today'})`:' (all time)');
 $('#reportTable tbody').innerHTML=r.map(o=>'<tr>'+Object.values(o).map(v=>`<td>${esc(v)}</td>`).join('')+'</tr>').join('');
 const tot=k=>r.reduce((a,o)=>a+o[k],0);$('#reportTable tfoot').innerHTML=`<tr><td>Total</td><td></td>${['Sessions','Minutes','Hitting','Positional','Pitching','Virtual','Other'].map(k=>`<td>${tot(k)}</td>`).join('')}<td></td></tr>`}
function toCSV(rows){if(!rows.length)return'';const h=Object.keys(rows[0]);const q=v=>`"${String(v).replace(/"/g,'""')}"`;return[h.map(q).join(','),...rows.map(o=>h.map(k=>q(o[k])).join(','))].join('\n')}
function renderAll(){renderRoster();renderSessions();renderReports()}
function editPlayer(id){const p=db.players.find(x=>x.id===id)||{};const f=$('#playerForm');f.reset();for(const el of f.elements)if(el.name)el.value=p[el.name]??'';$('#pdTitle').textContent=id?'Edit Player':'Add Player';$('#playerDialog').showModal()}
function removePlayer(id){if(!confirm('Remove '+pname(id)+' and their sessions?'))return;db.players=db.players.filter(p=>p.id!==id);db.sessions=db.sessions.filter(s=>s.playerId!==id);save();renderAll()}
function delSession(id){db.sessions=db.sessions.filter(s=>s.id!==id);save();renderAll()}
function quickLog(id){show('sessions');$('#sessionForm [name=playerId]').value=id}
function show(t){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('active',s.id===t));if(t==='reports')renderReports()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.tab));
$('#search').oninput=renderRoster;$('#addPlayer').onclick=()=>editPlayer('');$('#pdCancel').onclick=()=>$('#playerDialog').close();
$('#playerForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(d.id){const p=db.players.find(x=>x.id===d.id);Object.assign(p,d)}else db.players.push({...d,id:uid()});save();$('#playerDialog').close();renderAll()};
$('#sessionForm [name=date]').value=new Date().toISOString().slice(0,10);
$('#sessionForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));db.sessions.push({...d,duration:+d.duration,id:uid()});save();e.target.notes.value='';renderAll()};
$('#rFrom').onchange=$('#rTo').onchange=renderReports;$('#printBtn').onclick=()=>{show('reports');print()};
$('#exportCsv').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([toCSV(reportRows())],{type:'text/csv'}));a.download='turctime-sessions-report.csv';a.click()};
$('#resetDemo').onclick=()=>{if(confirm('Reset all data to the sample demo?')){db=seed();save();renderAll()}};
renderAll();
