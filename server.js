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
    :root { --bg: #000000; --fg: #e8eefc; --muted: #a9b8d6; --accent: #3b82f6; --panel: rgba(255,255,255,0.08); --border: rgba(255,255,255,0.16); }
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
    .group-header { margin: 28px 0 8px; font-size: 22px; font-weight: 700; color: var(--fg); opacity: 0.9; }
    /* Per-box subtle glow */
    .section-panel, .cv-item { position: relative; isolation: isolate; z-index: 1; overflow: hidden; }
    .section-panel::before, .cv-item::before { content: ""; position: absolute; z-index: -1; inset: 0; border-radius: inherit; pointer-events: none; background:
      radial-gradient(220px 160px at 18% 28%, rgba(255,154,67,0.28), rgba(255,154,67,0) 40%),
      radial-gradient(200px 160px at 82% 72%, rgba(255,122,179,0.24), rgba(255,122,179,0) 40%),
      radial-gradient(160px 160px at 50% 50%, rgba(255,255,255,0.12), rgba(255,255,255,0) 40%);
      filter: blur(16px);
      opacity: 1;
    }
    .box-bokeh { position: absolute; inset: 0; pointer-events: none; filter: blur(18px); opacity: .55; z-index: 0; }
    .cv-list { display: grid; gap: 16px; margin-top: 16px; }
    .cv-item { border: 1px solid var(--border); background: var(--panel); border-radius: 14px; padding: 16px; }
    .cv-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 8px; }
    .cv-role { font-weight: 700; }
    .cv-org { font-style: italic; color: var(--muted); }
    .cv-dates { color: var(--muted); white-space: nowrap; }
    .cv-points { margin: 8px 0 0; padding-left: 20px; }
    /* CV styles */
    .cv-list { display: grid; gap: 16px; margin-top: 16px; }
    .cv-item { border: 1px solid var(--border); background: var(--panel); border-radius: 14px; padding: 16px; }
    .cv-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 8px; }
    .cv-role { font-weight: 700; }
    .cv-org { font-style: italic; color: var(--muted); }
    .cv-dates { color: var(--muted); white-space: nowrap; }
    .cv-points { margin: 8px 0 0; padding-left: 20px; }
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
    .bokeh-canvas { display: none !important; }

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
      var heroSpan = document.querySelector('.hero-title .type-text');
      var heroTyping = false;
      if (heroSpan) {
        var heroText = '>MAHATRU GUDDAMSETTY.';
        heroSpan.setAttribute('data-type-text', heroText);
        heroSpan.textContent = heroText;
        function retrigger(){ if (heroTyping) return; heroTyping = true; type(heroSpan, heroText).then(function(){ heroTyping = false; }); }
        heroSpan.addEventListener('mouseenter', retrigger);
        heroSpan.addEventListener('click', retrigger);
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
          if (heroSpan) await type(heroSpan, heroSpan.getAttribute('data-type-text'));
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

    // Moving per-box bokeh glow inside rounded boxes
    (function(){
      var COLORS = ['#ff7ab3','#ff9a3c','#ffffff','#ff4d4d','#ffd1a6'];
      function init(el){
        var c = document.createElement('canvas');
        c.className = 'box-bokeh';
        el.insertBefore(c, el.firstChild);
        var ctx = c.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        function size(){ var w = el.clientWidth, h = el.clientHeight; c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr); c.style.width = w+'px'; c.style.height = h+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
        size();
        var ro = new ResizeObserver(size); ro.observe(el);
        var blobs = [];
        for (var i=0;i<6;i++) blobs.push({ x: Math.random()*el.clientWidth, y: Math.random()*el.clientHeight, r: 60+Math.random()*110, vx:(Math.random()*2-1)*0.28, vy:(Math.random()*2-1)*0.28, c: COLORS[i%COLORS.length] });
        function draw(){
          var w = el.clientWidth, h = el.clientHeight; ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation='lighter';
          for (var i=0;i<blobs.length;i++){ var b=blobs[i]; b.x+=b.vx; b.y+=b.vy; if (b.x < -40 || b.x > w+40) b.vx*=-1; if (b.y < -40 || b.y > h+40) b.vy*=-1; var g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r); g.addColorStop(0, b.c + 'cc'); g.addColorStop(1, b.c + '00'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }
          requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
      }
      document.querySelectorAll('.section-panel, .cv-item').forEach(init);
    })();

    // Bokeh glowy background across site (pink, orange, red, white)
    (function(){
      var c = document.getElementById('bokeh');
      if (!c) return;
      var ctx = c.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var pad = 800;
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
      for (var i=0;i<26;i++){
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
          if (b.x < -pad-350 || b.x > window.innerWidth + pad + 350) b.vx *= -1;
          if (b.y < -pad-350 || b.y > window.innerHeight + pad + 350) b.vy *= -1;
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
    <main class="page">
      <section class="hero">
        <div>
          <h1 class="hero-title"><span class="type-text" data-type-text=">MAHATRU GUDDAMSETTY.">&gt;MAHATRU GUDDAMSETTY.</span></h1>
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

function renderCV() {
  const bodyHtml = `
  <main class="page">
    <h1 class="section-title"><span class="type-text" data-type-text=">cv">&gt;cv</span></h1>

    <h2 class="group-header">Education</h2>
    <div class="cv-list">
      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">University of California, Riverside</span> • <span class="cv-org">Bachelor of Science – BS, Electrical Engineering</span></div>
          <div class="cv-dates">2024</div>
        </div>
        <ul class="cv-points">
          <li>Grade: 3.80/4.00</li>
          <li>EE 010 - Introduction to Electrical Engineering</li>
          <li>EE 016 - Data Analysis for Engineering Applications</li>
          <li>EE 020A / MATH 045 - Introduction to Ordinary Differential Equations</li>
          <li>EE 020B / MATH 031 - Linear Algebra + MATLAB</li>
          <li>EE 030A, EE 030LA - Fundamental Electric Circuits I and Lab</li>
          <li>CS 010A - C++ Programming I</li>
          <li>CS 010B - C++ Programming II</li>
          <li>CS 061 - Machine Organization and Assembly Language Programming</li>
          <li>MATH 009B - Calculus II (Integral)</li>
          <li>MATH 009C - Calculus II (Series, Sequences, Parametrics)</li>
          <li>MATH 010A - Multivariable Calculus III</li>
          <li>MATH 010B - Multivariable Calculus III</li>
          <li>PHYS 040A, PHYS 040LA - General Physics I and Lab (Mechanics)</li>
          <li>PHYS 040B, PHYS 040LB - General Physics II and Lab (Thermodynamics)</li>
          <li>PHYS 040C, PHYS 040LC - General Physics III and Lab (Electricity and Magnetism)</li>
          <li>CHEM 001A, CHEM 001LA - General Chemistry I and Lab</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">West Valley College</span> • <span class="cv-org">Dual Enrollment</span></div>
          <div class="cv-dates">Aug 2022 → Dec 2022</div>
        </div>
        <ul class="cv-points">
          <li>Grade: 4.00/4.00</li>
          <li>CIST004A1 Computer Programming I – Java, CIST005A Computer Programming I – Python</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">External Coursework</span> • <span class="cv-org">Indian Institute of Technology, Kharagpur</span></div>
          <div class="cv-dates">Jul 2025</div>
        </div>
        <ul class="cv-points">
          <li>CS 21002 / CS 29002 Switching Circuits and Logic Design and Laboratory</li>
        </ul>
      </section>
    </div>

    <h2 class="group-header">Experience</h2>
    <div class="cv-list">
      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Advanced VLSI Design Trainee</span> • <span class="cv-org">VLSI-G Institute at IIT Kharagpur</span></div>
          <div class="cv-dates">Jul 2025 → Present</div>
        </div>
        <ul class="cv-points">
          <li>Developing register-transfer level designs in Verilog by applying multiple modeling styles (structural, dataflow, behavioral) for digital subsystems.</li>
          <li>Designing and verifying synchronous/asynchronous FIFO buffers, SPI/I2C interfaces, interrupt controllers, dual-port RAM, parameterized memory, and watchdog timers.</li>
          <li>Creating finite state machines and pattern detectors using overlapping, non-overlapping, and dynamic detection methods.</li>
          <li>Building comprehensive testbenches with clock generation, duty cycle, and jitter variations; conducted simulations in ModelSim and Synopsys VCS.</li>
          <li>Executing verification workflows with waveform debugging and validation methodologies to ensure functional correctness of complex digital designs.</li>
          <li>Took CS21002: Switching Circuits and Logic Design through IIT Kharagpur for foundational knowledge.</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Electrical Subsystems Intern</span> ��� <span class="cv-org">Highlander Racing, University of California, Riverside</span></div>
          <div class="cv-dates">Jun 2025 → Present</div>
        </div>
        <ul class="cv-points">
          <li>Designed and implemented a high-side switch for inductive loads using IRL540N MOSFET and IRS2005 gate driver, ensuring protection with flyback diodes and optimized switching.</li>
          <li>Developed proficiency in PCB Design with Altium Designer, including schematic creation, component placement, and bill of materials utilization.</li>
          <li>Applied PCB layout techniques with proper design rules for signal integrity and clean routing.</li>
          <li>Integrated component sourcing and supply chain considerations into PCB fabrication workflow.</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Hardware/Software Intern</span> • <span class="cv-org">UCR VexU Robotics (Ursa Mechanica)</span></div>
          <div class="cv-dates">Jan 2025 → May 2025</div>
        </div>
        <ul class="cv-points">
          <li>Programmed and developed autonomous functions in C++ for real-time navigation, sensor-based object detection, and game-piece manipulation.</li>
          <li>Optimized motion control for improved scoring efficiency during competition matches.</li>
          <li>Earned Second Place at California State University, Northridge: High Stakes VEX V5 Competition against 14 universities.</li>
          <li>Qualified for and participated in 2025 VEXU World Championships (Dallas, TX), competing against ~50 international universities.</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Machine Learning Researcher</span> • <span class="cv-org">Inspirit AI + X</span></div>
          <div class="cv-dates">Jul 2023 → Aug 2023</div>
        </div>
        <ul class="cv-points">
          <li>Published research on using machine learning to improve the accuracy of sentiment analysis on e-commerce reviews under mentorship of an MIT CS Graduate on Curieux Academic Journal (Issue #33).</li>
          <li>Programmed a refined version of RoBERTa, achieving higher efficiency than lexicon-based approaches.</li>
          <li>Deployed models in Paperspace using TensorFlow, WandB, PyTorch, and gradient notebooks.</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Mechatronics/Electromechanics Developer</span> • <span class="cv-org">Northwestern University</span></div>
          <div class="cv-dates">Jul 2023 → Aug 2023</div>
        </div>
        <ul class="cv-points">
          <li>Built and programmed an autonomous mobile robot with microcontrollers, sensors, actuators, and CAD-designed hardware for movement and block detection.</li>
          <li>Designed and tested multiple subsystems: control algorithms, sensor data processing, and integrated feedback loops.</li>
          <li>Produced PCB layouts, wiring diagrams, Fusion 360 design files, and documentation for fabrication and testing.</li>
        </ul>
      </section>

      <section class="cv-item">
        <div class="cv-header">
          <div><span class="cv-role">Human-Computer Interaction Designer</span> • <span class="cv-org">Stanford University</span></div>
          <div class="cv-dates">Jun 2023 → Jun 2023</div>
        </div>
        <ul class="cv-points">
          <li>Wrote multiple papers on HCI topics including user-centered design, prototyping techniques, and usability evaluation.</li>
          <li>Created low-fidelity and high-fidelity prototypes based on user feedback.</li>
          <li>Explored applications of HCI in VR/AR, AI, and healthcare/education technologies.</li>
          <li>Developed a stress management app with a wearable prototype, presenting to a panel of judges.</li>
        </ul>
      </section>
    </div>
  </main>`;
  return renderTemplate({ activePath: '/cv', bodyHtml });
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
  res.type('html').send(renderCV());
});




// 404
app.use((req, res) => {
  res.status(404).type('html').send(renderSimple('Not Found', ''));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
