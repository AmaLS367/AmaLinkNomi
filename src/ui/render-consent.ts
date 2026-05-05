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
    <title>AmaNomiBridge OAuth Consent</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111f;
        --panel: rgba(9, 18, 34, 0.82);
        --border: rgba(148, 163, 184, 0.2);
        --text: #f8fafc;
        --muted: #94a3b8;
        --accent: #22c55e;
        --accent-2: #38bdf8;
        --danger: #fb7185;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 34%),
          radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.18), transparent 32%),
          linear-gradient(180deg, #020617 0%, #07111f 100%);
        color: var(--text);
        font-family: Inter, system-ui, sans-serif;
      }

      .shell {
        width: min(960px, 100%);
        display: grid;
        gap: 24px;
        grid-template-columns: 1.2fr 0.8fr;
      }

      @media (max-width: 900px) {
        .shell {
          grid-template-columns: 1fr;
        }
      }

      .card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 28px;
        backdrop-filter: blur(18px);
        box-shadow: 0 28px 80px rgba(2, 6, 23, 0.45);
      }

      h1, h2, h3 { margin-top: 0; }
      h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: 12px; }
      h2 { font-size: 1.25rem; margin-bottom: 12px; }
      p { color: var(--muted); }
      code {
        display: block;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.14);
        overflow-wrap: anywhere;
      }
      ul { margin: 0; padding-left: 20px; color: var(--text); }
      li + li { margin-top: 6px; }

      .eyebrow {
        display: inline-flex;
        margin-bottom: 16px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        color: var(--accent-2);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
      }

      button {
        border: 0;
        border-radius: 14px;
        padding: 14px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .primary { background: var(--accent); color: #04110a; }
      .secondary { background: rgba(56, 189, 248, 0.14); color: #dff6ff; }
      .ghost { background: transparent; color: var(--danger); border: 1px solid rgba(251, 113, 133, 0.35); }

      .stack { display: grid; gap: 14px; }
      .field {
        display: grid;
        gap: 8px;
      }
      input {
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(15, 23, 42, 0.66);
        color: var(--text);
        font: inherit;
      }
      .status {
        min-height: 48px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(15, 23, 42, 0.5);
        color: var(--muted);
      }
      .status.error {
        color: #fecdd3;
        border-color: rgba(251, 113, 133, 0.35);
        background: rgba(127, 29, 29, 0.28);
      }
      .status.success {
        color: #bbf7d0;
        border-color: rgba(34, 197, 94, 0.35);
        background: rgba(20, 83, 45, 0.28);
      }
      .hidden { display: none; }
      .meta-grid {
        display: grid;
        gap: 16px;
      }
      .meta-item strong {
        display: block;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="card">
        <div class="eyebrow">OAuth Consent</div>
        <h1>Connect ChatGPT to your Nomi workspace</h1>
        <p>
          AmaNomiBridge is requesting permission to act on your behalf inside this MCP session.
          Sign in first, then approve the bridge.
        </p>

        <div id="invalid-request" class="${authorizationId ? 'hidden' : ''}">
          <div class="status error">Missing or invalid authorization request. Start the OAuth flow again from ChatGPT.</div>
        </div>

        <div id="consent-app" class="${authorizationId ? '' : 'hidden'}">
          <div class="stack" id="login-panel">
            <div class="field">
              <label for="email">Email for magic link</label>
              <input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div class="actions">
              <button id="magic-link" class="secondary" type="button">Send Magic Link</button>
              <button id="google-login" class="secondary" type="button">Continue with Google</button>
              <button id="github-login" class="secondary" type="button">Continue with GitHub</button>
            </div>
          </div>

          <div id="session-panel" class="hidden">
            <div class="status success" id="session-copy">Session detected.</div>
            <div class="actions">
              <button id="approve" class="primary" type="button">Approve Access</button>
              <button id="deny" class="ghost" type="button">Deny</button>
            </div>
          </div>

          <div id="status" class="status ${input.error ? 'error' : ''}">${escapeHtml(
            input.error ?? 'Use the same browser window to complete sign-in and approval.'
          )}</div>
        </div>
      </section>

      <aside class="card">
        <h2>What ChatGPT will receive</h2>
        <div class="meta-grid">
          <div class="meta-item">
            <strong>Redirect URI</strong>
            <code>${escapeHtml(input.redirectUri ?? 'Pending from authorization request')}</code>
          </div>
          <div class="meta-item">
            <strong>Resource</strong>
            <code>${escapeHtml(input.resource ?? `${'${window.location.origin}'}/api/mcp`)}</code>
          </div>
          <div class="meta-item">
            <strong>Scopes</strong>
            <ul>${scopesMarkup}</ul>
          </div>
          <div class="meta-item">
            <strong>Client Reference</strong>
            <code>${escapeHtml(input.clientId ?? 'Pending from authorization request')}</code>
          </div>
        </div>
      </aside>
    </div>

    <script type="module">
      import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

      const authorizationId = ${JSON.stringify(authorizationId)};
      const statusNode = document.getElementById('status');
      const loginPanel = document.getElementById('login-panel');
      const sessionPanel = document.getElementById('session-panel');
      const sessionCopy = document.getElementById('session-copy');
      const emailInput = document.getElementById('email');
      const approveButton = document.getElementById('approve');
      const denyButton = document.getElementById('deny');
      let submissionInFlight = false;
      let appBaseUrl = window.location.origin;

      if (authorizationId) {
        boot().catch((error) => setStatus(error?.message || 'Failed to initialize consent.', true));
      }

      async function boot() {
        const configResponse = await fetch('/api/public-config');
        if (!configResponse.ok) {
          throw new Error('Failed to load Supabase public config.');
        }

        const config = await configResponse.json();
        appBaseUrl = config.appBaseUrl || window.location.origin;
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
          auth: {
            flowType: 'pkce',
            detectSessionInUrl: false,
            persistSession: true,
            autoRefreshToken: true,
          },
        });

        await completeRedirectSignIn(client);

        client.auth.onAuthStateChange((_event, session) => {
          renderSession(session);
        });

        const { data } = await client.auth.getSession();
        renderSession(data.session);

        document.getElementById('magic-link')?.addEventListener('click', async () => {
          const email = emailInput.value.trim();
          if (!email) {
            setStatus('Enter your email first.', true);
            return;
          }

          const { error } = await client.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: buildAppUrl(appBaseUrl, window.location.pathname + window.location.search).href,
            },
          });

          setStatus(error ? error.message : 'Magic link sent. Open it in this browser to continue.', Boolean(error));
        });

        document.getElementById('google-login')?.addEventListener('click', async () => {
          const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: buildAppUrl(appBaseUrl, window.location.pathname + window.location.search).href,
            },
          });

          if (error) {
            setStatus(error.message, true);
          }
        });

        document.getElementById('github-login')?.addEventListener('click', async () => {
          const { error } = await client.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: buildAppUrl(appBaseUrl, window.location.pathname + window.location.search).href,
            },
          });

          if (error) {
            setStatus(error.message, true);
          }
        });

        document.getElementById('approve')?.addEventListener('click', async () => {
          if (submissionInFlight) return;
          const session = (await client.auth.getSession()).data.session;
          if (!session?.access_token) {
            setStatus('Sign in before approving access.', true);
            return;
          }

          submissionInFlight = true;
          setButtonsDisabled(true);
          setStatus('Approving access and redirecting back to your MCP client…', false, true);

          const response = await fetch('/oauth/consent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + session.access_token,
            },
            body: JSON.stringify({
              authorizationId,
              decision: 'approve',
              refreshToken: session.refresh_token ?? null,
            }),
          });

          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.redirectUrl) {
            submissionInFlight = false;
            setButtonsDisabled(false);
            setStatus(payload?.error?.message || 'Approval failed.', true);
            return;
          }

          window.location.assign(payload.redirectUrl);
        });

        document.getElementById('deny')?.addEventListener('click', async () => {
          if (submissionInFlight) return;
          submissionInFlight = true;
          setButtonsDisabled(true);
          setStatus('Denying access and returning to your MCP client…', false, true);

          const response = await fetch('/oauth/consent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authorizationId,
              decision: 'deny',
            }),
          });

          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.redirectUrl) {
            submissionInFlight = false;
            setButtonsDisabled(false);
            setStatus(payload?.error?.message || 'Unable to deny access cleanly.', true);
            return;
          }

          window.location.assign(payload.redirectUrl);
        });
      }

      async function completeRedirectSignIn(client) {
        const url = new URL(window.location.href);
        const authCode = url.searchParams.get('code');
        const authError = url.searchParams.get('error_description') || url.searchParams.get('error');

        if (authError) {
          setStatus(authError, true);
        }

        if (!authCode) {
          return;
        }

        setStatus('Completing Supabase sign-in…', false, true);
        const { error } = await client.auth.exchangeCodeForSession(authCode);
        if (error) {
          throw new Error(error.message || 'Supabase sign-in callback failed.');
        }

        const cleaned = buildAppUrl(appBaseUrl, window.location.pathname);
        if (authorizationId) {
          cleaned.searchParams.set('authorization_id', authorizationId);
        }

        window.history.replaceState({}, '', cleaned.toString());
        setStatus('Supabase sign-in completed. You can now approve access.', false, true);
      }

      function renderSession(session) {
        const isLoggedIn = Boolean(session?.access_token);
        loginPanel.classList.toggle('hidden', isLoggedIn);
        sessionPanel.classList.toggle('hidden', !isLoggedIn);

        if (isLoggedIn) {
          sessionCopy.textContent = 'Signed in as ' + (session.user?.email || session.user?.id || 'current user');
          setStatus('Approve access to finish the ChatGPT connection.', false, true);
        }
      }

      function setButtonsDisabled(disabled) {
        if (approveButton) approveButton.disabled = disabled;
        if (denyButton) denyButton.disabled = disabled;
      }

      function setStatus(message, isError = false, isSuccess = false) {
        statusNode.textContent = message;
        statusNode.classList.toggle('error', Boolean(isError));
        statusNode.classList.toggle('success', Boolean(isSuccess));
      }

      function buildAppUrl(baseUrl, pathWithQuery) {
        return new URL(pathWithQuery, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
      }
    </script>
  </body>
</html>`;
}
