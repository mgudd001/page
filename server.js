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
  { path: '/cv', label: '>cv' }
];

function renderTemplate({ activePath = '/', bodyHtml = '' }) {
  const navLinks = PAGES.map(p => {
    const isActive = p.path === activePath;
    return `<a class="nav-link${isActive ? ' is-active' : ''}" href="${p.path}"><span class="type-text" data-type-text="${p.label}">${p.label}</span></a>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mahatru Guddamsetty</title>
  <meta name="color-scheme" content="dark light" />
  <style>
    :root { --bg: #ffffff; --fg: #0b1020; --muted: #4b5563; --accent: #0f62fe; --panel: rgba(15,98,254,0.05); --border: rgba(0,0,0,0.1); }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: var(--bg); color: var(--fg); }

    .site-header { position: sticky; top: 0; z-index: 5; backdrop-filter: saturate(1.2) blur(8px); background: color-mix(in oklab, var(--bg) 88%, transparent); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1024px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; gap: 16px; }
    .primary-nav { display: flex; gap: 16px; align-items: center; }
    .nav-link { color: var(--muted); text-decoration: none; text-transform: lowercase; padding: 6px 8px; border-radius: 8px; transition: color .2s ease, background .2s ease, box-shadow .2s ease, border-color .2s ease, backdrop-filter .2s ease; position: relative; overflow: hidden; border: 1px solid transparent; }
    .nav-link:hover { color: var(--fg); background: var(--panel); border-color: var(--border); backdrop-filter: blur(8px) saturate(1.05); box-shadow: 0 4px 16px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.08); }
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
    .about-panel { margin-top: 28px; }
    .about-panel:hover { background: var(--panel); border-color: var(--border); backdrop-filter: blur(8px) saturate(1.05); -webkit-backdrop-filter: blur(8px) saturate(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.06); }
    .glass-follow { position: relative; overflow: hidden; backdrop-filter: blur(12px) saturate(1.15); -webkit-backdrop-filter: blur(12px) saturate(1.15); background: color-mix(in oklab, var(--panel) 92%, transparent); }
    .glass-follow::before { content: ""; position: absolute; inset: -40%; background: radial-gradient(140px 140px at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.20), rgba(255,255,255,0) 60%); opacity: 0; transition: opacity .25s ease; mix-blend-mode: screen; pointer-events: none; }
    .glass-follow:hover::before { opacity: 1; }
    .primary-nav .nav-link { position: relative; overflow: hidden; }
    .primary-nav .nav-link::before { content: ""; position: absolute; inset: -40%; background: radial-gradient(80px 80px at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.2), rgba(255,255,255,0) 60%); opacity: 0; transition: opacity .25s ease; pointer-events: none; mix-blend-mode: screen; }
    .primary-nav .nav-link:hover::before { opacity: 1; }

    /* Background bokeh for home */
    .bokeh-canvas { position: fixed; inset: -240px; z-index: 0; pointer-events: none; filter: blur(26px); opacity: 0.72; }

    .type-fade-letter { opacity: 0; animation: type-fade .28s ease-out forwards; }
    @keyframes type-fade { from { opacity: 0; } to { opacity: 1; } }

    /* CSS custom cursor: white glow dot with click pulse */
    body.use-custom-cursor, body.use-custom-cursor * { cursor: none; }
    .cursor-dot { position: fixed; left: 0; top: 0; width: 8px; height: 8px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 10px rgba(255,255,255,0.9), 0 0 26px rgba(255,255,255,0.7); pointer-events: none; transform: translate(-50%,-50%) scale(1); transition: transform 80ms ease, opacity 120ms ease; will-change: transform; z-index: 100; mix-blend-mode: screen; }
    @keyframes cursor-click { 0% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.8); } 100% { transform: translate(-50%,-50%) scale(1); } }
    .cursor-dot.is-clicking { animation: cursor-click 260ms ease-out; }

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
    </div>
  </header>
  <canvas id="bokeh" class="bokeh-canvas"></canvas>
  ${bodyHtml}
  <script>

    // Enable CSS custom cursor on non-touch and non-reduced-motion
    (function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var coarse = window.matchMedia('(pointer: coarse)').matches;
      if (!reduce && !coarse) {
        document.body.classList.add('use-custom-cursor');
        var dot = document.createElement('div');
        dot.className = 'cursor-dot';
        document.body.appendChild(dot);
        window.addEventListener('mousemove', function(e){
          dot.style.left = e.clientX + 'px';
          dot.style.top = e.clientY + 'px';
        }, { passive: true });
        window.addEventListener('mousedown', function(){ dot.classList.add('is-clicking'); });
        dot.addEventListener('animationend', function(){ dot.classList.remove('is-clicking'); });
      }
    })();

    // Typewriter utility
    (function(){
      function type(el, full, opts){
        if (!el) return Promise.resolve();
        var o = Object.assign({ startDelay: 160, minDelay: 22, accel: 0.9, fadeMs: 280 }, opts || {});
        el.innerHTML = '';
        return new Promise(function(resolve){
          var i = 0;
          var delay = o.startDelay;
          function step(){
            var span = document.createElement('span');
            span.className = 'type-fade-letter';
            span.textContent = full.charAt(i);
            span.style.animationDuration = o.fadeMs + 'ms';
            el.appendChild(span);
            i++;
            if (i < full.length) {
              delay = Math.max(o.minDelay, delay * o.accel);
              setTimeout(step, delay);
            } else {
              resolve();
            }
          }
          step();
        });
      }

      function setupTypeTargets(root){
        var targets = Array.from(root.querySelectorAll('.type-text'));
        targets.forEach(function(t){
          var txt = t.getAttribute('data-type-text') || t.textContent;
          t.setAttribute('data-type-text', txt);
          t.addEventListener('click', function(e){ type(t, txt); });
        });
        return targets;
      }

      var all = setupTypeTargets(document);
      var hero = document.querySelector('.hero-title');
      if (hero) {
        hero.setAttribute('data-type-text', hero.textContent);
        hero.addEventListener('click', function(){ type(hero, hero.getAttribute('data-type-text')); });
      }
      var about = document.querySelector('.section-title');
      if (about) {
        about.setAttribute('data-type-text', about.textContent);
        about.addEventListener('click', function(){ type(about, about.getAttribute('data-type-text')); });
      }

      var first = !sessionStorage.getItem('typed_once');
      if (first) {
        (async function(){
          for (var i=0;i<all.length;i++) { await type(all[i], all[i].getAttribute('data-type-text')); }
          if (hero) await type(hero, hero.getAttribute('data-type-text'));
          if (about) await type(about, about.getAttribute('data-type-text'));
          sessionStorage.setItem('typed_once', '1');
        })();
      }
    })();

    // Liquid follow highlight for glass panels and nav links
    (function(){
      function attach(el){
        el.addEventListener('mousemove', function(e){
          var r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
        el.addEventListener('mouseleave', function(){
          el.style.removeProperty('--mx');
          el.style.removeProperty('--my');
        });
      }
      var els = document.querySelectorAll('.glass-follow, .primary-nav .nav-link');
      els.forEach(attach);
    })();

    // Bokeh glowy background across site (pink, orange, red, white)
    (function(){
      var c = document.getElementById('bokeh');
      if (!c) return;
      var ctx = c.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pad = 260;
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
      var COLORS = ['#ff7ab3', '#ff9a3c', '#ff4d4d', '#ffffff'];
      for (var i=0;i<22;i++){
        blobs.push({
          x: Math.random()* (window.innerWidth + pad*2) - pad,
          y: Math.random()* (window.innerHeight + pad*2) - pad,
          r: 130 + Math.random()*200,
          vx: (Math.random()*2-1) * 0.32,
          vy: (Math.random()*2-1) * 0.32,
          c: COLORS[i % COLORS.length]
        });
      }

      function draw(){
        ctx.clearRect(-pad,-pad, window.innerWidth + pad*2, window.innerHeight + pad*2);
        ctx.globalCompositeOperation = 'lighter';
        for (var i=0;i<blobs.length;i++){
          var b = blobs[i];
          b.x += b.vx; b.y += b.vy;
          if (b.x < -pad-250 || b.x > window.innerWidth + pad + 250) b.vx *= -1;
          if (b.y < -pad-250 || b.y > window.innerHeight + pad + 250) b.vy *= -1;
          var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          g.addColorStop(0, b.c + 'f2');
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
    <main class="page">
      <section class="hero">
        <div>
          <h1 class="hero-title"><span class="type-text" data-type-text=">MAHATRU GUDDAMSETTY">&gt;MAHATRU GUDDAMSETTY</span></h1>
          <p class="hero-lead">Welcome to my website.</p>
        </div>
        <div class="profile-wrap">
          <img class="profile" alt="Portrait of Mahatru Guddamsetty" src="https://cdn.builder.io/api/v1/image/assets%2F166dddead05c4bf08f1c0443c8d59ac8%2F666a25e13e0347d5a4143974ab722c13?format=webp&width=800" />
        </div>
      </section>
      <section class="section-panel about-panel">
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


app.get('/cv', (req, res) => {
  res.type('html').send(renderSimple('>cv', '/cv'));
});




// 404
app.use((req, res) => {
  res.status(404).type('html').send(renderSimple('Not Found', ''));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
