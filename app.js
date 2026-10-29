const C='Charts',R='Reading',K='Classes',PR='Class prep',F='Reflection and prayer',M='Meals and breaks';
// [start, end, label, group]; hours past 24 run into the next night
const P={
mon:[['06:30','08:00','Charts',C],['09:30','10:00','Prepare for class',PR],['11:00','13:00','First class',K],['13:00','14:00','Break: read the word of God',F],['14:00','16:00','Second class',K],['16:00','18:00','Third class (free for now): read',R],['18:30','19:00','Personal reflection',F],['19:00','20:00','Prepare dinner',M],['21:30','25:00','Read',R],['25:00','26:00','Charts for the morning',C]],
tue:[['06:30','07:00','Prepare for class',PR],['07:00','08:00','Charts: trade opportunities',C],['09:00','11:00','Free class slot: read',R],['11:00','12:00','Second class',K],['12:00','14:00','Break: reading and the word of God',F],['14:00','16:00','Last class',K],['16:30','17:00','Reflection on the word',F],['17:30','18:30','Eat and prepare dinner',M],['21:30','24:00','Read',R],['24:00','25:00','Charts',C]],
wed:[['06:30','09:30','Charts, phone, breakfast',C],['09:30','13:30','Reading',R],['13:30','14:30','Bible study and prayer',F],['15:00','18:00','Continue reading',R],['18:00','21:00','Dinner and break',M],['21:00','24:00','Reading',R],['24:00','25:00','Study (if no charts)',R]],
thu:[['06:30','07:00','Prepare for class',PR],['07:00','08:00','Charts',C],['09:00','13:00','Class',K],['13:30','15:30','Get home, prepare food, eat',M],['15:30','17:30','Read',R],['17:30','18:30','Evening reflection',F],['18:00','19:00','Prepare dinner',M],['20:00','25:00','Reading',R],['25:00','26:00','Study the charts',C]],
fri:[['06:30','08:30','Charts, breakfast',C],['08:30','11:30','Reading',R],['11:30','14:30','Bible study and prayer',F],['14:30','18:30','Continue reading',R],['18:30','20:00','Dinner and break',M],['21:00','24:00','Reading',R]],
sat:[['07:00','12:00','Reading, prepare breakfast',R],['12:00','13:30','Break',M],['13:30','14:30','Bible study and prayer',F],['15:00','18:00','Reading',R],['18:00','18:30','Dinner, break, personal reflection',F],['19:30','23:30','Reading',R]],
sun:[['06:30','09:00','Prepare for church',PR],['09:00','12:00','Church, or study of the word',F],['13:00','17:00','Reading',R],['17:00','20:00','Dinner, break, study the charts',C],['22:00','24:00','Reading',R]]
};
const DAYS=[['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];
const GROUPS=[C,R,K,PR,F,M,'Wake and quiet time'];
const GC={'Charts':'#4F6FB5','Reading':'#7A67B0','Classes':'#C47A3D','Class prep':'#B59A3A','Reflection and prayer':'#B0658A','Meals and breaks':'#4E9A8E','Wake and quiet time':'#6C8DA3'};
const m=s=>{const[a,b]=s.split(':');return +a*60+ +b};
const fmt=x=>{x%=1440;const h=Math.floor(x/60),mi=x%60;return((h%12)||12)+(mi?':'+String(mi).padStart(2,'0'):'')+(h<12?'am':'pm')};
const hhmm=x=>{x%=1440;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const dur=x=>{const h=Math.floor(x/60),mi=x%60;return h?h+'h '+mi+'m':mi+'m'};
const $=s=>document.querySelector(s);

// ---- plan (editable, saved in this browser) ----
const defPlan=()=>{const o={};DAYS.forEach(d=>{o[d[0]]=[['05:30','06:00','Wake up','Wake and quiet time'],['06:00','06:30','Quiet time','Wake and quiet time'],...P[d[0]]].map((b,i)=>({id:d[0]+'-'+i,s:m(b[0]),e:m(b[1]),l:b[2],g:b[3]}))});return o};
let plan=null;try{plan=JSON.parse(localStorage.getItem('week-tracker-plan'))}catch(e){}
if(!plan||!plan.mon)plan=defPlan();
const savePlan=()=>{try{localStorage.setItem('week-tracker-plan',JSON.stringify(plan))}catch(e){}};
const blocks=k=>plan[k];

// ---- week data ----
const now0=new Date();
const monOf=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7));
const wkKey=md=>'week-tracker:'+md.getFullYear()+'-'+(md.getMonth()+1)+'-'+md.getDate();
const mon=monOf(now0),KEY=wkKey(mon);
const dateOf=i=>new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i);
const todayIdx=(now0.getDay()+6)%7;
let st={t:{},s:{},n:{}};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.t)st=r}catch(e){}
st.c=st.c||{};st.mn=st.mn||{};
const total=()=>Object.values(plan).reduce((a,b)=>a+b.length,0);
const save=()=>{st.tot=total();st.plan=plan;try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const TH=['auto','light','dark'];let th='auto';try{th=localStorage.getItem('wt-theme')||'auto'}catch(e){}
const applyTh=()=>{if(th==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=th};applyTh();
let sel=todayIdx,view='day',edit=false;
const isMissed=(b,i)=>!st.t[b.id]&&!st.c[b.id]&&dateOf(i).getTime()+b.e*60000<Date.now();


// ---- storage helpers, backup, focus, courses ----
const lsGet=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const SEED=[['ELE 401','Electric Power Principles'],['ELE 403','Servomechanism and Control Theory'],['ELE 405','Communication Principles'],['ELE 407','Measurements and Instrumentation'],['ELE 409','Power Electronics'],['ABE 443','Statistics for Engineers'],['ELE 491','Instrumentation & Control Laboratory'],['ELE 493','Communications Laboratory'],['ABE 413','Engineering Communication']];
let courses=lsGet('wt-courses',null);if(!courses)courses=SEED.map((c,i)=>({id:'c'+i,code:c[0],name:c[1],exam:'',topics:[]}));
let sessions=lsGet('wt-sessions',[]),fs=lsGet('wt-focus',null),open=null,ocn=-1,fm=25;
const ST=['Not started','Learning','Revised','Confident'],SL={done:'Done',partial:'Partial',skipped:'Skipped'};
const WK=/^week-tracker:\d{4}-\d+-\d+$/;
const allWeeks=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(WK.test(k))o[k]=JSON.parse(localStorage.getItem(k))}}catch(e){}o[KEY]=st;return o};
const makeBackup=()=>({app:'week-tracker',version:2,created:new Date().toISOString(),weeks:allWeeks(),plan,courses,sessions,theme:th});
const saveRecovery=()=>lsSet('wt-recovery',makeBackup());
function checkBackup(d){
  let w;
  if(d&&d.app==='week-tracker'&&d.weeks&&typeof d.weeks==='object')w=d.weeks;
  else if(d&&d.week&&d.week.t)w={[KEY]:d.week};
  else throw 0;
  if(!d.plan||!Array.isArray(d.plan.mon))throw 0;
  for(const k in w)if(!WK.test(k)||!w[k]||typeof w[k].t!=='object')throw 0;
  return w;
}
function applyBackup(d){
  const w=checkBackup(d);Object.keys(w).forEach(k=>lsSet(k,w[k]));
  lsSet('week-tracker-plan',d.plan);if(d.courses)lsSet('wt-courses',d.courses);if(d.sessions)lsSet('wt-sessions',d.sessions);
  if(d.theme)try{localStorage.setItem('wt-theme',d.theme)}catch(e){}
  location.reload();
}
const overlapMsg=k=>{const bl=plan[k],o=[];for(let i=0;i<bl.length;i++)for(let j=i+1;j<bl.length;j++)if(bl[i].s<bl[j].e&&bl[j].s<bl[i].e)o.push(bl[i].l+' and '+bl[j].l);return o.length?'Overlap: '+o.slice(0,3).join('; ')+(o.length>3?' and more':'')+'. Your plan is saved, but you may want to adjust it.':''};
const fLeft=()=>fs?(fs.endAt?fs.endAt-Date.now():fs.left):0;
const fClock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function logSession(done){
  if(!fs)return;const el=Math.round((fs.dur-Math.max(0,fLeft()))/60000);
  if(el>0){sessions.push({d:new Date().toISOString(),min:el,topic:fs.topic,done:!!done});sessions=sessions.slice(-300);lsSet('wt-sessions',sessions)}
  fs=null;lsSet('wt-focus',null);
}

// ---- streaks and history ----
const cache={};
const loadWk=md=>{const k=wkKey(md);if(k===KEY)return st;if(!cache[k]){let r=null;try{r=JSON.parse(localStorage.getItem(k))}catch(e){}cache[k]=r&&r.t?r:{t:{}}}return cache[k]};
function dayStats(d){const i=(d.getDay()+6)%7,k=DAYS[i][0],w=loadWk(monOf(d)),bl=(w.plan||plan)[k]||[];return{done:bl.filter(b=>w.t[b.id]).length,tot:bl.length,wake:!!w.t[k+'-0']}}
function streak(ok){let n=0;for(let i=0;i<400;i++){const d=new Date(now0.getFullYear(),now0.getMonth(),now0.getDate()-i);if(ok(dayStats(d)))n++;else if(i>0)break}return n}

// ---- views ----
function nextCard(bl){
  const n=new Date(),nm=n.getHours()*60+n.getMinutes();
  const cur=bl.find(b=>nm>=b.s&&nm<b.e);
  const nxt=bl.filter(b=>b.s>nm).sort((a,b)=>a.s-b.s)[0];
  let h='<section class="next" aria-live="polite">';
  if(cur)h+=`<p class="a">Now</p><p class="big">${esc(cur.l)}</p><p class="a">${dur(cur.e-nm)} left, until ${fmt(cur.e)}</p>`;
  if(nxt)h+=`<div class="${cur?'gap':''}"><p class="a">Next, in ${dur(nxt.s-nm)}</p><p class="${cur?'mid':'big'}">${esc(nxt.l)} at ${fmt(nxt.s)}</p></div>`;
  if(!cur&&!nxt)h+='<p class="big">Done for today</p><p class="a">Rest well and be ready for 5:30.</p>';
  return h+'</section>';
}

function dayView(){
  const k=DAYS[sel][0],bl=blocks(k),comp=bl.filter(b=>st.c[b.id]==='done').length,ont=bl.filter(b=>st.t[b.id]).length;
  const nowMin=new Date().getHours()*60+new Date().getMinutes(),future=sel>todayIdx,pct=bl.length?Math.round(comp/bl.length*100):0;
  const picks=bl.filter(b=>st.s[b.id]).map(b=>esc(b.l));
  let h=`<div class="days" role="group" aria-label="Choose a day">${DAYS.map((d,i)=>`<button data-d="${i}" aria-pressed="${i===sel}">${d[1].slice(0,3)}<small>${dateOf(i).getDate()}</small></button>`).join('')}</div>`;
  if(sel===todayIdx&&!edit)h+=nextCard(bl);
  if(!edit)h+=`<section class="sum" aria-live="polite"><div style="flex:1"><div class="sumt"><span><b>${comp}</b> of ${bl.length} completed</span><span class="pc">${pct}%</span></div><div class="bar" role="progressbar" aria-label="Completion for the day" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><p class="top3">${ont} started on time. ${picks.length?'Top 3: '+picks.join(', '):'Tap ☆ to pick your top 3 blocks.'}</p></div></section>`;
  else h+=`<p class="warn" id="ov" role="status">${overlapMsg(k)}</p>`;
  h+='<ul>';
  bl.forEach(b=>{
    if(edit){h+=`<li style="--g:${GC[b.g]||'#64748B'}" class="blk ed" data-id="${b.id}"><div class="f"><input class="e-l" aria-label="Block name" value="${esc(b.l)}"><select class="e-g" aria-label="Type of block">${GROUPS.map(g=>`<option${g===b.g?' selected':''}>${g}</option>`).join('')}</select><span class="tm"><input class="e-s" type="time" aria-label="Start time" value="${hhmm(b.s)}"> to <input class="e-e" type="time" aria-label="End time" value="${hhmm(b.e)}"></span></div><button class="del" data-x="${b.id}" aria-label="Delete ${esc(b.l)}">✕</button></li>`;return}
    const d=!!st.t[b.id],c=st.c[b.id],mn=st.mn[b.id],act=sel===todayIdx&&nowMin>=b.s&&nowMin<b.e,ms=isMissed(b,sel),s=!!st.s[b.id];
    h+=`<li style="--g:${GC[b.g]||'#64748B'}" class="blk${c==='done'?' done':''}${act?' now':''}${ms?' miss':''}"><button class="chk" data-t="${b.id}" aria-pressed="${d}" aria-label="Started on time: ${esc(b.l)}"${future?' disabled':''}>${d?'✓':''}</button><button class="info" data-o="${b.id}" aria-expanded="${open===b.id}"><span class="time">${fmt(b.s)} to ${fmt(b.e)}${c?' · '+SL[c]+(mn?' ('+mn+' min)':''):''}</span><span class="lbl">${esc(b.l)}</span>${act?'<span class="tag">Now</span>':''}</button><button class="star" data-s="${b.id}" aria-pressed="${s}" aria-label="Top 3: ${esc(b.l)}">${s?'★':'☆'}</button></li>`;
    if(open===b.id)h+=`<li class="det"><span>Outcome</span><div class="chips">${['done','partial','skipped'].map(x=>`<button data-c="${b.id}|${x}" aria-pressed="${c===x}">${SL[x]}</button>`).join('')}</div><label>Minutes spent <input class="n" type="number" inputmode="numeric" min="0" max="600" id="mn" data-id="${b.id}" value="${mn||''}"></label></li>`;
  });
  h+='</ul>';
  if(edit)h+=`<button class="lnk full" id="add">Add a block to ${DAYS[sel][1]}</button>`;
  else h+=`<label class="sl">Hours slept last night<input class="n" id="sl" type="number" inputmode="decimal" min="0" max="14" step="0.5" aria-label="Hours slept last night"></label><h2>What pulled me off track?</h2><textarea id="note" aria-label="What pulled me off track today" placeholder="Leave it blank on a good day."></textarea>`;
  h+=`<div class="acts"><button id="edt">${edit?'Done editing':'Edit this day’s plan'}</button></div>`;
  $('#app').innerHTML=h;if(!edit){$('#note').value=st.n[k]||'';$('#sl').value=(st.z||{})[k]||''}
}
function sleepAvg(){const v=Object.values(st.z||{}).map(Number).filter(x=>x>=0);return v.length?`<p class="ok">Average sleep, logged nights only: <b>${(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1)} hours</b> over ${v.length} night${v.length===1?'':'s'}.</p>`:''}
function focusWeek(){const t=sessions.filter(s=>new Date(s.d)>=mon).reduce((a,s)=>a+s.min,0);return t?`<p class="ok">Focus time this week: <b>${Math.floor(t/60)}h ${t%60}m</b>.</p>`:''}
function weekView(){
  let h='<h2 style="margin-top:0">This week</h2>';
  const miss={};let el=0,cd=0,ot=0;
  DAYS.forEach((d,i)=>{
    const bl=blocks(d[0]),n=bl.filter(b=>st.c[b.id]==='done').length,pct=bl.length?Math.round(n/bl.length*100):0;
    bl.forEach(b=>{if(dateOf(i).getTime()+b.e*60000<Date.now()){el++;if(st.c[b.id]==='done')cd++;if(st.t[b.id])ot++}if(isMissed(b,i))miss[b.g]=(miss[b.g]||0)+1});
    h+=`<div class="row${i===todayIdx?' today':''}"><span>${d[1]}</span><div class="bar" role="progressbar" aria-label="${d[1]} completion" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span>${n}/${bl.length}</span></div>`;
  });
  const r=n=>el?Math.round(n/el*100)+'%':'n/a';
  h+=`<p class="ok">Completed: <b>${r(cd)}</b>. Started on time: <b>${r(ot)}</b>.<br><small>Both rates are out of the ${el} planned block${el===1?'':'s'} whose time has already passed this week. The bars show completed blocks out of all planned blocks.</small></p>${sleepAvg()}${focusWeek()}<h2>Needs attention</h2>`;
  const fl=Object.entries(miss).filter(e=>e[1]>=3).sort((a,b)=>b[1]-a[1]);
  h+=fl.length?fl.map(e=>`<div class="flag"><b>${e[0]}</b>: missed ${e[1]} times. Move it or shorten it.</div>`).join(''):'<p class="ok">No block type has been missed 3 times yet.</p>';
  const rest=Object.entries(miss).filter(e=>e[1]<3);
  if(rest.length)h+=`<p class="ok">Also missed: ${rest.map(e=>e[0]+' ('+e[1]+')').join(', ')}.</p>`;
  $('#app').innerHTML=h;
}
function focusView(){
  let h='';
  if(!fs){
    h+=`<section class="sum"><div class="fl"><b>Start a focus session</b><div class="chips" role="group" aria-label="Length">${[25,50].map(p=>`<button data-p="${p}" aria-pressed="${fm===p}">${p} min</button>`).join('')}<label>Custom <input class="n" id="cus" type="number" min="1" max="240" value="${fm}" style="width:70px"> min</label></div><select class="sel" id="ftp" aria-label="What are you working on"><option>General</option>${courses.map(c=>`<option>${c.code} ${esc(c.name)}</option>`).join('')}</select><button class="lnk" id="fgo">Start focus</button></div></section>`;
  }else{
    h+=`<section class="sum"><div class="fl"><p class="ok" style="margin:0;text-align:center">${esc(fs.topic)}${fs.endAt?'':' (paused)'}</p><p class="clock" id="clock" role="timer">${fClock(fLeft())}</p><div class="acts" style="margin:0"><button id="fpa">${fs.endAt?'Pause':'Resume'}</button><button id="fend">End early</button></div></div></section>`;
  }
  h+=`${focusWeek()}<h2>Recent sessions</h2>`;
  const rc=sessions.slice(-6).reverse();
  h+=rc.length?rc.map(s=>`<div class="flag" style="border-left-color:${s.done?'var(--ok)':'var(--mut)'}"><b>${s.min} min</b> · ${esc(s.topic)}<br><small class="ok">${new Date(s.d).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${s.done?'Completed':'Ended early'}</small></div>`).join(''):'<p class="ok">No sessions yet. An interrupted session is logged as ended early, never as complete.</p>';
  $('#app').innerHTML=h;
}
function coursesView(){
  let h='<p class="ok" style="margin-top:0">Tap a course to open it. Tap a topic to change its status.</p>';
  courses.forEach((c,ci)=>{
    const rv=c.topics.filter(t=>t.s>=2).length;let ex='';
    if(c.exam){const dd=Math.ceil((new Date(c.exam+'T00:00')-new Date())/864e5);ex=dd>=0?'Exam in '+dd+' day'+(dd===1?'':'s'):'Exam date passed'}
    h+=`<section class="sum cc"><button class="info" data-oc="${ci}" aria-expanded="${ocn===ci}"><b>${c.code}</b> ${esc(c.name)}<span class="time">${c.topics.length?rv+' of '+c.topics.length+' topics revised':'No topics yet'}${ex?' · '+ex:''}</span></button>`;
    if(ocn===ci)h+=`<div class="cd">${c.topics.map((t,ti)=>`<button class="tp" data-tp="${ci}|${ti}">${esc(t.n)}<span>${ST[t.s]}</span></button>`).join('')}<div class="acts"><input class="n" id="nt" placeholder="New topic" aria-label="New topic"><button data-at="${ci}">Add</button></div><label class="sl">Exam date<input class="n" type="date" id="ex" data-ci="${ci}" value="${c.exam}" style="width:auto"></label></div>`;
    h+='</section>';
  });
  $('#app').innerHTML=h;
}
function moreView(){
  const rec=lsGet('wt-recovery',null);
  $('#app').innerHTML=`<div class="acts" style="margin-top:0"><button id="gHist">History and streaks</button><button id="gCou">Courses and revision</button></div><h2>Settings</h2><div class="acts"><button id="exp">Export full backup</button><button id="imp">Import backup</button></div><div class="acts"><button id="thm">Theme: ${th}</button><button id="rpl">Restore original plan</button></div>${rec?'<div class="acts"><button id="rec">Restore recovery copy</button></div>':''}<div class="acts"><button id="rst">Reset this week</button></div><p class="ok"><small>A backup includes every week, your plan, courses, focus sessions and settings. Before anything is replaced or reset, a recovery copy of your current data is kept. Your data lives only in this browser, so clearing browser data or changing phone loses it unless you export a backup.</small></p><input type="file" id="impf" accept="application/json,.json" hidden>`;
}
function histView(){
  const wk=streak(s=>s.wake),gd=streak(s=>s.tot&&s.done/s.tot>=.7);
  const pl=n=>n+(n===1?' day':' days');
  let h=`<div class="two"><section class="sum"><b>${pl(wk)}</b><p class="ok">in a row waking up on time</p></section><section class="sum"><b>${pl(gd)}</b><p class="ok">in a row with 70% or more started on time</p></section></div><h2>Past weeks</h2>`;
  const ks=[];
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^week-tracker:\d{4}-\d+-\d+$/.test(k))ks.push(k)}}catch(e){}
  if(!ks.includes(KEY))ks.push(KEY);
  const dt=k=>{const p=k.split(':')[1].split('-');return new Date(+p[0],+p[1]-1,+p[2])};
  ks.sort((a,b)=>dt(b)-dt(a)).slice(0,10).forEach(k=>{
    let r=st;if(k!==KEY){try{r=JSON.parse(localStorage.getItem(k))||{t:{}}}catch(e){r={t:{}}}}
    const n=Object.values(r.t||{}).filter(Boolean).length,tt=r.tot||total(),pct=Math.min(100,Math.round(n/tt*100));
    h+=`<div class="row h${k===KEY?' today':''}"><span>${dt(k).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</span><div class="bar" role="progressbar" aria-label="Week of ${dt(k).toDateString()}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>`;
  });
  $('#app').innerHTML=h+'<p class="ok">Each row is the share of that week’s blocks you started on time.</p>';
}

function render(){
  const fd=d=>d.toLocaleDateString(undefined,{day:'numeric',month:'short'});
  const T={day:DAYS[sel][1],week:'Week view',focus:'Focus',more:'More',hist:'History',courses:'Courses'};
  const S={day:dateOf(sel).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}),week:fd(dateOf(0))+' to '+fd(dateOf(6)),focus:'Timed work sessions',more:'Tools and settings',hist:'Streaks and past weeks',courses:'Topics, revision and exams'};
  $('#title').textContent=T[view];$('#date').textContent=S[view];
  const nav=view==='hist'||view==='courses'?'more':view;
  [['vDay','day'],['vWeek','week'],['vFocus','focus'],['vMore','more']].forEach(v=>$('#'+v[0]).setAttribute('aria-
