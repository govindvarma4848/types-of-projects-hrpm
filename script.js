/* ══════════════════════════════════════════════════════
   TYPES OF PROJECTS – HRPM Interactive Engine v2
   ✍️ Live typewriter on slide change
   🖱️ Cursor parallax · 🎆 Particles · 🃏 3D tilt
   ⌨️ Keyboard · 👆 Touch · 🖱️ Wheel navigation
══════════════════════════════════════════════════════ */

'use strict';

/* ─── STATE ─── */
const TOTAL = 12;
let current = 1;
let isAnimating = false;

/* ─── DOM ─── */
const slides      = [...document.querySelectorAll('.slide')];
const prevBtn     = document.getElementById('prev-btn');
const nextBtn     = document.getElementById('next-btn');
const curEl       = document.getElementById('cur');
const totEl       = document.getElementById('tot');
const progressBar = document.getElementById('progress-bar');
const thumbs      = [...document.querySelectorAll('.thumb')];
const cursorGlow  = document.getElementById('cursor-glow');
const cursorTrail = document.getElementById('cursor-trail');

/* Typewriter elements */
const twWrap  = document.getElementById('typewriter-wrap');
const twText  = document.getElementById('typewriter-text');
const twIcon  = document.getElementById('typewriter-cursor-icon');

totEl.textContent = TOTAL;

/* ════════════════════════════════════════
   1. CUSTOM CURSOR + PARALLAX
════════════════════════════════════════ */
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let trailX = mouseX, trailY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  /* Cursor glow follows instantly */
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top  = mouseY + 'px';

  /* Live parallax background */
  const activeBg = document.querySelector('.slide.active .parallax-bg');
  if (activeBg) {
    const speed = parseFloat(activeBg.dataset.speed || 0.03);
    const cx    = window.innerWidth  / 2;
    const cy    = window.innerHeight / 2;
    const dx    = (mouseX - cx) * speed;
    const dy    = (mouseY - cy) * speed;
    activeBg.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  /* Orbs subtle extra movement */
  const activeOrbs = document.querySelectorAll('.slide.active .orb');
  activeOrbs.forEach((orb, i) => {
    const factor = 0.008 * (i % 3 + 1);
    const ox = (mouseX - window.innerWidth/2)  * factor;
    const oy = (mouseY - window.innerHeight/2) * factor;
    orb.style.transform = `translate(${ox}px,${oy}px)`;
  });

  tiltCards(e);
});

/* Trail */
(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

/* Cursor size on interactive hover */
document.addEventListener('mouseover', e => {
  const tgt = e.target.closest('button,.hex-card,.info-card,.mini-card,.pill,.ex-chip,.thumb,.conc-point,.pb-member');
  if (tgt) {
    cursorGlow.style.width  = '52px';
    cursorGlow.style.height = '52px';
    cursorGlow.style.background = 'radial-gradient(circle,rgba(236,72,153,.85) 0%,transparent 70%)';
  } else {
    cursorGlow.style.width  = '30px';
    cursorGlow.style.height = '30px';
    cursorGlow.style.background = 'radial-gradient(circle,rgba(99,102,241,.9) 0%,transparent 70%)';
  }
});

/* ════════════════════════════════════════
   2. 3D CARD TILT
════════════════════════════════════════ */
function tiltCards(e) {
  const cards = document.querySelectorAll('.slide.active .hex-card, .slide.active .info-card, .slide.active .mini-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 1.5) {
      card.style.transform = `perspective(700px) rotateX(${dy*9}deg) rotateY(${-dx*9}deg) scale(1.04)`;
    } else {
      card.style.transform = '';
    }
  });
}
document.addEventListener('mouseleave', () => {
  document.querySelectorAll('.hex-card,.info-card,.mini-card').forEach(c => c.style.transform = '');
});

/* ════════════════════════════════════════
   3. ✍️ LIVE TYPEWRITER ON SLIDE CHANGE
════════════════════════════════════════ */
let twTimer  = null;
let twHide   = null;
const ICONS  = ['✍️','📝','🖊️','✒️','📖'];

function runTypewriter(slideEl) {
  const text = slideEl.dataset.tw || '';
  if (!text) return;

  /* Clear any running timers */
  clearTimeout(twTimer);
  clearTimeout(twHide);
  twText.textContent = '';
  twIcon.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];

  /* Slide down from top */
  twWrap.classList.add('show');

  let i = 0;
  const speed = Math.max(28, Math.min(55, Math.floor(1800 / text.length)));

  function typeNext() {
    if (i < text.length) {
      twText.textContent += text[i];
      i++;
      twTimer = setTimeout(typeNext, speed);
    } else {
      /* Finished typing → pause then slide back up */
      twHide = setTimeout(() => {
        twWrap.classList.remove('show');
        setTimeout(() => { twText.textContent = ''; }, 450);
      }, 1600);
    }
  }
  typeNext();
}

/* ════════════════════════════════════════
   4. SLIDE NAVIGATION
════════════════════════════════════════ */
function goTo(n, dir = 'next') {
  if (isAnimating || n === current || n < 1 || n > TOTAL) return;
  isAnimating = true;

  const prevSlide = slides[current - 1];
  const nextSlide = slides[n - 1];

  /* Exit current */
  prevSlide.classList.add(dir === 'next' ? 'exit-left' : 'exit-right');
  prevSlide.classList.remove('active');

  spawnRipple();

  setTimeout(() => {
    prevSlide.classList.remove('exit-left', 'exit-right');

    nextSlide.classList.add('active');
    current = n;
    updateUI();

    /* Reset parallax */
    const bg = nextSlide.querySelector('.parallax-bg');
    if (bg) bg.style.transform = '';

    /* ✍️ Trigger typewriter */
    runTypewriter(nextSlide);

    setTimeout(() => { isAnimating = false; }, 600);
  }, 350);
}

function next() { goTo(current + 1, 'next'); }
function prev() { goTo(current - 1, 'prev'); }

nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
thumbs.forEach(t => {
  t.addEventListener('click', () => {
    const n = parseInt(t.dataset.slide);
    goTo(n, n > current ? 'next' : 'prev');
  });
});

/* Keyboard */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft')                     { e.preventDefault(); prev(); }
  if (e.key === 'Home') goTo(1, 'prev');
  if (e.key === 'End')  goTo(TOTAL, 'next');
  if (e.key === 'f' || e.key === 'F') toggleFS();
});

/* Touch swipe */
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
});

/* Mouse wheel */
let wheelCooldown = false;
document.addEventListener('wheel', e => {
  if (wheelCooldown) return;
  wheelCooldown = true;
  e.deltaY > 0 ? next() : prev();
  setTimeout(() => { wheelCooldown = false; }, 850);
}, { passive: true });

/* Update UI */
function updateUI() {
  curEl.textContent = current;
  progressBar.style.width = ((current / TOTAL) * 100) + '%';
  thumbs.forEach((t, i) => t.classList.toggle('active', i + 1 === current));
  document.title = `Slide ${current}/${TOTAL} – Types of Projects | HRPM`;
}
updateUI();

/* Fullscreen */
function toggleFS() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* ════════════════════════════════════════
   5. RIPPLE ON TRANSITION
════════════════════════════════════════ */
function spawnRipple() {
  const r = document.createElement('div');
  r.style.cssText = `
    position:fixed; border-radius:50%;
    width:60px; height:60px;
    background:radial-gradient(circle,rgba(99,102,241,.35),transparent);
    pointer-events:none; z-index:100;
    left:${mouseX}px; top:${mouseY}px;
    transform:translate(-50%,-50%) scale(0);
    animation: ripOut .65s ease-out forwards;
  `;
  if (!document.getElementById('ripStyle')) {
    const st = document.createElement('style');
    st.id = 'ripStyle';
    st.textContent = `@keyframes ripOut { to { transform:translate(-50%,-50%) scale(9); opacity:0; } }`;
    document.head.appendChild(st);
  }
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

/* ════════════════════════════════════════
   6. PARTICLE CANVAS
════════════════════════════════════════ */
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;';
document.body.prepend(canvas);
const ctx2 = canvas.getContext('2d');

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const PC = 90;
const particles = Array.from({ length: PC }, () => mkParticle());

function mkParticle(x, y) {
  const a = Math.random() * Math.PI * 2;
  const s = 0.2 + Math.random() * 0.5;
  return {
    x: x ?? Math.random() * canvas.width,
    y: y ?? Math.random() * canvas.height,
    vx: Math.cos(a) * s, vy: Math.sin(a) * s,
    r: 1 + Math.random() * 2.5,
    alpha: 0.1 + Math.random() * 0.5,
    hue: Math.floor(Math.random() * 360),
    life: 0, maxLife: 180 + Math.random() * 240,
  };
}

(function drawParticles() {
  ctx2.clearRect(0, 0, canvas.width, canvas.height);

  /* Connections */
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        ctx2.save();
        ctx2.globalAlpha = (1 - dist / 120) * 0.08;
        ctx2.strokeStyle = `hsl(${a.hue},70%,70%)`;
        ctx2.lineWidth = 1;
        ctx2.beginPath();
        ctx2.moveTo(a.x, a.y);
        ctx2.lineTo(b.x, b.y);
        ctx2.stroke();
        ctx2.restore();
      }
    }
  }

  particles.forEach(p => {
    /* Mouse attraction */
    const dx = mouseX - p.x, dy = mouseY - p.y;
    const d  = Math.hypot(dx, dy);
    if (d < 180) { p.vx += (dx / d) * 0.025; p.vy += (dy / d) * 0.025; }

    /* Speed cap */
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > 1.8) { p.vx *= 1.8/spd; p.vy *= 1.8/spd; }

    p.x += p.vx; p.y += p.vy; p.life++;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width)  p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    const prog = p.life / p.maxLife;
    const fade = prog < 0.1 ? prog / 0.1 : prog > 0.9 ? (1 - prog) / 0.1 : 1;

    ctx2.save();
    ctx2.globalAlpha = p.alpha * fade;
    ctx2.fillStyle   = `hsl(${p.hue},80%,75%)`;
    ctx2.shadowColor = `hsl(${p.hue},100%,70%)`;
    ctx2.shadowBlur  = 6;
    ctx2.beginPath();
    ctx2.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.restore();

    if (p.life > p.maxLife) Object.assign(p, mkParticle());
  });

  requestAnimationFrame(drawParticles);
})();

/* ════════════════════════════════════════
   7. CLICK BURST
════════════════════════════════════════ */
document.addEventListener('click', e => {
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const spd   = 2 + Math.random() * 3;
    particles.push({
      x: e.clientX, y: e.clientY,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
      r: 2 + Math.random() * 3, alpha: .9,
      hue: 220 + Math.random() * 100,
      life: 0, maxLife: 45,
    });
  }
  setTimeout(() => { while (particles.length > PC) particles.shift(); }, 1800);
});

/* ════════════════════════════════════════
   8. OBSERVE SLIDE ACTIVE → TRIGGER REVEALS
════════════════════════════════════════ */
const obs = new MutationObserver(mutations => {
  mutations.forEach(m => {
    if (m.attributeName === 'class' && m.target.classList.contains('active')) {
      m.target.querySelectorAll('.reveal').forEach(r => {
        r.style.opacity = '0';
        r.style.transform = 'translateY(28px)';
        void r.offsetWidth;
        r.style.opacity = '';
        r.style.transform = '';
      });
    }
  });
});
slides.forEach(s => obs.observe(s, { attributes: true }));

/* ════════════════════════════════════════
   9. AURORA BACKGROUND LAYER
════════════════════════════════════════ */
(function() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;pointer-events:none;z-index:0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 20%,rgba(99,102,241,.06) 0%,transparent 55%),
      radial-gradient(ellipse 70% 70% at 80% 80%,rgba(236,72,153,.05) 0%,transparent 55%);
    animation:auroraPulse 10s ease-in-out infinite alternate;
  `;
  const s = document.createElement('style');
  s.textContent = `@keyframes auroraPulse{from{opacity:.4;transform:scale(1)}to{opacity:1;transform:scale(1.08)}}`;
  document.head.appendChild(s);
  document.body.prepend(overlay);
})();

/* ════════════════════════════════════════
   10. KEYBOARD HINT
════════════════════════════════════════ */
(function() {
  const hint = document.createElement('div');
  hint.style.cssText = `
    position:fixed;bottom:60px;right:16px;
    font-size:.7rem;color:rgba(255,255,255,.28);
    z-index:200;display:flex;flex-direction:column;gap:4px;align-items:flex-end;
  `;
  hint.innerHTML = `
    <span style="border:1px solid rgba(255,255,255,.18);border-radius:4px;padding:2px 7px;font-family:monospace;">← → Space</span>
    <span>Navigate &nbsp;|&nbsp; F = Fullscreen</span>
  `;
  document.body.appendChild(hint);
})();

/* ════════════════════════════════════════
   11. DYNAMIC GREETING ON BADGE
════════════════════════════════════════ */
const badge = document.querySelector('.subject-tag');
if (badge) {
  const h = new Date().getHours();
  const g = h < 12 ? '🌅 Good Morning!' : h < 17 ? '☀️ Good Afternoon!' : '🌙 Good Evening!';
  badge.innerHTML = `${g} &nbsp;·&nbsp; 📘 Subject: <strong>Human Resources &amp; Project Management</strong>`;
}

/* ─── CONSOLE BRANDING ─── */
console.log(
  '%c📊 TYPES OF PROJECTS – HRPM Presentation\n%cPresented by Adapa Govind Varma (LE-1) & M Sai-Ram (LE-3), Batch 2\n%c← → or Space = Navigate · F = Fullscreen · ✍️ Live writing on each slide change',
  'color:#818cf8;font-size:16px;font-weight:bold',
  'color:#34d399;font-size:12px',
  'color:#94a3b8;font-size:11px'
);
