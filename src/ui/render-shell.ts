export function renderShell(activeView: 'home' | 'settings' | 'status'): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AmaLink Nomi — Workspace Bridge</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%237c3aed'/%3E%3Cpath d='M12 4l6 3v5c0 4-3 7-6 8-3-1-6-4-6-8V7l6-3z' fill='white'/%3E%3C/svg%3E">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        color-scheme: dark;
        --bg: #07080b;
        --surface: rgba(17, 20, 28, 0.82);
        --surface-strong: rgba(24, 27, 36, 0.94);
        --sidebar-bg: rgba(9, 11, 16, 0.84);
        --accent: #7c3aed;
        --accent-glow: rgba(124, 58, 237, 0.22);
        --accent-secondary: #14b8a6;
        --text-primary: #ffffff;
        --text-secondary: #a7adbb;
        --glass: rgba(255, 255, 255, 0.045);
        --glass-border: rgba(255, 255, 255, 0.105);
        --glass-hover: rgba(255, 255, 255, 0.075);
        --danger: #ef4444;
        --success: #10b981;
        --warning: #f59e0b;
        --font-main: 'Outfit', system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --sidebar-width: 280px;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: var(--font-main);
        background:
          linear-gradient(180deg, #0b0d12 0%, #06070a 48%, #090b0d 100%);
        color: var(--text-primary);
        line-height: 1.6;
        min-height: 100vh;
        overflow: hidden;
        display: flex;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background:
          linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(135deg, rgba(20, 184, 166, 0.11), transparent 34%),
          linear-gradient(315deg, rgba(124, 58, 237, 0.12), transparent 36%);
        background-size: 44px 44px, 44px 44px, auto, auto;
      }

      .app-shell { display: flex; width: 100%; height: 100vh; }

      /* Sidebar */
      aside.sidebar {
        width: var(--sidebar-width);
        background: var(--sidebar-bg);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-right: 1px solid var(--glass-border);
        display: flex;
        flex-direction: column;
        padding: 2rem 1.25rem;
        z-index: 100;
      }

      .logo-area { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 2.75rem; padding-left: 0.45rem; }
      .logo-icon {
        width: 40px; height: 40px;
        background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
        border-radius: 10px; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 8px 20px var(--accent-glow);
      }
      .logo-text { font-size: 1.32rem; font-weight: 800; color: #fff; }

      nav { display: flex; flex-direction: column; gap: 0.5rem; }
      nav a {
        text-decoration: none; color: var(--text-secondary);
        padding: 0.85rem 1rem; border-radius: 10px;
        font-weight: 600; font-size: 0.95rem;
        transition: all 0.2s ease; display: flex; align-items: center; gap: 0.85rem;
        border: 1px solid transparent;
      }
      nav a:hover { color: var(--text-primary); background: var(--glass-hover); transform: translateX(2px); }
      nav a[data-active="true"] { color: var(--text-primary); background: rgba(255, 255, 255, 0.08); border-color: var(--glass-border); box-shadow: inset 3px 0 0 var(--accent-secondary); }
      nav a svg { width: 20px; height: 20px; opacity: 0.6; }
      nav a[data-active="true"] svg { opacity: 1; color: var(--accent-secondary); }

      .user-panel {
        margin-top: auto; padding: 1.25rem;
        background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px;
        display: flex; flex-direction: column; gap: 1rem;
      }
      .user-info { display: flex; align-items: center; gap: 0.75rem; }
      .avatar {
        width: 34px; height: 34px; background: var(--accent); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
      }
      #session-email { font-size: 0.85rem; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* Content Area */
      main.content { flex: 1; overflow-y: auto; padding: 3rem 4.5rem; display: flex; flex-direction: column; gap: 2.5rem; }

      .view-header { margin-bottom: 1rem; }
      .view-header h1 { font-size: 2.55rem; font-weight: 800; margin-bottom: 0.5rem; }
      .view-header p { color: var(--text-secondary); font-size: 1.1rem; }
      .view { animation: viewIn 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes viewIn {
        from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0); filter: blur(0); }
      }

      /* Grid & Cards */
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
      .card {
        background: var(--surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--glass-border); border-radius: 14px; padding: 1.75rem;
        position: relative; overflow: hidden;
        box-shadow: 0 22px 70px rgba(0, 0, 0, 0.26);
      }
      .card-label {
        font-size: 0.75rem; font-weight: 800; color: var(--text-secondary);
        text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .card-value { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
      .card-subtext { font-size: 0.875rem; color: var(--text-secondary); }
      .section-card { margin-top: 2rem; }
      .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
      .hint-box {
        margin-top: 2rem; padding: 1.25rem;
        background: rgba(20, 184, 166, 0.07);
        border: 1px solid rgba(20, 184, 166, 0.14);
        border-radius: 12px;
      }
      .endpoint-row {
        padding: 1rem 1.1rem;
        background: rgba(0, 0, 0, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        margin: 1rem 0;
        font-family: var(--font-mono);
        color: var(--accent-secondary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .endpoint-row code { overflow-wrap: anywhere; }

      .badge { padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
      .badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
      .badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }

      /* Checklist */
      .checklist { display: flex; flex-direction: column; gap: 1rem; }
      .check-item {
        display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem;
        border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid transparent;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .check-item[data-done="true"] { border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.04); }
      .check-circle {
        width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--glass-border);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .check-item[data-done="true"] .check-circle { background: var(--success); border-color: var(--success); }
      .check-circle svg { width: 14px; height: 14px; display: none; }
      .check-item[data-done="true"] .check-circle svg { display: block; }

      /* Input & Buttons */
      textarea {
        width: 100%; height: 140px; background: rgba(0, 0, 0, 0.38); color: #fff; border: 1px solid var(--glass-border);
        border-radius: 12px; padding: 1.25rem; font-family: var(--font-mono); font-size: 0.95rem;
        margin-top: 1rem; resize: none; transition: 0.2s;
      }
      textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow); }

      .btn {
        cursor: pointer; font-family: inherit; font-weight: 700; padding: 0.92rem 1.35rem; border-radius: 10px;
        border: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; transition: 0.2s;
      }
      .btn-primary { background: var(--accent); color: #fff; }
      .btn-outline { background: transparent; color: #fff; border: 1px solid var(--glass-border); }
      .btn-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.1); }
      .btn:hover { transform: translateY(-2px); }

      /* Overlays */
      .auth-overlay { position: fixed; inset: 0; background: var(--bg); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
      .auth-card { width: 100%; max-width: 440px; background: var(--surface-strong); backdrop-filter: blur(24px); border: 1px solid var(--glass-border); border-radius: 18px; padding: 3rem; text-align: center; animation: viewIn 0.32s cubic-bezier(0.16, 1, 0.3, 1); }

      .message-toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.35rem; border-radius: 12px; background: #050505; border: 1px solid var(--glass-border); transform: translateY(100px); opacity: 0; transition: 0.4s; z-index: 2000; }
      .message-toast.show { transform: translateY(0); opacity: 1; }

      .hidden { display: none !important; }
      code { font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-secondary); }

      @media (max-width: 900px) {
        body { overflow: auto; }
        .app-shell { min-height: 100vh; height: auto; flex-direction: column; }
        aside.sidebar { width: 100%; position: sticky; top: 0; padding: 1rem; }
        .logo-area { margin-bottom: 1rem; }
        nav { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
        nav a { justify-content: center; gap: 0.45rem; padding: 0.72rem 0.45rem; font-size: 0.78rem; white-space: nowrap; }
        nav a svg { width: 18px; height: 18px; }
        .user-panel { display: none; }
        main.content { padding: 1.5rem; }
        .view-header h1 { font-size: 2rem; }
        .grid { grid-template-columns: 1fr; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
    </style>
  </head>
  <body data-view="${activeView}">
    <!-- Panel for non-authenticated users (hidden by default to avoid flash) -->
    <div id="auth-panel" class="auth-overlay hidden">
      <div class="auth-card">
        <div class="logo-icon" style="margin: 0 auto 2.5rem; width: 60px; height: 60px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">AmaLink Nomi</h2>
        <p style="color: var(--text-secondary); margin-bottom: 3rem;">Connect your AI workspace via this universal gateway.</p>
        <div style="display: grid; gap: 1rem;">
          <button id="github-login" class="btn btn-primary">Continue with GitHub</button>
          <button id="google-login" class="btn btn-outline">Continue with Google</button>
        </div>
      </div>
    </div>

    <!-- Main App Container (hidden by default to avoid flash) -->
    <div id="app-container" class="app-shell hidden">
      <aside class="sidebar">
        <div class="logo-area">
          <div class="logo-icon">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span class="logo-text">AmaLink</span>
        </div>
        <nav>
          <a href="/" data-view-link="home" data-active="${activeView === 'home'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="/settings" data-view-link="settings" data-active="${activeView === 'settings'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3v-3.5"/></svg>
            API Setup
          </a>
          <a href="/status" data-view-link="status" data-active="${activeView === 'status'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Health
          </a>
        </nav>
        <div class="user-panel">
          <div class="user-info">
            <div class="avatar" id="user-avatar">?</div>
            <div id="session-email">loading...</div>
          </div>
          <button id="sign-out" class="btn btn-outline" style="padding: 0.6rem; font-size: 0.8rem; width: 100%; border-radius: 12px;">Sign Out</button>
        </div>
      </aside>

      <main class="content">
        <!-- Dashboard -->
        <div id="home-view" class="view hidden">
          <div class="view-header">
            <h1>Dashboard</h1>
            <p>Your workspace bridge status and onboarding overview.</p>
          </div>
          <div class="grid">
            <div class="card">
              <div class="card-label">BRIDGE HEALTH <span id="health-badge" class="badge">...</span></div>
              <div id="summary-bridge-status" class="card-value">UNKNOWN</div>
              <div class="card-subtext">Overall operational status of the gateway.</div>
            </div>
            <div class="card">
              <div class="card-label">CREDENTIALS <span id="key-badge" class="badge">...</span></div>
              <div id="summary-key-status" class="card-value">UNLINKED</div>
              <div class="card-subtext">Nomi API key connection state.</div>
            </div>
          </div>
          <div class="card section-card">
            <div class="card-label">ONBOARDING PROGRESS</div>
            <div class="checklist">
              <div id="step-1" class="check-item"><div class="check-circle"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg></div><div><h4>Authenticate Account</h4><p>Sign in to your secure personal gateway.</p></div></div>
              <div id="step-2" class="check-item"><div class="check-circle"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg></div><div><h4>Link Nomi Workspace</h4><p>Provide your integration key from Nomi settings.</p></div></div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div id="settings-view" class="view hidden">
          <div class="view-header">
            <h1>API Setup</h1>
            <p>Your key is secured with AES-256 encryption before storage.</p>
          </div>
          <div class="card">
            <form id="key-form">
              <div class="card-label">NOMI INTEGRATION KEY</div>
              <textarea id="nomi-key" placeholder="Paste your token here..."></textarea>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Key</button>
                <button id="delete-key" type="button" class="btn btn-danger">Delete Key</button>
              </div>
            </form>
            <div class="hint-box">
               <strong style="color: var(--accent-secondary); font-size: 0.9rem;">Where is my key?</strong>
               <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                 Generate your integration token at <a href="https://beta.nomi.ai/profile/integrations" target="_blank" style="color: var(--accent-secondary); font-weight: 700;">beta.nomi.ai/profile/integrations</a>.
               </p>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div id="status-view" class="view hidden">
          <div class="view-header">
            <h1>Gateway Health</h1>
            <p>Technical diagnostics and MCP connection details.</p>
          </div>
          <div class="grid">
            <div class="card"><div class="card-label">LAST 4 DIGITS</div><div id="last4-value" class="card-value">•••• —</div></div>
            <div class="card"><div class="card-label">LAST VALIDATED</div><div id="validated-value" class="card-value">—</div></div>
          </div>
          <div class="card section-card">
            <div class="card-label">MCP ENDPOINT URL</div>
            <div class="endpoint-row">
              <code id="mcp-endpoint">...</code>
              <button onclick="navigator.clipboard.writeText(document.getElementById('mcp-endpoint').textContent); showToast('Copied!')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.75rem;">Copy</button>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Add this endpoint to your AI client to enable Nomi workspace integration.</p>
          </div>
          <button id="refresh-status" class="btn btn-outline" style="margin-top: 1rem;">Refresh Diagnostics</button>
        </div>
      </main>
    </div>

    <div id="toast" class="message-toast"></div>

    <script type="module">
      import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

      const authPanel = document.getElementById('auth-panel');
      const appContainer = document.getElementById('app-container');
      const homeView = document.getElementById('home-view');
      const settingsView = document.getElementById('settings-view');
      const statusView = document.getElementById('status-view');
      const toast = document.getElementById('toast');
      const viewRoutes = { home: '/', settings: '/settings', status: '/status' };
      const viewTitles = {
        home: 'AmaLink Nomi - Dashboard',
        settings: 'AmaLink Nomi - API Setup',
        status: 'AmaLink Nomi - Gateway Health',
      };
      let activeView = document.body.dataset.view || 'home';

      let client, session;

      async function boot() {
        const config = await (await fetch('/api/public-config')).json();
        client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: {
            flowType: 'pkce',
            detectSessionInUrl: false,
            persistSession: true,
            autoRefreshToken: true,
          },
        });

        await completeRedirect();
        const { data } = await client.auth.getSession();
        session = data.session;

        render(); // Instant render after session check

        client.auth.onAuthStateChange((_, s) => { session = s; render(); if(session) refresh(); });

        document.getElementById('github-login').onclick = () => client.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } });
        document.getElementById('google-login').onclick = () => client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
        document.getElementById('sign-out').onclick = () => client.auth.signOut();
        document.getElementById('refresh-status').onclick = refresh;
        document.querySelectorAll('nav a[data-view-link]').forEach((link) => {
          link.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setActiveView(link.dataset.viewLink, true);
          });
        });
        window.addEventListener('popstate', () => setActiveView(viewFromPath(window.location.pathname), false));

        document.getElementById('key-form').onsubmit = async (e) => {
          e.preventDefault();
          const apiKey = document.getElementById('nomi-key').value.trim();
          if (!apiKey) {
            showToast('Paste a Nomi key first.');
            return;
          }
          const res = await fetch('/api/me/nomi-key', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
            body: JSON.stringify({ apiKey })
          });
          if (res.ok) { showToast('Key saved successfully.'); refresh(); document.getElementById('nomi-key').value = ''; }
          else showToast('Could not save key.');
        };
        document.getElementById('delete-key').onclick = async () => {
          if (!confirm('Delete the stored Nomi key?')) return;
          const res = await fetch('/api/me/nomi-key', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + session.access_token },
          });
          if (res.ok) { showToast('Key deleted.'); refresh(); }
          else showToast('Could not delete key.');
        };

        if (session) refresh();
      }

      function render() {
        const loggedIn = !!session;
        // Logic: Show/Hide whole panels instantly without transitions to avoid blinking
        authPanel.classList.toggle('hidden', loggedIn);
        appContainer.classList.toggle('hidden', !loggedIn);

        if (loggedIn) {
          document.getElementById('session-email').textContent = session.user.email;
          document.getElementById('user-avatar').textContent = (session.user.email?.[0] || 'U').toUpperCase();
          renderViews();
          document.getElementById('step-1').dataset.done = 'true';
        }
      }

      function setActiveView(nextView, push) {
        if (!viewRoutes[nextView]) return;
        activeView = nextView;
        document.body.dataset.view = nextView;
        renderViews();
        document.title = viewTitles[nextView];
        if (push && window.location.pathname !== viewRoutes[nextView]) {
          window.history.pushState({ view: nextView }, '', viewRoutes[nextView]);
        }
        if (nextView === 'status') refresh();
      }

      function renderViews() {
        homeView.classList.toggle('hidden', activeView !== 'home');
        settingsView.classList.toggle('hidden', activeView !== 'settings');
        statusView.classList.toggle('hidden', activeView !== 'status');
        document.querySelectorAll('nav a[data-view-link]').forEach((link) => {
          link.dataset.active = String(link.dataset.viewLink === activeView);
        });
      }

      function viewFromPath(pathname) {
        if (pathname === '/settings') return 'settings';
        if (pathname === '/status') return 'status';
        return 'home';
      }

      async function refresh() {
        if (!session) return;
        try {
          const res = await fetch('/api/me/nomi-key/status', { headers: { 'Authorization': 'Bearer ' + session.access_token } });
          const data = await res.json();
          const isOk = !!data.configured;

          document.getElementById('summary-bridge-status').textContent = isOk ? 'OPERATIONAL' : 'IDLE';
          document.getElementById('summary-key-status').textContent = isOk ? 'CONNECTED' : 'MISSING';
          
          const hBadge = document.getElementById('health-badge');
          hBadge.textContent = isOk ? 'Healthy' : 'Setup Req';
          hBadge.className = 'badge ' + (isOk ? 'badge-success' : 'badge-danger');

          const kBadge = document.getElementById('key-badge');
          kBadge.textContent = isOk ? 'Verified' : 'Unlinked';
          kBadge.className = 'badge ' + (isOk ? 'badge-success' : 'badge-danger');

          document.getElementById('last4-value').textContent = data.last4 ? '•••• ' + data.last4 : '—';
          document.getElementById('validated-value').textContent = data.validatedAt ? new Date(data.validatedAt).toLocaleTimeString() : 'Never';
          document.getElementById('step-2').dataset.done = isOk.toString();
          document.getElementById('mcp-endpoint').textContent = window.location.origin + '/api/mcp';
        } catch(e) { console.error(e); }
      }

      async function completeRedirect() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('code')) {
          await client.auth.exchangeCodeForSession(params.get('code'));
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }

      boot().catch(console.error);
    </script>
  </body>
</html>`;
}
