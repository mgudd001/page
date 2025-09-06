const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

const PAGES = [
  { path: '/', label: '>home' },
  { path: '/publications', label: '>publications' },
  { path: '/cv', label: '>cv' },
  { path: '/teaching', label: '>teaching' },
  { path: '/notes', label: '>notes' },
  { path: '/research', label: '>research' }
];

function renderTemplate({ activePath = '/', bodyHtml = '' }) {
  const navLinks = PAGES.map(p => {
    const isActive = p.path === activePath;
    return `<a class="nav-link${isActive ? ' is-active' : ''}" href="${p.path}"><span class="type-text" data-type-text="${p.label}">${p.label}</span></a>`;
  }).join('');

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mahatru Guddamsetty</title>
  <meta name="color-scheme" content="dark light" />
  <style>
    :root { --bg: #0b1020; --fg: #e6eefc; --muted: #9fb0d9; --accent: #3b82f6; --panel: rgba(255,255,255,0.06); --border: rgba(255,255,255,0.12); }
    html[data-theme='light'] { --bg: #ffffff; --fg: #0b1020; --muted: #4b5563; --accent: #0f62fe; --panel: rgba(15,98,254,0.05); --border: rgba(0,0,0,0.1); }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: var(--bg); color: var(--fg); }

    .site-header { position: sticky; top: 0; z-index: 5; backdrop-filter: saturate(1.2) blur(8px); background: color-mix(in oklab, var(--bg) 88%, transparent); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1024px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; gap: 16px; }
    .primary-nav { display: flex; gap: 16px; align-items: center; }
    .nav-link { color: var(--muted); text-decoration: none; text-transform: lowercase; padding: 6px 8px; border-radius: 8px; transition: color .2s ease, background .2s ease; }
    .nav-link:hover { color: var(--fg); background: var(--panel); }
    .nav-link.is-active { color: var(--fg); font-weight: 600; }
    .spacer { flex: 1 1 auto; }
    .toggle-btn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 10px; background: var(--panel); color: var(--fg); cursor: pointer; }
    .toggle-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    .page-root { position: relative; }
    .page { position: relative; z-index: 1; max-width: 1024px; margin: 0 auto; padding: 32px 20px 56px; }
    .hero { display: grid; grid-template-columns: 1.25fr 1fr; align-items: center; gap: 28px; }
    .hero-title { margin: 0 0 10px; font-size: 40px; line-height: 1.1; font-weight: 800; letter-spacing: 0.5px; }
    .hero-lead { margin: 0; color: var(--muted); font-size: 16px; }
    .profile-wrap { display: grid; place-items: center; }
    .profile { width: 220px; height: 220px; border-radius: 18px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.35); border: 4px solid var(--panel); }

    .section-title { margin: 0 0 12px; font-size: 28px; }
    .section-panel { border: 1px solid var(--border); background: var(--panel); border-radius: 14px; padding: 18px; }

    /* Background bokeh for home */
    .bokeh-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; filter: blur(18px); opacity: 0.45; }

    /* CSS custom cursor (northwest arrow, glossy gradient) */
    body.use-custom-cursor, body.use-custom-cursor * { cursor: url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><defs><linearGradient id=\'g\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'1\'><stop offset=\'0%\' stop-color=\'#ffffff\'/><stop offset=\'45%\' stop-color=\'#cfe6ff\'/><stop offset=\'75%\' stop-color=\'#b7b4ff\'/><stop offset=\'100%\' stop-color=\'#93e6ff\'/></linearGradient></defs><g transform=\'translate(1,1)\'><path d=\'M2 2 L18 6 L12 8 L20 20 L16 22 L8 10 L6 16 Z\' fill=\'url(#g)\' stroke=\'#ffffff\' stroke-opacity=\'.8\' stroke-width=\'1\' /><path d=\'M4 3 L18 6 L12 8 L20 20 L16 22 L8 10 L6 16 Z\' fill=\'none\' stroke=\'#000000\' stroke-opacity=\'.35\' stroke-width=\'1\' /></g></svg>')} ") 2 2, auto; }

    @media (max-width: 860px) {
      .hero { grid-template-columns: 1fr; }
      .profile { width: 180px; height: 180px; }
      .hero-title { font-size: 32px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <nav class="primary-nav" aria-label="Primary">
        ${navLinks}
      </nav>
      <div class="spacer"></div>
      <button id="theme-toggle" class="toggle-btn" aria-label="Toggle color theme" title="Toggle light/dark">🌗</button>
    </div>
  </header>
  ${bodyHtml}
  <script>
    (function() {
      var saved = localStorage.getItem('theme');
      var prefers = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      var current = saved || prefers;
      document.documentElement.setAttribute('data-theme', current);
      var btn = document.getElementById('theme-toggle');
      btn.addEventListener('click', function(){
        var now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', now);
        localStorage.setItem('theme', now);
      });
    })();

    // Enable CSS custom cursor on non-touch and non-reduced-motion
    (function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var coarse = window.matchMedia('(pointer: coarse)').matches;
      if (!reduce && !coarse) document.body.classList.add('use-custom-cursor');
    })();

    // Typewriter utility
    (function(){
      function type(el, full, speed){
        if (!el) return Promise.resolve();
        el.textContent = '';
        return new Promise(function(resolve){
          var i = 0;
          function step(){
            i++;
            el.textContent = full.slice(0, i);
            if (i < full.length) setTimeout(step, speed);
            else resolve();
          }
          step();
        });
      }

      function setupTypeTargets(root){
        var targets = Array.from(root.querySelectorAll('.type-text'));
        targets.forEach(function(t){
          var txt = t.getAttribute('data-type-text') || t.textContent;
          t.setAttribute('data-type-text', txt);
          t.addEventListener('click', function(e){ type(t, txt, 16); });
        });
        return targets;
      }

      var all = setupTypeTargets(document);
      var hero = document.querySelector('.hero-title');
      if (hero) {
        hero.setAttribute('data-type-text', hero.textContent);
        hero.addEventListener('click', function(){ type(hero, hero.getAttribute('data-type-text'), 12); });
      }
      var about = document.querySelector('.section-title');
      if (about) {
        about.setAttribute('data-type-text', about.textContent);
        about.addEventListener('click', function(){ type(about, about.getAttribute('data-type-text'), 12); });
      }

      var first = !sessionStorage.getItem('typed_once');
      if (first) {
        (async function(){
          for (var i=0;i<all.length;i++) { await type(all[i], all[i].getAttribute('data-type-text'), 12); }
          if (hero) await type(hero, hero.getAttribute('data-type-text'), 10);
          if (about) await type(about, about.getAttribute('data-type-text'), 10);
          sessionStorage.setItem('typed_once', '1');
        })();
      }
    })();

    // Home-only animated bokeh background with overscan padding so it extends beyond edges
    (function(){
      var c = document.getElementById('bokeh');
      if (!c) return;
      var ctx = c.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pad = 200; // overscan to avoid right/bottom cutoff under blur
      function resize(){
        var w = window.innerWidth, h = window.innerHeight;
        c.width = Math.floor((w + pad*2) * dpr);
        c.height = Math.floor((h + pad*2) * dpr);
        c.style.width = w + 'px';
        c.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, -pad*dpr, -pad*dpr);
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      var blobs = [];
      var COLORS = ['#7dd3fc','#93c5fd','#a5b4fc','#c4b5fd','#67e8f9'];
      for (var i=0;i<16;i++) {
        blobs.push({
          x: Math.random()* (window.innerWidth + pad*2) - pad,
          y: Math.random()* (window.innerHeight + pad*2) - pad,
          r: 120 + Math.random()*140,
          vx: (Math.random()*2-1) * 0.3,
          vy: (Math.random()*2-1) * 0.3,
          c: COLORS[i % COLORS.length]
        });
      }

      function draw(){
        ctx.clearRect(-pad,-pad, window.innerWidth + pad*2, window.innerHeight + pad*2);
        ctx.globalCompositeOperation = 'lighter';
        for (var i=0;i<blobs.length;i++){
          var b = blobs[i];
          b.x += b.vx; b.y += b.vy;
          if (b.x < -pad-200 || b.x > window.innerWidth + pad + 200) b.vx *= -1;
          if (b.y < -pad-200 || b.y > window.innerHeight + pad + 200) b.vy *= -1;
          var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          g.addColorStop(0, b.c + 'cc');
          g.addColorStop(1, b.c + '00');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
          ctx.fill();
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    })();
  </script>
</body>
</html>`;
}

function renderHome() {
  const bodyHtml = `
  <div class="page-root">
    <canvas id="bokeh" class="bokeh-canvas"></canvas>
    <main class="page">
      <section class="hero">
        <div>
          <h1 class="hero-title"><span class="type-text" data-type-text=">MAHATRU GUDDAMSETTY">&gt;MAHATRU GUDDAMSETTY</span></h1>
          <p class="hero-lead">Welcome to my homepage.</p>
        </div>
        <div class="profile-wrap">
          <img class="profile" alt="Portrait of Mahatru Guddamsetty" src="https://cdn.builder.io/api/v1/image/assets%2F166dddead05c4bf08f1c0443c8d59ac8%2F666a25e13e0347d5a4143974ab722c13?format=webp&width=800" />
        </div>
      </section>
      <section class="section-panel" style="margin-top: 28px;">
        <h2 class="section-title"><span class="type-text" data-type-text=">about me">&gt;about me</span></h2>
        <p class="hero-lead">Hi! My name is Mahatru Guddamsetty, and I currently study electrical engineering as a sophomore at University of California, Riverside (UCR). I'm a dedicated person, and always open to any internship or research opportunity. I aim to pursue future technical electives and research within VLSI design, embedded systems, and quantum computing.</p>
      </section>
    </main>
  </div>`;
  return renderTemplate({ activePath: '/', bodyHtml });
}

function renderSimple(title, path) {
  const bodyHtml = `
  <main class="page">
    <h1 class="section-title"><span class="type-text" data-type-text="${title}">${title}</span></h1>
    <div class="section-panel">${title} page</div>
  </main>`;
  return renderTemplate({ activePath: path, bodyHtml });
}

// Routes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.type('html').send(renderHome());
});

app.get('/publications', (req, res) => {
  res.type('html').send(renderSimple('>publications', '/publications'));
});

app.get('/cv', (req, res) => {
  res.type('html').send(renderSimple('>cv', '/cv'));
});

app.get('/teaching', (req, res) => {
  res.type('html').send(renderSimple('>teaching', '/teaching'));
});

app.get('/notes', (req, res) => {
  res.type('html').send(renderSimple('>notes', '/notes'));
});

app.get('/research', (req, res) => {
  res.type('html').send(renderSimple('>research', '/research'));
});

// 404
app.use((req, res) => {
  res.status(404).type('html').send(renderSimple('Not Found', ''));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
