function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderConsentPage(input: {
  authorizationId: string | null;
  redirectUri?: string;
  resource?: string | null;
  scopes?: string[];
  clientId?: string;
  error?: string | null;
}): string {
  const authorizationId = input.authorizationId ?? '';
  const scopes = input.scopes ?? [];
  const scopesMarkup =
    scopes.length > 0
      ? scopes.map((scope) => `<li>${escapeHtml(scope)}</li>`).join('')
      : '<li>openid</li><li>email</li><li>profile</li>';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Authorize Connection - AmaLink Nomi / AmaNomiBridge</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%237c3aed'/%3E%3Cpath d='M12 4l6 3v5c0 4-3 7-6 8-3-1-6-4-6-8V7l6-3z' fill='white'/%3E%3C/svg%3E">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        color-scheme: dark;
        --bg: #07080b;
        --surface: rgba(18, 21, 29, 0.9);
        --accent: #22c55e;
        --accent-glow: rgba(34, 197, 94, 0.2);
        --accent-2: #7c3aed;
        --accent-3: #14b8a6;
        --text-primary: #ffffff;
        --text-secondary: #a7adbb;
        --glass: rgba(255, 255, 255, 0.045);
        --glass-border: rgba(255, 255, 255, 0.105);
        --danger: #fb7185;
        --font-main: 'Outfit', system-ui, sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: var(--font-main);
        background:
          linear-gradient(180deg, #0b0d12 0%, #06070a 50%, #090b0d 100%);
        color: var(--text-primary);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        line-height: 1.6;
        overflow-x: hidden;
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
          linear-gradient(135deg, rgba(20, 184, 166, 0.12), transparent 34%),
          linear-gradient(315deg, rgba(124, 58, 237, 0.12), transparent 36%);
        background-size: 44px 44px, 44px 44px, auto, auto;
      }

      .consent-card {
        width: 100%; max-width: 600px;
        background: var(--surface);
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        border: 1px solid var(--glass-border); border-radius: 18px;
        padding: 3rem; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
        animation: cardIn 0.34s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes cardIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

      .logo-icon {
        width: 52px; height: 52px;
        background: linear-gradient(135deg, var(--accent-2), var(--accent-3));
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 2rem; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
      }

      h1 { font-size: 2.15rem; font-weight: 800; margin-bottom: 1rem; text-align: center; }
      .subtitle { color: var(--text-secondary); margin-bottom: 2.5rem; text-align: center; font-size: 1.05rem; }

      .info-grid { display: grid; gap: 1.5rem; margin-bottom: 2.5rem; }
      .info-box {
        background: rgba(0, 0, 0, 0.3); border: 1px solid var(--glass-border);
        border-radius: 12px; padding: 1.35rem;
      }
      .label { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; display: block; }
      code { font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-2); word-break: break-all; }

      .scope-list { list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
      .scope-list li {
        background: rgba(255, 255, 255, 0.05); padding: 0.3rem 0.7rem;
        border-radius: 8px; font-size: 0.75rem; font-weight: 700; border: 1px solid var(--glass-border);
      }

      .security-note {
        font-size: 0.85rem; color: var(--text-secondary);
        background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.1);
        padding: 1rem; border-radius: 12px; margin-bottom: 2.5rem;
        display: flex; gap: 0.75rem; align-items: flex-start;
      }

      .btn {
        cursor: pointer; font-family: inherit; font-weight: 700; font-size: 1rem;
        padding: 1rem; border-radius: 10px; border: none; width: 100%;
        transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .btn-primary { background: var(--accent); color: #052e16; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 30px var(--accent-glow); }
      .btn-outline { background: #fff; color: #000; }
      .btn-outline:hover { transform: translateY(-2px); }
      .btn-ghost { background: transparent; color: var(--danger); border: 1px solid rgba(251, 113, 133, 0.2); margin-top: 1rem; }

      .status-msg { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary); }
      .error { color: var(--danger); }
      .hidden { display: none !important; }
      @media (max-width: 640px) {
        body { padding: 1rem; align-items: flex-start; }
        .consent-card { padding: 1.5rem; }
        h1 { font-size: 1.8rem; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
    </style>
  </head>
  <body>
    <div class="consent-card">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>

      <div id="consent-app" class="${authorizationId ? '' : 'hidden'}">
        <h1>Authorize Connection</h1>
        <p class="subtitle">An external client is requesting access to your workspace via AmaLink Nomi bridge.</p>

        <div class="info-grid">
          <div class="info-box">
            <span class="label">Requesting Client</span>
            <code>${escapeHtml(input.clientId ?? 'External MCP Client')}</code>
          </div>
          <div class="info-box">
            <span class="label">Permissions (Scopes)</span>
            <ul class="scope-list">${scopesMarkup}</ul>
          </div>
        </div>

        <div class="security-note">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           <span>Your Nomi API key is never shared with the client. The bridge acts as a secure proxy to protect your credentials.</span>
        </div>

        <div id="login-panel">
          <button id="github-login" class="btn btn-outline">Continue with GitHub</button>
          <button id="google-login" class="btn btn-ghost" style="color: #fff; border-color: var(--glass-border)">Continue with Google</button>
        </div>

        <div id="session-panel" class="hidden">
          <button id="approve" class="btn btn-primary">Approve & Connect</button>
          <button id="deny" class="btn btn-ghost">Deny Access</button>
        </div>

        <div id="status" class="status-msg ${input.error ? 'error' : ''}">
          ${escapeHtml(input.error ?? 'Please sign in to complete authorization.')}
        </div>
      </div>

      <div id="invalid-request" class="${authorizationId ? 'hidden' : ''}">
        <h1 style="color: var(--danger)">Expired Session</h1>
        <p class="subtitle">This authorization request is no longer valid. Please restart the flow from your AI client.</p>
        <button onclick="window.location.href='/'" class="btn btn-outline">Go to Dashboard</button>
      </div>
    </div>

    <script type="module">
      import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

      const authorizationId = ${JSON.stringify(authorizationId)};
      const statusNode = document.getElementById('status');
      const loginPanel = document.getElementById('login-panel');
      const sessionPanel = document.getElementById('session-panel');

      let client;

      if (authorizationId) {
        boot().catch(console.error);
      }

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
        render(data.session);

        client.auth.onAuthStateChange((_, s) => render(s));

        document.getElementById('github-login').onclick = () => client.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.href } });
        document.getElementById('google-login').onclick = () => client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });

        document.getElementById('approve').onclick = async () => {
          const { data } = await client.auth.getSession();
          if(!data.session) return;

          setStatus('Authorizing connection...');
          const res = await (await fetch('/oauth/consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + data.session.access_token },
            body: JSON.stringify({ authorizationId, decision: 'approve', refreshToken: data.session.refresh_token })
          })).json();

          if(res.redirectUrl) window.location.assign(res.redirectUrl);
          else setStatus(res.error?.message || 'Approval failed.', true);
        };

        document.getElementById('deny').onclick = async () => {
          const res = await (await fetch('/oauth/consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorizationId, decision: 'deny' })
          })).json();
          if(res.redirectUrl) window.location.assign(res.redirectUrl);
        };
      }

      function render(s) {
        loginPanel.classList.toggle('hidden', !!s);
        sessionPanel.classList.toggle('hidden', !s);
        if(s) setStatus('Signed in as ' + s.user.email);
      }

      async function completeRedirect() {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if(code) {
          await client.auth.exchangeCodeForSession(code);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      }

      function setStatus(msg, err = false) {
        statusNode.textContent = msg;
        statusNode.classList.toggle('error', err);
      }
    </script>
  </body>
</html>`;
}
