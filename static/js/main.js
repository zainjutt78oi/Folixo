/* FOLIXO main.js */
const html = document.documentElement;

// Theme
const saved = localStorage.getItem('fx_theme') ||
              (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
html.setAttribute('data-theme', saved);

document.getElementById('themeBtn')?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('fx_theme', next);
  fetch('/set-theme', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({theme:next})}).catch(()=>{});
});

// Mobile nav
const mobileBtn = document.getElementById('mobileNavBtn');
const navLinks  = document.getElementById('navLinks');
const navRight  = document.getElementById('navRight');
mobileBtn?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
  navRight?.classList.toggle('open');
});

// User dropdown
const uBtn  = document.getElementById('uBtn');
const uDrop = document.getElementById('uDrop');
uBtn?.addEventListener('click', e => { e.stopPropagation(); uDrop.classList.toggle('open'); });
document.addEventListener('click', () => uDrop?.classList.remove('open'));

// Flash auto-dismiss
document.querySelectorAll('.flash').forEach(f => {
  setTimeout(() => { f.style.transition='all .4s ease'; f.style.opacity='0'; f.style.transform='translateX(100%)'; setTimeout(()=>f.remove(),400); }, 4500);
});

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('on'); obs.unobserve(e.target); } });
}, { threshold:.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Scroll nav shadow
window.addEventListener('scroll', () => {
  document.querySelector('.f-nav')?.style.setProperty('box-shadow', window.scrollY > 20 ? '0 4px 24px rgba(108,63,197,.12)' : 'none');
}, {passive:true});

// Stagger cards on load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tmpl-card, .doc-card').forEach((el,i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity .4s ease ${i*50}ms, transform .4s ease ${i*50}ms`;
    setTimeout(() => { el.style.opacity='1'; el.style.transform='translateY(0)'; }, 60 + i*50);
  });
});

// Global toast
window.Fx = {
  toast(msg, type='info') {
    let wrap = document.querySelector('.flash-wrap');
    if(!wrap){ wrap=document.createElement('div'); wrap.className='flash-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = `flash flash-${type}`;
    el.innerHTML = `<span>${msg}</span><button class="flash-x" onclick="this.parentElement.remove()">×</button>`;
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.transition='all .4s ease'; el.style.opacity='0'; el.style.transform='translateX(100%)'; setTimeout(()=>el.remove(),400); },4000);
  }
};
