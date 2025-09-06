const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root route with a simple HTML page
app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>App is Running</title>
  <style>
    :root { --bg: #0b1020; --fg: #e6eefc; --accent: #3b82f6; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: var(--bg); color: var(--fg); display: grid; place-items: center; height: 100vh; }
    .container { text-align: center; padding: 24px; border-radius: 16px; background: rgba(255,255,255,0.06); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .title { margin: 0 0 8px; font-size: 28px; }
    .subtitle { margin: 0 0 16px; color: rgba(230,238,252,0.8); }
    .status { display: inline-block; padding: 8px 12px; border-radius: 999px; background: rgba(59,130,246,0.15); color: var(--accent); font-weight: 600; }
    .links { margin-top: 16px; font-size: 14px; opacity: 0.9; }
    a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <main class="container">
    <h1 class="title">Server online</h1>
    <p class="subtitle">Your app environment is now functional.</p>
    <span class="status">Listening on port ${PORT}</span>
    <div class="links">Health check: <a href="/healthz">/healthz</a></div>
  </main>
</body>
</html>`);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
