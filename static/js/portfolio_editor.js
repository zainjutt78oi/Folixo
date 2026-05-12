/* FOLIXO portfolio_editor.js */
let projects=[];
let docId=document.getElementById('docId')?.value||'';
const tmplId=document.getElementById('templateId')?.value;
let portAccent='#0ea5e9', portLayout='grid', portFont='Inter', portBg='dark';

// Tabs
document.querySelectorAll('.etab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.etab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.epanel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(`tab-${t.dataset.tab}`)?.classList.add('active');
  });
});

// Color
document.querySelectorAll('#portColors .csw').forEach(sw=>{
  sw.addEventListener('click',()=>{
    document.querySelectorAll('#portColors .csw').forEach(x=>x.classList.remove('active'));
    sw.classList.add('active'); portAccent=sw.dataset.color; schedulePreview();
  });
});

// Layout
document.querySelectorAll('#layoutGrid .opt-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#layoutGrid .opt-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); portLayout=b.dataset.layout; schedulePreview();
  });
});

// Font
document.querySelectorAll('#portFontGrid .opt-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#portFontGrid .opt-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); portFont=b.dataset.font;
    document.getElementById('portPreview').style.fontFamily=`'${portFont}',sans-serif`;
  });
});

// Background
document.querySelectorAll('#bgGrid .opt-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#bgGrid .opt-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); portBg=b.dataset.bg; schedulePreview();
  });
});

let pt;
const schedulePreview=()=>{clearTimeout(pt);pt=setTimeout(renderPortPreview,160);};
document.querySelectorAll('.ef').forEach(el=>el.addEventListener('input',schedulePreview));
const v=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};

function getData(){
  return {
    name:v('p-name'),headline:v('p-headline'),bio:v('p-bio'),
    email:v('p-email'),location:v('p-location'),
    github:v('p-github'),linkedin:v('p-linkedin'),
    skills:v('p-skills'),tools:v('p-tools'),
    projects,
  };
}

function renderPortPreview(){
  const d=getData();
  const el=document.getElementById('portPreview');
  if(!el)return;

  const bgMap={
    dark:'#0f0f1a',light:'#f8fafc',
    gradient:`linear-gradient(135deg,${portAccent}22,#0f0f1a)`,
    glass:'rgba(255,255,255,0.05)'
  };
  const txtColor=portBg==='light'?'#1a1a2e':'#e8e8f0';
  const subColor=portBg==='light'?'#4b4569':'#a0a0c0';
  const cardBg=portBg==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.08)';
  const cardBorder=portBg==='light'?'rgba(0,0,0,0.1)':'rgba(255,255,255,0.12)';

  const doc=document.getElementById('portPrevDoc');
  if(portBg==='gradient'){doc.style.background=`linear-gradient(135deg,${portAccent}22,#0f0f1a)`;}
  else doc.style.background=bgMap[portBg]||'#0f0f1a';

  el.style.fontFamily=`'${portFont}',sans-serif`;
  el.style.color=txtColor;

  const initials=(d.name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();

  const projCols=portLayout==='list'?'1fr':portLayout==='masonry'?'repeat(auto-fill,minmax(180px,1fr))':'repeat(auto-fill,minmax(200px,1fr))';

  const projectsHTML=projects.map((p,i)=>`
    <div style="background:${cardBg};border-radius:14px;padding:18px;border:1px solid ${cardBorder};animation:fadeIn .4s ease ${i*60}ms both;">
      <div style="font-size:15px;font-weight:700;margin-bottom:5px;color:${txtColor};">${p.name||'Project '+(i+1)}</div>
      ${p.tech?`<div style="font-size:11px;color:${portAccent};font-weight:600;margin-bottom:8px;">${p.tech}</div>`:''}
      ${p.desc?`<div style="font-size:12px;opacity:.8;line-height:1.6;">${p.desc}</div>`:''}
      ${p.link?`<a href="${p.link}" target="_blank" style="font-size:12px;color:${portAccent};display:block;margin-top:8px;">🔗 View Project</a>`:''}
    </div>
  `).join('');

  const skillTags=(d.skills||'').split(',').filter(s=>s.trim()).map(s=>`
    <span style="background:${portAccent}22;color:${portAccent};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid ${portAccent}44;">${s.trim()}</span>
  `).join('');

  el.innerHTML=`
    <style>@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}</style>

    <!-- Header -->
    <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:28px;animation:fadeIn .5s ease both;">
      <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,${portAccent},${portAccent}88);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;flex-shrink:0;">${initials}</div>
      <div>
        <h1 style="font-size:26px;font-weight:800;margin:0 0 4px;color:${txtColor};">${d.name||'Your Name'}</h1>
        <p style="font-size:14px;color:${portAccent};font-weight:600;margin:0 0 10px;">${d.headline||'Your Headline'}</p>
        ${d.bio?`<p style="font-size:13px;opacity:.8;line-height:1.6;max-width:480px;margin:0 0 12px;">${d.bio}</p>`:''}
        <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;opacity:.7;">
          ${d.email?`<span>✉ ${d.email}</span>`:''}
          ${d.location?`<span>📍 ${d.location}</span>`:''}
          ${d.github?`<span>💻 ${d.github}</span>`:''}
          ${d.linkedin?`<span>🔗 ${d.linkedin}</span>`:''}
        </div>
      </div>
    </div>

    ${projects.length?`
    <div style="margin-bottom:28px;">
      <h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${portAccent};margin-bottom:14px;">Projects</h3>
      <div style="display:grid;grid-template-columns:${projCols};gap:14px;">${projectsHTML}</div>
    </div>`:''}

    ${skillTags?`
    <div>
      <h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${portAccent};margin-bottom:12px;">Skills</h3>
      <div style="display:flex;flex-wrap:wrap;gap:7px;">${skillTags}</div>
    </div>`:''}
  `;
}

// Add project
document.getElementById('addProject')?.addEventListener('click',()=>{
  const obj={};projects.push(obj);
  const idx=projects.length-1;
  const div=document.createElement('div');
  div.className='dyn';
  div.innerHTML=`
    <div class="dyn-head"><span class="dyn-title">🚀 Project #${idx+1}</span><button class="dyn-del"><i class="bi bi-trash"></i></button></div>
    <div class="ef-group"><label>Project Name</label><input type="text" class="ef pf" data-i="${idx}" data-k="name" placeholder="Folixo"/></div>
    <div class="ef-group"><label>Technologies</label><input type="text" class="ef pf" data-i="${idx}" data-k="tech" placeholder="Flask, Python, JavaScript"/></div>
    <div class="ef-group"><label>Description</label><textarea class="ef pf" data-i="${idx}" data-k="desc" rows="2" placeholder="What does this project do?"></textarea></div>
    <div class="ef-group"><label>Live Link</label><input type="text" class="ef pf" data-i="${idx}" data-k="link" placeholder="https://github.com/..."/></div>
  `;
  div.querySelector('.dyn-del').addEventListener('click',()=>{
    div.style.transition='all .25s ease';div.style.opacity='0';div.style.transform='translateY(-8px)';
    setTimeout(()=>{projects.splice(idx,1);div.remove();schedulePreview();},250);
  });
  div.querySelectorAll('.pf').forEach(f=>{
    f.addEventListener('input',()=>{if(projects[parseInt(f.dataset.i)])projects[parseInt(f.dataset.i)][f.dataset.k]=f.value;schedulePreview();});
  });
  document.getElementById('projectList').appendChild(div);
  schedulePreview();
});

// Save
async function saveDoc(){
  const btn=document.getElementById('saveBtn');
  btn.innerHTML='<i class="bi bi-hourglass-split"></i> Saving...';btn.disabled=true;
  try{
    const res=await fetch('/editor/save',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({doc_id:docId||null,template_id:tmplId,title:document.getElementById('docTitle').value||'My Portfolio',
        content:getData(),theme_color:portAccent,font_style:portFont,layout:portLayout,background:portBg,category:'portfolio'})});
    const data=await res.json();
    if(data.doc_id){docId=data.doc_id;document.getElementById('docId').value=docId;}
    btn.innerHTML='<i class="bi bi-check-lg"></i> Saved!';
    setTimeout(()=>{btn.innerHTML='<i class="bi bi-floppy"></i> Save';btn.disabled=false;},2000);
    Fx.toast('Portfolio saved! ✓','success');
  }catch{btn.innerHTML='<i class="bi bi-floppy"></i> Save';btn.disabled=false;Fx.toast('Save failed.','danger');}
}
document.getElementById('saveBtn')?.addEventListener('click',saveDoc);

// Export PDF
document.getElementById('exportBtn')?.addEventListener('click',async()=>{
  if(!docId){await saveDoc();}
  if(!docId){Fx.toast('Please save first.','info');return;}
  const btn=document.getElementById('exportBtn');
  btn.innerHTML='<i class="bi bi-hourglass-split"></i> Generating...';btn.disabled=true;
  try{
    const res=await fetch(`/editor/export/${docId}`,{method:'POST'});
    if(!res.ok){const e=await res.json();throw new Error(e.error||'Export failed');}
    const blob=await res.blob();const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`${document.getElementById('docTitle').value||'portfolio'}.pdf`;a.click();URL.revokeObjectURL(url);
    Fx.toast('PDF downloaded! ✓','success');
  }catch(e){Fx.toast('PDF Error: '+e.message,'danger');}
  finally{btn.innerHTML='<i class="bi bi-file-pdf"></i> Export PDF';btn.disabled=false;}
});

// AI
const aiPanel=document.getElementById('aiPanel');
document.getElementById('aiBtn')?.addEventListener('click',async()=>{
  aiPanel.classList.toggle('open');
  if(!aiPanel.classList.contains('open'))return;
  const body=document.getElementById('aiBody');
  body.innerHTML='<div class="ai-loading"><div class="spinner" style="margin:0 auto 12px;"></div><p style="font-size:13px;color:var(--muted);">Analyzing your portfolio...</p></div>';
  try{
    const res=await fetch('/ai/suggest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:getData(),category:'portfolio'})});
    const data=await res.json();
    if(data.error){body.innerHTML=`<div class="ai-idle">⚠️ ${data.error}</div>`;return;}
    body.innerHTML=data.suggestions?.length
      ?data.suggestions.map((s,i)=>`<div class="ai-card" style="animation-delay:${i*80}ms;"><div class="ai-card-sec">${s.section}</div><div class="ai-card-tip">${s.tip}</div></div>`).join('')
      :'<div class="ai-idle"><i class="bi bi-check-circle" style="font-size:36px;color:#22c55e;display:block;margin-bottom:12px;"></i>Portfolio looks great!</div>';
  }catch(e){body.innerHTML=`<div class="ai-idle">AI error: ${e.message}</div>`;}
});
document.getElementById('closeAi')?.addEventListener('click',()=>aiPanel.classList.remove('open'));

// Load existing
if(docId){
  fetch(`/editor/load/${docId}`).then(r=>r.json()).then(data=>{
    const c=data.content||{};
    const sv=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};
    sv('p-name',c.name);sv('p-headline',c.headline);sv('p-bio',c.bio);
    sv('p-email',c.email);sv('p-location',c.location);
    sv('p-github',c.github);sv('p-linkedin',c.linkedin);
    sv('p-skills',c.skills);sv('p-tools',c.tools);
    sv('docTitle',data.title);
    if(data.theme_color)portAccent=data.theme_color;
    c.projects?.forEach((p,i)=>{
      projects.push(p);
      const btn=document.getElementById('addProject');
      btn?.click();
      const inputs=document.querySelectorAll(`[data-i="${i}"]`);
      inputs.forEach(inp=>{if(p[inp.dataset.k])inp.value=p[inp.dataset.k];});
    });
    renderPortPreview();
  }).catch(()=>{});
}

renderPortPreview();
setInterval(()=>{if(v('p-name')||docId)saveDoc();},60000);
