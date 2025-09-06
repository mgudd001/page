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
    return `<a class="nav-link${isActive ? ' is-active' : ''}" href="${p.path}">${p.label}</a>`;
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

    .site-header { position: sticky; top: 0; z-index: 50; backdrop-filter: saturate(1.2) blur(8px); background: color-mix(in oklab, var(--bg) 88%, transparent); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1024px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; gap: 16px; }
    .primary-nav { display: flex; gap: 16px; align-items: center; }
    .nav-link { color: var(--muted); text-decoration: none; text-transform: lowercase; padding: 6px 8px; border-radius: 8px; transition: color .2s ease, background .2s ease; }
    .nav-link:hover { color: var(--fg); background: var(--panel); }
    .nav-link.is-active { color: var(--fg); font-weight: 600; }
    .spacer { flex: 1 1 auto; }
    .toggle-btn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 10px; background: var(--panel); color: var(--fg); cursor: pointer; }
    .toggle-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    .page { max-width: 1024px; margin: 0 auto; padding: 32px 20px 56px; }
    .hero { display: grid; grid-template-columns: 1.25fr 1fr; align-items: center; gap: 28px; }
    .hero-title { margin: 0 0 10px; font-size: 40px; line-height: 1.1; }
    .hero-lead { margin: 0; color: var(--muted); font-size: 16px; }
    .profile-wrap { display: grid; place-items: center; }
    .profile { width: 220px; height: 220px; border-radius: 18px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.35); border: 4px solid var(--panel); }

    .section-title { margin: 0 0 12px; font-size: 28px; }
    .section-panel { border: 1px solid var(--border); background: var(--panel); border-radius: 14px; padding: 18px; }

    /* Custom cursor */
    .cursor-canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483647; }
    body.hide-native-cursor, body.hide-native-cursor * { cursor: none !important; }

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

    // Enhanced glossy chrome cursor with smoother trail and click pulse
    (function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var coarse = window.matchMedia('(pointer: coarse)').matches;
      if (reduce || coarse) return;

      var canvas = document.createElement('canvas');
      canvas.className = 'cursor-canvas';
      document.body.appendChild(canvas);
      document.body.classList.add('hide-native-cursor');
      var ctx = canvas.getContext('2d');

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      function resize(){
        var w = window.innerWidth, h = window.innerHeight;
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      var mouseX = -100, mouseY = -100;
      var currX = mouseX, currY = mouseY;
      var trail = [];
      var maxTrail = 28; // longer for smoothness
      var baseRadius = 12; // slightly larger
      var follow = 0.22; // easing towards the mouse

      var clickT = 1; // 1 = idle; animates 0->1 on click
      var ripples = [];
      var last = performance.now();

      function chromeGrad(x, y, r){
        var g = ctx.createRadialGradient(x - r*0.35, y - r*0.35, r*0.1, x, y, r);
        g.addColorStop(0.0, 'rgba(255,255,255,1)');
        g.addColorStop(0.35, 'rgba(240,248,255,0.95)');
        g.addColorStop(0.7, 'rgba(200,220,255,0.55)');
        g.addColorStop(1.0, 'rgba(170,190,235,0)');
        return g;
      }

      function glossyDot(x, y, r, a, blur){
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (blur > 0) ctx.filter = 'blur(' + blur + 'px)';
        ctx.globalAlpha = a;
        ctx.fillStyle = chromeGrad(x, y, r);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // specular highlight
        var rx = r * 0.55, ry = r * 0.55;
        var hx = x - r * 0.35, hy = y - r * 0.35;
        var grad = ctx.createRadialGradient(hx, hy, r*0.05, hx, hy, r*0.8);
        grad.addColorStop(0, 'rgba(255,255,255,0.9)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(hx, hy, rx*0.45, ry*0.35, -0.6, 0, Math.PI * 2);
        ctx.fill();
        // subtle rim
        ctx.lineWidth = Math.max(1, r * 0.12);
        ctx.strokeStyle = 'rgba(180,200,255,0.35)';
        ctx.beginPath();
        ctx.arc(x, y, r - ctx.lineWidth * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      function frame(now){
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ease towards mouse
        currX += (mouseX - currX) * follow;
        currY += (mouseY - currY) * follow;
        trail.unshift({ x: currX, y: currY });
        if (trail.length > maxTrail) trail.pop();

        if (clickT < 1) clickT = Math.min(1, clickT + dt * 3.2);
        var headScale = 1 + 0.5 * Math.sin(clickT * Math.PI); // expand -> shrink

        // draw trail tail -> head for layering, with smoother blur
        for (var i = trail.length - 1; i >= 0; i--) {
          var p = trail[i];
          var t = i / (maxTrail - 1);
          var r = baseRadius * (1.05 - t * 0.6) * (i === 0 ? headScale : 1);
          var a = 0.32 * (1 - t);
          var blur = 8 * t; // more blur on the tail
          glossyDot(p.x, p.y, r, a, blur);
        }

        // ripples
        for (var k = ripples.length - 1; k >= 0; k--) {
          var rp = ripples[k];
          rp.t += dt * 2.2;
          var alpha = 0.35 * (1 - rp.t);
          if (alpha <= 0) { ripples.splice(k, 1); continue; }
          var rr = baseRadius * (1 + rp.t * 6);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = 'rgba(200,220,255,' + alpha + ')';
          ctx.lineWidth = 2;
          ctx.filter = 'blur(1px)';
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        requestAnimationFrame(frame);
      }

      window.addEventListener('mousemove', function(e){
        mouseX = e.clientX; mouseY = e.clientY;
      }, { passive: true });
      window.addEventListener('mouseleave', function(){
        mouseX = -100; mouseY = -100; trail.length = 0;
      });
      window.addEventListener('mousedown', function(e){
        if (e.button !== 0) return;
        clickT = 0; // start pulse
        ripples.push({ x: mouseX, y: mouseY, t: 0 });
      });

      requestAnimationFrame(frame);
    })();
  </script>
</body>
</html>`;
}

function renderHome() {
  const bodyHtml = `
  <main class="page">
    <section class="hero">
      <div>
        <h1 class="hero-title">Mahatru Guddamsetty</h1>
        <p class="hero-lead">Welcome to my homepage.</p>
      </div>
      <div class="profile-wrap">
        <img class="profile" alt="Portrait of Mahatru Guddamsetty" src="https://cdn.builder.io/api/v1/image/assets%2F166dddead05c4bf08f1c0443c8d59ac8%2F666a25e13e0347d5a4143974ab722c13?format=webp&width=800" />
      </div>
    </section>
    <section class="section-panel" style="margin-top: 28px;">
      <h2 class="section-title">&gt;about me</h2>
      <p class="hero-lead">Hi! My name is Mahatru Guddamsetty, and I currently study electrical engineering as a sophomore at University of California, Riverside (UCR). I'm a dedicated person, and always open to any internship or research opportunity. I aim to pursue future technical electives and research within VLSI design, embedded systems, and quantum computing.</p>
    </section>
  </main>`;
  return renderTemplate({ activePath: '/', bodyHtml });
}

function renderSimple(title, path) {
  const bodyHtml = `
  <main class="page">
    <h1 class="section-title">${title}</h1>
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
  res.type('html').send(renderSimple('Publications', '/publications'));
});

app.get('/cv', (req, res) => {
  res.type('html').send(renderSimple('CV', '/cv'));
});

app.get('/teaching', (req, res) => {
  res.type('html').send(renderSimple('Teaching', '/teaching'));
});

app.get('/notes', (req, res) => {
  res.type('html').send(renderSimple('Notes', '/notes'));
});

app.get('/research', (req, res) => {
  res.type('html').send(renderSimple('Research', '/research'));
});

// 404
app.use((req, res) => {
  res.status(404).type('html').send(renderSimple('Not Found', ''));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
