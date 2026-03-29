export function renderShell(activeView: 'home' | 'settings' | 'status'): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AmaNomiBridge</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        color-scheme: dark;
        --bg: #030712;
        --panel: rgba(17, 24, 39, 0.7);
        --panel-border: rgba(255, 255, 255, 0.08);
        --text-primary: #f9fafb;
        --text-secondary: #9ca3af;
        --accent: #38bdf8;
        --accent-hover: #7dd3fc;
        --accent-glow: rgba(56, 189, 248, 0.2);
        --danger: #ef4444;
        --success: #10b981;
        --card-bg: rgba(31, 41, 55, 0.5);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      * { box-sizing: border-box; transition: all 0.2s ease-in-out; }

      body {
        margin: 0;
        min-height: 100vh;
        background-color: var(--bg);
        background-image: 
          radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 1) 0%, transparent 100%);
        color: var(--text-primary);
        line-height: 1.5;
        overflow-x: hidden;
      }

      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 4rem 1.5rem;
      }

      header {
        text-align: center;
        margin-bottom: 4rem;
        animation: fadeInDown 0.8s ease-out;
      }

      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .logo-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--accent-glow);
        color: var(--accent);
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(56, 189, 248, 0.3);
      }

      h1 {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        font-weight: 800;
        line-height: 1.1;
        margin: 0 0 1.5rem;
        background: linear-gradient(to bottom right, #fff 30%, #94a3b8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.02em;
      }

      p.lead {
        font-size: 1.25rem;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
      }

      nav {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 3rem;
        animation: fadeIn 1s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      nav a {
        text-decoration: none;
        color: var(--text-secondary);
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9375rem;
        border: 1px solid transparent;
        background: transparent;
      }

      nav a:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
      }

      nav a[data-active="true"] {
        color: var(--accent);
        background: var(--panel);
        border-color: var(--panel-border);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .main-grid {
        display: grid;
        gap: 2rem;
        grid-template-columns: 1fr;
        animation: fadeInUp 0.8s ease-out;
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (min-width: 1024px) {
        .main-grid {
          grid-template-columns: 1fr 380px;
        }
      }

      .glass-card {
        background: var(--panel);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--panel-border);
        border-radius: 24px;
        padding: 2.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      input, textarea {
        width: 100%;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--panel-border);
        border-radius: 12px;
        padding: 0.875rem 1rem;
        color: var(--text-primary);
        font-family: inherit;
        font-size: 1rem;
      }

      input:focus, textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px var(--accent-glow);
      }

      textarea {
        min-height: 120px;
        resize: vertical;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
      }

      .btn-group {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      button {
        cursor: pointer;
        font-family: inherit;
        font-weight: 700;
        font-size: 0.9375rem;
        padding: 0.875rem 1.75rem;
        border-radius: 12px;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-primary {
        background: var(--accent);
        color: #000;
      }

      .btn-primary:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 10px 20px -5px var(--accent-glow);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        border: 1px solid var(--panel-border);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .btn-danger {
        background: transparent;
        color: var(--danger);
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger);
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--panel-border);
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--accent);
      }

      .status-grid {
        display: grid;
        gap: 1rem;
      }

      .status-card {
        background: var(--card-bg);
        border: 1px solid var(--panel-border);
        border-radius: 16px;
        padding: 1.25rem;
      }

      .status-card strong {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      .status-card .value {
        font-size: 1.1rem;
        font-weight: 600;
      }

      code {
        font-family: 'JetBrains Mono', monospace;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.9em;
        color: var(--accent);
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .step-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1.5rem;
      }

      .step-item {
        display: flex;
        gap: 1.25rem;
      }

      .step-number {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--accent-glow);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.875rem;
        border: 1px solid rgba(56, 189, 248, 0.3);
      }

      .step-content h4 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        font-weight: 600;
      }

      .step-content p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .message {
        margin-top: 1.5rem;
        padding: 1rem;
        border-radius: 12px;
        font-weight: 500;
        font-size: 0.9375rem;
        min-height: 56px;
        display: flex;
        align-items: center;
        opacity: 0;
        transform: translateY(10px);
      }

      .message:not(:empty) {
        opacity: 1;
        transform: translateY(0);
      }

      .message.error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      .message.success {
        background: rgba(16, 185, 129, 0.1);
        color: #6ee7b7;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .hidden { display: none !important; }

      /* Custom scrollbar */
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { 
        background: var(--panel-border); 
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }

      /* Summary Widget */
      .summary-widget {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      
      .summary-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--panel-border);
        border-radius: 18px;
        padding: 1.5rem;
        text-align: center;
      }

      .summary-item .label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }

      .summary-item .big-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent);
      }
    </style>
  </head>
  <body data-view="${activeView}">
    <div class="container">
      <header>
        <div class="logo-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          AmaNomiBridge
        </div>
        <h1>OAuth MCP Gateway</h1>
        <p class="lead">Connect your Nomi AI to any MCP-ready platform with enterprise-grade security and ease.</p>
      </header>

      <nav>
        <a href="/" data-active="${activeView === 'home'}">Overview</a>
        <a href="/settings" data-active="${activeView === 'settings'}">API Settings</a>
        <a href="/status" data-active="${activeView === 'status'}">Connection</a>
      </nav>

      <div class="main-grid">
        <main class="glass-card">
          <!-- Auth Panel (Always shows if not logged in) -->
          <div id="auth-panel">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Secure Login
            </h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Sign in with your email to access your personal bridge configuration.</p>
            <form id="login-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input id="email" type="email" placeholder="name@company.com" required />
              </div>
              <div class="btn-group">
                <button type="submit" class="btn-primary">
                  Send Magic Link
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Home / Dashboard View -->
          <div id="home-view" class="hidden">
            <h2>Welcome Back</h2>
            <div id="session-panel" class="hidden" style="margin-bottom: 2rem;">
               <div id="session-email" class="status-pill">Loading session...</div>
               <div class="btn-group" style="margin-top: 1rem;">
                 <button id="sign-out" type="button" class="btn-secondary">Sign Out</button>
               </div>
            </div>

            <div class="summary-widget">
              <div class="summary-item">
                <div class="label">Nomi Key</div>
                <div id="summary-key-status" class="big-value">—</div>
              </div>
              <div class="summary-item">
                <div class="label">Bridge Status</div>
                <div id="summary-bridge-status" class="big-value">—</div>
              </div>
            </div>

            <div class="status-card" style="margin-top: 1rem;">
               <strong>Ready to use</strong>
               <p style="color: var(--text-secondary); margin: 0.5rem 0 0;">
                 Your bridge is configured. You can now use the MCP endpoint in your favorite LLM client.
               </p>
            </div>
          </div>

          <!-- Settings View -->
          <div id="settings-view" class="hidden">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Nomi Integration
            </h2>
            <form id="key-form">
              <div class="form-group">
                <label for="nomi-key">Nomi API Key</label>
                <textarea id="nomi-key" placeholder="Paste your API key here..."></textarea>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">Your key is encrypted before storage. We only store it to make requests on your behalf.</p>
              </div>
              <div class="btn-group">
                <button type="submit" class="btn-primary">Save Changes</button>
                <button id="delete-key" type="button" class="btn-danger">Delete Key</button>
              </div>
            </form>
          </div>

          <!-- Status View -->
          <div id="status-view" class="hidden">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Technical Status
            </h2>
            <div class="status-grid">
              <div class="status-card">
                <strong>Configured</strong>
                <div id="configured-value" class="value">Unknown</div>
              </div>
              <div class="status-card">
                <strong>Active Key</strong>
                <div id="last4-value" class="value">Unknown</div>
              </div>
              <div class="status-card">
                <strong>Last Validated</strong>
                <div id="validated-value" class="value">Unknown</div>
              </div>
              <div class="status-card" style="grid-column: 1 / -1;">
                <strong>MCP Endpoint</strong>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                  <code id="mcp-endpoint" style="flex: 1; padding: 0.75rem; display: block;">${'${window.location.origin}/api/mcp'}</code>
                </div>
              </div>
            </div>
            <div class="btn-group" style="margin-top: 1.5rem;">
               <button id="refresh-status" type="button" class="btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Refresh Connection
               </button>
            </div>
          </div>

          <div id="message" class="message" aria-live="polite"></div>
        </main>

        <aside class="sidebar">
          <section class="glass-card" style="padding: 2rem;">
            <h3 style="margin-top: 0; font-size: 1.25rem;">Quick Start</h3>
            <div class="step-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Authenticate</h4>
                  <p>Use your email to receive a secure login link via Supabase.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Configure Key</h4>
                  <p>Input your Nomi API key. It's stored using AES-256 encryption.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Connect Client</h4>
                  <p>Add the MCP endpoint to ChatGPT, Claude, or your preferred IDE.</p>
                </div>
              </div>
            </div>
          </section>

          <section class="glass-card" style="padding: 2rem; background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);">
            <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--accent);">OAuth Bridge</h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0;">
              This proxy adds OAuth2 compatibility to standard MCP tools, making them usable in multi-user environments.
            </p>
          </section>
        </aside>
      </div>
    </div>

    <script type="module">
      import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

      const messageNode = document.getElementById('message');
      const authPanel = document.getElementById('auth-panel');
      const homeView = document.getElementById('home-view');
      const settingsView = document.getElementById('settings-view');
      const statusView = document.getElementById('status-view');
      const sessionPanel = document.getElementById('session-panel');
      const sessionEmail = document.getElementById('session-email');
      
      const configuredValue = document.getElementById('configured-value');
      const last4Value = document.getElementById('last4-value');
      const validatedValue = document.getElementById('validated-value');
      const mcpEndpoint = document.getElementById('mcp-endpoint');
      
      const summaryKeyStatus = document.getElementById('summary-key-status');
      const summaryBridgeStatus = document.getElementById('summary-bridge-status');

      const loginForm = document.getElementById('login-form');
      const keyForm = document.getElementById('key-form');
      const deleteKeyButton = document.getElementById('delete-key');
      const refreshStatusButton = document.getElementById('refresh-status');
      const signOutButton = document.getElementById('sign-out');

      const activeView = document.body.dataset.view;

      mcpEndpoint.textContent = window.location.origin + '/api/mcp';

      let client;
      let session = null;

      boot().catch((error) => {
        console.error(error);
        setMessage(error.message || 'Failed to initialize the onboarding UI.', true);
      });

      async function boot() {
        const configResponse = await fetch('/api/public-config');
        if (!configResponse.ok) {
          throw new Error('Failed to load public config.');
        }

        const config = await configResponse.json();
        client = createClient(config.supabaseUrl, config.supabaseAnonKey);
        const currentSession = await client.auth.getSession();
        session = currentSession.data.session;
        renderSession();

        client.auth.onAuthStateChange((_event, nextSession) => {
          session = nextSession;
          renderSession();
          if (session) {
            refreshStatus().catch(console.error);
          }
        });

        loginForm?.addEventListener('submit', onLoginSubmit);
        keyForm?.addEventListener('submit', onSaveKey);
        deleteKeyButton?.addEventListener('click', onDeleteKey);
        refreshStatusButton?.addEventListener('click', () => refreshStatus());
        signOutButton?.addEventListener('click', async () => {
          await client.auth.signOut();
          setMessage('Signed out successfully.');
        });

        if (session) {
          await refreshStatus();
        }
      }

      async function onLoginSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) {
          setMessage('Enter an email address first.', true);
          return;
        }

        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
          },
        });

        if (error) {
          setMessage(error.message, true);
          return;
        }

        setMessage('✨ Magic link sent! Check your inbox to continue.');
      }

      async function onSaveKey(event) {
        event.preventDefault();
        const apiKey = document.getElementById('nomi-key').value.trim();
        if (!apiKey) {
          setMessage('Paste a Nomi API key before saving.', true);
          return;
        }

        const response = await authedFetch('/api/me/nomi-key', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });

        const payload = await response.json();
        if (!response.ok) {
          setMessage(payload?.error?.message || 'Failed to save the Nomi key.', true);
          return;
        }

        setMessage('✅ Nomi key validated and saved securely.');
        document.getElementById('nomi-key').value = '';
        await refreshStatus();
      }

      async function onDeleteKey() {
        if (!confirm('Are you sure you want to delete your Nomi key?')) return;
        
        const response = await authedFetch('/api/me/nomi-key', {
          method: 'DELETE',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setMessage(payload?.error?.message || 'Failed to delete the stored key.', true);
          return;
        }

        setMessage('🗑️ Stored Nomi key has been removed.');
        await refreshStatus();
      }

      async function refreshStatus() {
        if (!session) return;

        const response = await authedFetch('/api/me/nomi-key/status');
        const payload = await response.json();
        if (!response.ok) {
          setMessage(payload?.error?.message || 'Failed to fetch connection status.', true);
          return;
        }

        const isOk = payload.configured;
        
        // Update Status View
        configuredValue.textContent = isOk ? 'Active' : 'Not Setup';
        configuredValue.style.color = isOk ? 'var(--success)' : 'var(--danger)';
        last4Value.textContent = payload.last4 ? '•••• ' + payload.last4 : '—';
        validatedValue.textContent = payload.validatedAt ? new Date(payload.validatedAt).toLocaleString() : '—';
        
        // Update Home View
        summaryKeyStatus.textContent = isOk ? 'Linked' : 'Missing';
        summaryKeyStatus.style.color = isOk ? 'var(--success)' : 'var(--danger)';
        summaryBridgeStatus.textContent = isOk ? 'Ready' : 'Paused';
        summaryBridgeStatus.style.color = isOk ? 'var(--success)' : 'var(--text-secondary)';
      }

      async function authedFetch(input, init = {}) {
        if (!session?.access_token) {
          throw new Error('Login first to manage your Nomi key.');
        }

        const headers = new Headers(init.headers || {});
        headers.set('Authorization', 'Bearer ' + session.access_token);
        return fetch(input, { ...init, headers });
      }

      function renderSession() {
        if (session) {
          authPanel.classList.add('hidden');
          sessionPanel.classList.remove('hidden');
          sessionEmail.textContent = session.user.email || session.user.id;
          
          // Show view based on URL
          homeView.classList.toggle('hidden', activeView !== 'home');
          settingsView.classList.toggle('hidden', activeView !== 'settings');
          statusView.classList.toggle('hidden', activeView !== 'status');
        } else {
          authPanel.classList.remove('hidden');
          homeView.classList.add('hidden');
          settingsView.classList.add('hidden');
          statusView.classList.add('hidden');
          sessionPanel.classList.add('hidden');
        }
      }

      function setMessage(message, isError = false) {
        messageNode.textContent = message || '';
        messageNode.classList.toggle('error', Boolean(isError));
        messageNode.classList.toggle('success', Boolean(message && !isError));
        
        if (message) {
          messageNode.style.display = 'flex';
          setTimeout(() => {
            messageNode.style.opacity = '1';
            messageNode.style.transform = 'translateY(0)';
          }, 10);
          
          // Auto-hide success messages after 5s
          if (!isError) {
            setTimeout(() => {
              if (messageNode.textContent === message) setMessage('');
            }, 5000);
          }
        } else {
          messageNode.style.opacity = '0';
          messageNode.style.transform = 'translateY(10px)';
        }
      }
    </script>
  </body>
</html>\`;
}
