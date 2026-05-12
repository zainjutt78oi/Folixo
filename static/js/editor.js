/* FOLIXO editor.js — World Class Resume/CV Builder */
let expItems=[], eduItems=[], pubItems=[], projItems=[];
let docId     = document.getElementById('docId')?.value || '';
const tmplId  = document.getElementById('templateId')?.value;
const category= document.getElementById('docCategory')?.value || 'resume';
let accent    = document.getElementById('docAccent')?.value || '#1a73e8';
let fontStyle = 'Inter';
let layoutStyle = 'single-column';

// ── Tab switching ──────────────────────────────────────
document.querySelectorAll('.etab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.etab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.epanel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(`tab-${t.dataset.tab}`)?.classList.add('active');
  });
});

// ── Color swatches ─────────────────────────────────────
document.querySelectorAll('.csw').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.csw').forEach(x => x.classList.remove('active'));
    sw.classList.add('active');
    accent = sw.dataset.color;
    document.getElementById('prevDoc')?.style.setProperty('--doc-accent', accent);
    schedulePreview();
  });
});

// ── Font options ───────────────────────────────────────
document.querySelectorAll('#fontGrid .opt-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#fontGrid .opt-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    fontStyle = b.dataset.font;
    document.getElementById('prevDoc').style.fontFamily = `'${fontStyle}',sans-serif`;
  });
});

// ── Layout options ─────────────────────────────────────
document.querySelectorAll('#layoutGrid .opt-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#layoutGrid .opt-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    layoutStyle = b.dataset.layout;
    schedulePreview();
  });
});

// ── Live preview ───────────────────────────────────────
let pt;
const schedulePreview = () => { clearTimeout(pt); pt = setTimeout(renderPreview, 160); };
document.querySelectorAll('.ef').forEach(el => el.addEventListener('input', schedulePreview));

const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

function getData() {
  return {
    name:       v('f-name'),
    title:      v('f-title'),
    email:      v('f-email'),
    phone:      v('f-phone'),
    location:   v('f-location'),
    linkedin:   v('f-linkedin'),
    website:    v('f-website'),
    summary:    v('f-summary'),
    skills:     v('f-skills'),
    softskills: v('f-softskills'),
    languages:  v('f-languages'),
    certs:      v('f-certs'),
    research:   v('f-research'),
    teaching:   v('f-teaching'),
    grants:     v('f-grants'),
    experience: expItems,
    education:  eduItems,
    publications: pubItems,
    projects:   projItems,
  };
}

// ── ATS Score calculator ───────────────────────────────
function calcATSScore(d) {
  let score = 40;
  if (d.name)     score += 5;
  if (d.email)    score += 5;
  if (d.phone)    score += 5;
  if (d.linkedin) score += 5;
  if (d.summary && d.summary.length > 80)  score += 10;
  if (d.experience.length > 0)             score += 10;
  if (d.education.length > 0)              score += 5;
  if (d.skills && d.skills.split(',').length >= 5) score += 10;
  if (d.experience.some(e => /\d+%|\d+x|\$\d+/.test(e.desc||''))) score += 5;
  return Math.min(score, 100);
}

function updateATSBadge(score) {
  const badge = document.getElementById('atsBadge');
  if (!badge) return;
  if (score >= 80) {
    badge.className = 'ats-badge';
    badge.innerHTML = `<i class="bi bi-shield-check"></i> ATS Score: ${score}%`;
  } else if (score >= 55) {
    badge.className = 'ats-badge warn';
    badge.innerHTML = `<i class="bi bi-shield-exclamation"></i> ATS Score: ${score}%`;
  } else {
    badge.className = 'ats-badge poor';
    badge.innerHTML = `<i class="bi bi-shield-x"></i> ATS Score: ${score}%`;
  }
}

// ── Build preview HTML ─────────────────────────────────
function renderPreview() {
  const d   = getData();
  const el  = document.getElementById('prevContent');
  if (!el) return;
  const score = calcATSScore(d);
  updateATSBadge(score);
  el.style.opacity = '0';
  setTimeout(() => {
    el.innerHTML = buildHTML(d);
    el.style.transition = 'opacity .22s ease';
    el.style.opacity = '1';
    document.getElementById('prevDoc')?.style.setProperty('--doc-accent', accent);
    document.getElementById('prevDoc').style.fontFamily = `'${fontStyle}',sans-serif`;
    // page count estimate
    const lines = el.querySelectorAll('.pei,.pbody').length;
    const pages = lines > 30 ? 2 : 1;
    const pc = document.getElementById('pageCount');
    if (pc) pc.textContent = `${pages} page${pages>1?'s':''}`;
  }, 70);
}

function buildHTML(d) {
  if (!d.name && !d.summary && !d.experience.length) {
    return `<div style="text-align:center;padding:72px 20px;color:#aaa;">
      <i class="bi bi-file-earmark-person" style="font-size:52px;display:block;margin-bottom:16px;opacity:.2;"></i>
      <p style="font-size:14px;">Fill in your details to see the live preview.</p></div>`;
  }

  const A = accent || '#1a73e8';

  const contacts = [
    d.email    && `<span><i class="bi bi-envelope" style="margin-right:3px;"></i>${d.email}</span>`,
    d.phone    && `<span><i class="bi bi-telephone" style="margin-right:3px;"></i>${d.phone}</span>`,
    d.location && `<span><i class="bi bi-geo-alt" style="margin-right:3px;"></i>${d.location}</span>`,
    d.linkedin && `<span><i class="bi bi-linkedin" style="margin-right:3px;"></i>${d.linkedin}</span>`,
    d.website  && `<span><i class="bi bi-github" style="margin-right:3px;"></i>${d.website}</span>`,
  ].filter(Boolean).join('');

  const secDiv = (title) => `
    <div style="display:flex;align-items:center;gap:8px;margin:16px 0 8px;">
      <span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:${A};white-space:nowrap;">${title}</span>
      <div style="flex:1;height:1.5px;background:${A};opacity:.2;"></div>
    </div>`;

  const expHTML = d.experience.map(e => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f0a1e;">${e.role||''}</div>
          <div style="font-size:12px;color:${A};font-weight:600;">${e.company||''}${e.location_c?' · '+e.location_c:''}</div>
        </div>
        <div style="font-size:11px;color:#888;text-align:right;white-space:nowrap;margin-left:8px;">
          ${[e.start,e.end].filter(Boolean).join(' – ')}
        </div>
      </div>
      ${e.desc ? `<ul style="margin:5px 0 0 16px;padding:0;">
        ${e.desc.split('\n').filter(l=>l.trim()).map(line=>`<li style="font-size:11px;color:#444;line-height:1.6;margin-bottom:2px;">${line.replace(/^[-•]\s*/,'')}</li>`).join('')}
      </ul>` : ''}
    </div>`).join('');

  const eduHTML = d.education.map(e => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#0f0a1e;">${e.degree||''}</div>
          <div style="font-size:12px;color:${A};font-weight:600;">${e.institution||''}</div>
          ${e.gpa?`<div style="font-size:11px;color:#888;">GPA: ${e.gpa}</div>`:''}
        </div>
        <div style="font-size:11px;color:#888;text-align:right;white-space:nowrap;margin-left:8px;">
          ${[e.start,e.end].filter(Boolean).join(' – ')}
        </div>
      </div>
    </div>`).join('');

  const skillTags = d.skills
    ? d.skills.split(',').map(s => `<span style="display:inline-block;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:600;background:${A}15;color:${A};border:1px solid ${A}30;margin:2px;">${s.trim()}</span>`).join('')
    : '';

  const softTags = d.softskills
    ? d.softskills.split(',').map(s => `<span style="display:inline-block;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:600;background:#f8f8f8;color:#555;border:1px solid #ddd;margin:2px;">${s.trim()}</span>`).join('')
    : '';

  const projHTML = d.projects.map(p => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:12px;font-weight:700;color:#0f0a1e;">${p.name||''}</span>
        ${p.link?`<a href="${p.link}" style="font-size:11px;color:${A};">🔗 Link</a>`:''}
      </div>
      ${p.tech?`<div style="font-size:11px;color:${A};font-weight:600;margin:2px 0;">${p.tech}</div>`:''}
      ${p.desc?`<div style="font-size:11px;color:#444;line-height:1.6;">${p.desc}</div>`:''}
    </div>`).join('');

  const pubHTML = d.publications.map(p => `
    <div style="margin-bottom:10px;">
      <div style="font-size:12px;font-weight:700;color:#0f0a1e;">${p.title||''}</div>
      <div style="font-size:11px;color:${A};">${[p.journal,p.year].filter(Boolean).join(' · ')}</div>
    </div>`).join('');

  return `
    <!-- HEADER -->
    <div style="border-bottom:2.5px solid ${A};padding-bottom:14px;margin-bottom:4px;">
      ${d.name?`<h1 style="font-size:24px;font-weight:800;color:#0f0a1e;margin:0 0 3px;letter-spacing:-.5px;">${d.name}</h1>`:''}
      ${d.title?`<div style="font-size:14px;color:${A};font-weight:600;margin-bottom:8px;">${d.title}</div>`:''}
      ${contacts?`<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:11px;color:#555;">${contacts}</div>`:''}
    </div>

    ${d.summary?`${secDiv('Professional Summary')}<div style="font-size:12px;line-height:1.75;color:#333;">${d.summary}</div>`:''}
    ${expHTML?`${secDiv('Work Experience')}${expHTML}`:''}
    ${eduHTML?`${secDiv('Education')}${eduHTML}`:''}
    ${skillTags?`${secDiv('Technical Skills')}<div style="margin-bottom:4px;">${skillTags}</div>`:''}
    ${softTags?`${secDiv('Soft Skills')}<div style="margin-bottom:4px;">${softTags}</div>`:''}
    ${projHTML?`${secDiv('Projects')}${projHTML}`:''}
    ${d.languages?`${secDiv('Languages')}<div style="font-size:12px;color:#444;">${d.languages}</div>`:''}
    ${d.certs?`${secDiv('Certifications & Awards')}<div style="font-size:12px;color:#444;line-height:1.7;">${d.certs}</div>`:''}
    ${d.research?`${secDiv('Research Interests')}<div style="font-size:12px;color:#444;">${d.research}</div>`:''}
    ${pubHTML?`${secDiv('Publications')}${pubHTML}`:''}
    ${d.teaching?`${secDiv('Teaching Experience')}<div style="font-size:12px;color:#444;">${d.teaching}</div>`:''}
    ${d.grants?`${secDiv('Grants & Funding')}<div style="font-size:12px;color:#444;">${d.grants}</div>`:''}
  `;
}

// ── Dynamic sections ───────────────────────────────────
function makeDyn(type, idx, data={}) {
  const div = document.createElement('div');
  div.className = 'dyn';
  let fields = '';

  if (type === 'exp') {
    fields = `
      <div class="ef-row">
        <div class="ef-group"><label>Job Title</label><input type="text" class="ef df" data-t="exp" data-i="${idx}" data-k="role" value="${data.role||''}" placeholder="Software Engineer"/></div>
        <div class="ef-group"><label>Company</label><input type="text" class="ef df" data-t="exp" data-i="${idx}" data-k="company" value="${data.company||''}" placeholder="Google"/></div>
      </div>
      <div class="ef-row">
        <div class="ef-group"><label>Start Date</label><input type="text" class="ef df" data-t="exp" data-i="${idx}" data-k="start" value="${data.start||''}" placeholder="Jan 2022"/></div>
        <div class="ef-group"><label>End Date</label><input type="text" class="ef df" data-t="exp" data-i="${idx}" data-k="end" value="${data.end||''}" placeholder="Present"/></div>
      </div>
      <div class="ef-group"><label>City/Country</label><input type="text" class="ef df" data-t="exp" data-i="${idx}" data-k="location_c" value="${data.location_c||''}" placeholder="Mountain View, CA"/></div>
      <div class="ef-group">
        <label>Key Achievements <span style="font-size:10px;color:var(--muted);">One per line. Start with action verbs. Add numbers!</span></label>
        <textarea class="ef df" data-t="exp" data-i="${idx}" data-k="desc" rows="4"
          placeholder="• Built REST API serving 1M+ requests/day using Flask and PostgreSQL&#10;• Reduced page load time by 60% through caching and optimization&#10;• Led team of 4 developers to deliver project 2 weeks ahead of schedule">${data.desc||''}</textarea>
      </div>`;
  } else if (type === 'edu') {
    fields = `
      <div class="ef-row">
        <div class="ef-group"><label>Degree</label><input type="text" class="ef df" data-t="edu" data-i="${idx}" data-k="degree" value="${data.degree||''}" placeholder="BS Information Technology"/></div>
        <div class="ef-group"><label>Institution</label><input type="text" class="ef df" data-t="edu" data-i="${idx}" data-k="institution" value="${data.institution||''}" placeholder="University of Gujrat"/></div>
      </div>
      <div class="ef-row">
        <div class="ef-group"><label>Start</label><input type="text" class="ef df" data-t="edu" data-i="${idx}" data-k="start" value="${data.start||''}" placeholder="2021"/></div>
        <div class="ef-group"><label>End</label><input type="text" class="ef df" data-t="edu" data-i="${idx}" data-k="end" value="${data.end||''}" placeholder="2025"/></div>
      </div>
      <div class="ef-group"><label>GPA <span style="font-size:10px;color:var(--muted);">(only if 3.5+)</span></label>
        <input type="text" class="ef df" data-t="edu" data-i="${idx}" data-k="gpa" value="${data.gpa||''}" placeholder="3.8 / 4.0"/></div>`;
  } else if (type === 'pub') {
    fields = `
      <div class="ef-group"><label>Title</label><input type="text" class="ef df" data-t="pub" data-i="${idx}" data-k="title" value="${data.title||''}" placeholder="Paper title..."/></div>
      <div class="ef-row">
        <div class="ef-group"><label>Journal / Conference</label><input type="text" class="ef df" data-t="pub" data-i="${idx}" data-k="journal" value="${data.journal||''}" placeholder="IEEE CVPR"/></div>
        <div class="ef-group"><label>Year</label><input type="text" class="ef df" data-t="pub" data-i="${idx}" data-k="year" value="${data.year||''}" placeholder="2024"/></div>
      </div>`;
  } else if (type === 'proj') {
    fields = `
      <div class="ef-row">
        <div class="ef-group"><label>Project Name</label><input type="text" class="ef df" data-t="proj" data-i="${idx}" data-k="name" value="${data.name||''}" placeholder="Folixo"/></div>
        <div class="ef-group"><label>Tech Stack</label><input type="text" class="ef df" data-t="proj" data-i="${idx}" data-k="tech" value="${data.tech||''}" placeholder="Python, Flask, React"/></div>
      </div>
      <div class="ef-group"><label>Description</label>
        <textarea class="ef df" data-t="proj" data-i="${idx}" data-k="desc" rows="2"
          placeholder="Built X that does Y, resulting in Z...">${data.desc||''}</textarea></div>
      <div class="ef-group"><label>Link</label><input type="text" class="ef df" data-t="proj" data-i="${idx}" data-k="link" value="${data.link||''}" placeholder="github.com/..."/></div>`;
  }

  const icons = {exp:'💼', edu:'🎓', pub:'📄', proj:'🚀'};
  const labels = {exp:'Experience', edu:'Education', pub:'Publication', proj:'Project'};
  div.innerHTML = `
    <div class="dyn-head">
      <span class="dyn-title">${icons[type]} ${labels[type]} #${idx+1}</span>
      <button class="dyn-del"><i class="bi bi-trash"></i></button>
    </div>${fields}`;

  div.querySelector('.dyn-del').addEventListener('click', () => {
    div.style.transition='all .25s ease'; div.style.opacity='0'; div.style.transform='translateY(-8px)';
    setTimeout(() => {
      const arr = type==='exp'?expItems:type==='edu'?eduItems:type==='pub'?pubItems:projItems;
      arr.splice(idx, 1); div.remove(); schedulePreview();
    }, 250);
  });

  div.querySelectorAll('.df').forEach(f => {
    f.addEventListener('input', () => {
      const t=f.dataset.t, i=parseInt(f.dataset.i), k=f.dataset.k;
      const arr = t==='exp'?expItems:t==='edu'?eduItems:t==='pub'?pubItems:projItems;
      if(arr[i]) arr[i][k] = f.value;
      schedulePreview();
    });
  });
  return div;
}

document.getElementById('addExp')?.addEventListener('click', () => {
  const o={}; expItems.push(o);
  document.getElementById('expList').appendChild(makeDyn('exp', expItems.length-1, o));
  schedulePreview();
});
document.getElementById('addEdu')?.addEventListener('click', () => {
  const o={}; eduItems.push(o);
  document.getElementById('eduList').appendChild(makeDyn('edu', eduItems.length-1, o));
  schedulePreview();
});
document.getElementById('addPub')?.addEventListener('click', () => {
  const o={}; pubItems.push(o);
  document.getElementById('pubList')?.appendChild(makeDyn('pub', pubItems.length-1, o));
  schedulePreview();
});
document.getElementById('addProj')?.addEventListener('click', () => {
  const o={}; projItems.push(o);
  document.getElementById('projList')?.appendChild(makeDyn('proj', projItems.length-1, o));
  schedulePreview();
});

// ── Save ───────────────────────────────────────────────
async function saveDoc() {
  const btn = document.getElementById('saveBtn');
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...'; btn.disabled = true;
  try {
    const res = await fetch('/editor/save', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        doc_id: docId||null, template_id: tmplId,
        title: document.getElementById('docTitle').value || 'Untitled',
        content: getData(), theme_color: accent,
        font_style: fontStyle, layout: layoutStyle, category
      })
    });
    const data = await res.json();
    if (data.doc_id) { docId=data.doc_id; document.getElementById('docId').value=docId; }
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Saved!';
    setTimeout(() => { btn.innerHTML='<i class="bi bi-floppy"></i> Save'; btn.disabled=false; }, 2000);
    Fx.toast('Saved! ✓', 'success');
  } catch { btn.innerHTML='<i class="bi bi-floppy"></i> Save'; btn.disabled=false; Fx.toast('Save failed.','danger'); }
}
document.getElementById('saveBtn')?.addEventListener('click', saveDoc);

// ── Export PDF ─────────────────────────────────────────
document.getElementById('exportBtn')?.addEventListener('click', async () => {
  if (!docId) await saveDoc();
  if (!docId) { Fx.toast('Please save first.','info'); return; }
  const btn = document.getElementById('exportBtn');
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...'; btn.disabled = true;
  try {
    const res = await fetch(`/editor/export/${docId}`, { method: 'POST' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error||'Export failed'); }
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url;
    a.download = `${document.getElementById('docTitle').value||'resume'}.pdf`;
    a.click(); URL.revokeObjectURL(url);
    Fx.toast('PDF downloaded! ✓','success');
  } catch(e) { Fx.toast('PDF Error: '+e.message,'danger'); }
  finally { btn.innerHTML='<i class="bi bi-file-pdf"></i> Export PDF'; btn.disabled=false; }
});

// ── AI Review ──────────────────────────────────────────
const aiPanel = document.getElementById('aiPanel');
document.getElementById('aiBtn')?.addEventListener('click', async () => {
  aiPanel.classList.toggle('open');
  if (!aiPanel.classList.contains('open')) return;
  const body = document.getElementById('aiBody');
  const sw   = document.getElementById('aiScoreWrap');
  body.innerHTML = `<div class="ai-loading"><div class="spinner" style="margin:0 auto 12px;"></div><p style="font-size:13px;color:var(--muted);">Claude AI is reviewing your ${category}...</p></div>`;
  sw.style.display = 'none';
  try {
    const res  = await fetch('/ai/suggest', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ content: getData(), category }) });
    const data = await res.json();
    if (data.error) { body.innerHTML=`<div class="ai-idle" style="color:var(--muted);">⚠️ ${data.error}</div>`; return; }
    sw.style.display = 'block';
    const fill = document.getElementById('aiScoreFill');
    fill.style.width = `${data.score}%`;
    fill.style.background = data.score>=80?'#22c55e':data.score>=55?'#3b82f6':'#ef4444';
    document.getElementById('aiScoreNum').textContent = `${data.score}/100`;
    body.innerHTML = data.suggestions?.length
      ? data.suggestions.map((s,i) => `<div class="ai-card" style="animation-delay:${i*80}ms;">
          <div class="ai-card-sec"><i class="bi bi-lightning-fill me-1"></i>${s.section}</div>
          <div class="ai-card-tip">${s.tip}</div></div>`).join('')
      : `<div class="ai-idle"><i class="bi bi-check-circle" style="font-size:36px;color:#22c55e;display:block;margin-bottom:12px;"></i>Excellent! Resume looks great.</div>`;
  } catch(e) { body.innerHTML=`<div class="ai-idle">Error: ${e.message}</div>`; }
});
document.getElementById('closeAi')?.addEventListener('click', () => aiPanel.classList.remove('open'));

// ── Load existing doc ──────────────────────────────────
if (docId) {
  fetch(`/editor/load/${docId}`).then(r=>r.json()).then(data => {
    const c = data.content || {};
    const sv = (id, val) => { const el=document.getElementById(id); if(el) el.value=val||''; };
    sv('f-name',c.name); sv('f-title',c.title); sv('f-email',c.email);
    sv('f-phone',c.phone); sv('f-location',c.location);
    sv('f-linkedin',c.linkedin); sv('f-website',c.website);
    sv('f-summary',c.summary); sv('f-skills',c.skills);
    sv('f-softskills',c.softskills); sv('f-languages',c.languages);
    sv('f-certs',c.certs); sv('f-research',c.research);
    sv('f-teaching',c.teaching); sv('f-grants',c.grants);
    sv('docTitle',data.title);
    if (data.theme_color) { accent=data.theme_color; document.getElementById('docAccent').value=accent; }
    c.experience?.forEach((e,i)=>{expItems.push(e);document.getElementById('expList').appendChild(makeDyn('exp',i,e));});
    c.education?.forEach((e,i)=>{eduItems.push(e);document.getElementById('eduList').appendChild(makeDyn('edu',i,e));});
    c.publications?.forEach((p,i)=>{pubItems.push(p);document.getElementById('pubList')?.appendChild(makeDyn('pub',i,p));});
    c.projects?.forEach((p,i)=>{projItems.push(p);document.getElementById('projList')?.appendChild(makeDyn('proj',i,p));});
    renderPreview();
  }).catch(()=>{});
}

// Auto-save every 60s
setInterval(() => { if (v('f-name') || docId) saveDoc(); }, 60000);
