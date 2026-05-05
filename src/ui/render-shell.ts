type ActiveView = 'home' | 'settings' | 'guides' | 'status';
export type GuideSlug = 'index' | 'chatgpt' | 'claude' | 'nomi-key' | 'system';

const GUIDE_SLUGS = new Set<string>(['index', 'chatgpt', 'claude', 'nomi-key', 'system']);

export function isGuideSlug(value: string): value is Exclude<GuideSlug, 'index'> {
  return GUIDE_SLUGS.has(value) && value !== 'index';
}

export function renderShell(activeView: ActiveView, activeGuide: GuideSlug = 'index'): string {
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
      .guide-index-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
      .guide-grid { display: grid; gap: 1.25rem; max-width: 920px; }
      .guide-card {
        display: block;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid var(--glass-border);
        border-radius: 14px;
        padding: 1.5rem;
        transition: 0.2s ease;
      }
      .guide-card:hover { transform: translateY(-2px); border-color: rgba(20, 184, 166, 0.28); background: rgba(255, 255, 255, 0.055); }
      .guide-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; }
      .guide-copy { color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 1.25rem; }
      .guide-action { color: var(--accent-secondary); font-weight: 800; font-size: 0.88rem; }
      .guide-panel { animation: viewIn 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
      .guide-note {
        margin: 1.25rem 0;
        padding: 1rem;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 12px;
        color: var(--text-secondary);
        font-size: 0.88rem;
      }
      .guide-note strong { color: var(--warning); }
      .back-link {
        display: inline-flex;
        align-items: center;
        color: var(--accent-secondary);
        text-decoration: none;
        font-weight: 800;
        font-size: 0.88rem;
        margin-bottom: 1rem;
      }
      .step-list { display: grid; gap: 0.75rem; }
      .step-row { display: grid; grid-template-columns: 2rem 1fr; gap: 0.85rem; align-items: start; }
      .step-index {
        width: 2rem; height: 2rem; border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(20, 184, 166, 0.12);
        color: var(--accent-secondary);
        border: 1px solid rgba(20, 184, 166, 0.22);
        font-weight: 800; font-size: 0.8rem;
      }
      .step-row strong { display: block; font-size: 0.95rem; margin-bottom: 0.15rem; }
      .step-row span { color: var(--text-secondary); font-size: 0.88rem; }
      .detail-list { display: grid; gap: 0.35rem; margin-top: 0.55rem; color: var(--text-secondary); font-size: 0.86rem; }
      .detail-list div::before { content: "- "; color: var(--accent-secondary); font-weight: 800; }
      .system-flow {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .flow-item {
        min-height: 96px;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
      }
      .flow-item strong { display: block; font-size: 0.88rem; margin-bottom: 0.35rem; }
      .flow-item span { color: var(--text-secondary); font-size: 0.8rem; }
      .source-list { display: grid; gap: 0.5rem; margin-top: 1rem; }
      .source-list a { color: var(--accent-secondary); font-size: 0.88rem; font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
      .source-list a:hover { text-decoration: underline; }

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
        nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
        nav a { justify-content: center; gap: 0.45rem; padding: 0.72rem 0.45rem; font-size: 0.78rem; white-space: nowrap; }
        nav a svg { width: 18px; height: 18px; }
        .user-panel { display: none; }
        main.content { padding: 1.5rem; }
        .view-header h1 { font-size: 2rem; }
        .grid { grid-template-columns: 1fr; }
        .system-flow { grid-template-columns: 1fr; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
    </style>
  </head>
  <body data-view="${activeView}" data-guide="${activeGuide}">
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
          <a href="/guides" data-view-link="guides" data-active="${activeView === 'guides'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>
            Guides
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

        <!-- Guides -->
        <div id="guides-view" class="view hidden">
          <div id="guides-index" class="guide-panel ${activeGuide === 'index' ? '' : 'hidden'}">
            <div class="view-header">
              <h1>Guides</h1>
              <p>Step-by-step setup notes for connecting AmaLink Nomi to your AI clients.</p>
            </div>
            <div class="guide-index-grid">
              <a class="guide-card" href="/guides/chatgpt" data-guide-link="chatgpt">
                <div class="card-label">CHATGPT CONNECTOR</div>
                <div class="guide-title">Connect AmaLink Nomi in ChatGPT</div>
                <p class="guide-copy">Use the MCP endpoint from Gateway Health as the custom connector URL.</p>
                <span class="guide-action">Open guide</span>
              </a>
              <a class="guide-card" href="/guides/claude" data-guide-link="claude">
                <div class="card-label">CLAUDE CONNECTOR</div>
                <div class="guide-title">Connect AmaLink Nomi in Claude</div>
                <p class="guide-copy">Add the same remote MCP endpoint in Claude and complete OAuth approval.</p>
                <span class="guide-action">Open guide</span>
              </a>
              <a class="guide-card" href="/guides/nomi-key" data-guide-link="nomi-key">
                <div class="card-label">NOMI API KEY</div>
                <div class="guide-title">Get and save your Nomi integration key</div>
                <p class="guide-copy">Generate your token in Nomi and store it encrypted in AmaLink.</p>
                <span class="guide-action">Open guide</span>
              </a>
              <a class="guide-card" href="/guides/system" data-guide-link="system">
                <div class="card-label">SYSTEM FLOW</div>
                <div class="guide-title">How AmaLink Nomi works</div>
                <p class="guide-copy">Understand the OAuth gate, encrypted key store, and MCP request path.</p>
                <span class="guide-action">Open guide</span>
              </a>
            </div>
          </div>

          <article id="guide-chatgpt" class="guide-panel ${activeGuide === 'chatgpt' ? '' : 'hidden'}">
            <a href="/guides" data-guide-link="index" class="back-link">Back to guides</a>
            <div class="view-header">
              <h1>Connect ChatGPT</h1>
              <p>Set up AmaLink Nomi as a custom MCP app or connector in ChatGPT.</p>
            </div>
            <div class="guide-grid">
              <div class="guide-card">
                <div class="card-label">CHATGPT CONNECTOR</div>
                <div class="guide-title">Connect AmaLink Nomi in ChatGPT</div>
                <p class="guide-copy">Use the MCP endpoint from Gateway Health as the custom app or custom connector URL. OpenAI is moving the UI language toward Apps and Apps &amp; Connectors, so older accounts may still show Connectors.</p>
                <div class="guide-note"><strong>Before you start:</strong> custom MCP apps/connectors depend on plan and workspace permissions. If the custom option is missing, check Developer mode, Apps &amp; Connectors settings, and workspace admin permissions.</div>
                <div class="step-list">
                  <div class="step-row"><div class="step-index">1</div><div><strong>Copy the AmaLink MCP endpoint</strong><span>Open Gateway Health and copy the endpoint URL shown there.</span><div class="detail-list"><div>Use the Copy button to avoid missing the <code>/api/mcp</code> path.</div><div>Keep this page open until the ChatGPT setup is finished.</div></div></div></div>
                  <div class="step-row"><div class="step-index">2</div><div><strong>Open ChatGPT Apps settings</strong><span>In ChatGPT, go to Settings and find Apps, Apps &amp; Connectors, or Connectors. If your workspace uses the beta developer flow, enable Developer mode before creating a custom MCP app.</span><div class="detail-list"><div>OpenAI's current UI is in transition from Connectors to Apps, so names can differ by account.</div><div>Business, Enterprise, and Edu workspaces can require owner/admin permission, developer-mode access, or publishing before other members can use the app.</div></div></div></div>
                  <div class="step-row"><div class="step-index">3</div><div><strong>Add the custom MCP app or connector</strong><span>Choose the custom MCP option, paste the AmaLink endpoint, and save the connector. If ChatGPT asks for a name, use <code>AmaLink Nomi</code>.</span><div class="detail-list"><div>If ChatGPT says the server does not implement the expected specification, verify that you pasted the exact <code>/api/mcp</code> endpoint.</div><div>If ChatGPT shows admin approval required, the fix is in workspace/admin settings, not in AmaLink.</div></div></div></div>
                  <div class="step-row"><div class="step-index">4</div><div><strong>Connect your user account</strong><span>Open the new connector and click Connect. ChatGPT should redirect to AmaLink Nomi OAuth consent.</span><div class="detail-list"><div>Sign in with the same GitHub or Google account you used in AmaLink.</div><div>Review the consent screen, then approve. The OAuth token lets ChatGPT call AmaLink, not see your Nomi API key.</div></div></div></div>
                  <div class="step-row"><div class="step-index">5</div><div><strong>Enable it in a chat</strong><span>Start a new ChatGPT conversation and enable AmaLink Nomi from the app, connector, tools, or source picker UI.</span><div class="detail-list"><div>Ask a simple test prompt first, for example: list available Nomi rooms or list my Nomis.</div><div>If no tools appear, reconnect the app and refresh the connector tools in settings if your workspace UI offers that button.</div></div></div></div>
                </div>
              </div>
              <div class="guide-card">
                <div class="card-label">REFERENCE LINKS</div>
                <div class="source-list">
                  <a href="https://help.openai.com/en/articles/11487775-connectors-in-chatgpt" target="_blank">OpenAI Help: Apps / Connectors in ChatGPT</a>
                  <a href="https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt-beta" target="_blank">OpenAI Help: Developer mode and MCP apps in ChatGPT</a>
                  <a href="https://platform.openai.com/docs/mcp/" target="_blank">OpenAI Platform: Building MCP servers for ChatGPT and API integrations</a>
                </div>
              </div>
            </div>
          </article>

          <article id="guide-claude" class="guide-panel ${activeGuide === 'claude' ? '' : 'hidden'}">
            <a href="/guides" data-guide-link="index" class="back-link">Back to guides</a>
            <div class="view-header">
              <h1>Connect Claude</h1>
              <p>Add AmaLink Nomi as a Claude custom connector using remote MCP.</p>
            </div>
            <div class="guide-grid">
              <div class="guide-card">
                <div class="card-label">CLAUDE CONNECTOR</div>
                <div class="guide-title">Connect AmaLink Nomi in Claude</div>
                <p class="guide-copy">Claude custom connectors call your remote MCP server from Anthropic cloud infrastructure. The AmaLink endpoint must be publicly reachable over HTTPS.</p>
                <div class="guide-note"><strong>Before you start:</strong> Claude remote MCP is beta. Free, Pro, Max, Team, and Enterprise users can use custom connectors, but Free users are limited to one custom connector. Team and Enterprise setup can require an Owner or Primary Owner.</div>
                <div class="step-list">
                  <div class="step-row"><div class="step-index">1</div><div><strong>Copy the AmaLink MCP endpoint</strong><span>Open Gateway Health and copy the endpoint URL shown there.</span><div class="detail-list"><div>Use the Copy button to avoid missing the <code>/api/mcp</code> path.</div><div>Keep this page open until the Claude setup is finished.</div></div></div></div>
                  <div class="step-row"><div class="step-index">2</div><div><strong>Open Claude connector settings</strong><span>For individual plans, go to Customize &gt; Connectors. For Team and Enterprise, an Owner may need Organization settings &gt; Connectors first.</span><div class="detail-list"><div>Individual Pro and Max users can add a custom connector directly.</div><div>For Team and Enterprise, the Owner adds the connector at org level, then users connect it individually.</div></div></div></div>
                  <div class="step-row"><div class="step-index">3</div><div><strong>Add a custom Web connector</strong><span>Choose Add custom connector or Custom &gt; Web, paste the AmaLink endpoint, and name it <code>AmaLink Nomi</code>.</span><div class="detail-list"><div>Leave advanced OAuth Client ID and Client Secret blank unless your deployment specifically requires static client credentials.</div><div>AmaLink supports the OAuth flow used by Claude through its consent route.</div></div></div></div>
                  <div class="step-row"><div class="step-index">4</div><div><strong>Connect and approve OAuth</strong><span>Click Connect, sign in to AmaLink, and approve the authorization request.</span><div class="detail-list"><div>Claude receives an OAuth token for AmaLink, not your Nomi API key.</div><div>If authorization fails, retry from Claude settings after confirming AmaLink is reachable at <code>/health</code>.</div></div></div></div>
                  <div class="step-row"><div class="step-index">5</div><div><strong>Enable it in the conversation</strong><span>In a Claude chat, use the lower-left plus button and Connectors menu, then toggle AmaLink Nomi on for that conversation.</span><div class="detail-list"><div>Start with a read-only test like listing Nomis or rooms.</div><div>Disable tools that are not relevant to the current conversation if Claude exposes tool-level controls.</div></div></div></div>
                </div>
              </div>
              <div class="guide-card">
                <div class="card-label">REFERENCE LINKS</div>
                <div class="source-list">
                  <a href="https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-integrations-using-remote-mcp" target="_blank">Anthropic Help: Get started with custom connectors using remote MCP</a>
                  <a href="https://support.anthropic.com/en/articles/11503834-building-custom-integrations-via-remote-mcp-servers" target="_blank">Anthropic Help: Building custom connectors via remote MCP servers</a>
                  <a href="https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector" target="_blank">Anthropic Docs: MCP connector</a>
                </div>
              </div>
            </div>
          </article>

          <article id="guide-nomi-key" class="guide-panel ${activeGuide === 'nomi-key' ? '' : 'hidden'}">
            <a href="/guides" data-guide-link="index" class="back-link">Back to guides</a>
            <div class="view-header">
              <h1>Nomi API Key</h1>
              <p>Generate your Nomi integration token and save it in AmaLink Nomi.</p>
            </div>
            <div class="guide-grid">
              <div class="guide-card">
                <div class="card-label">NOMI API KEY</div>
                <div class="guide-title">Get and save your Nomi integration key</div>
                <p class="guide-copy">AmaLink validates your Nomi integration key before storing it, then uses it server-side for future tool calls.</p>
                <div class="guide-note"><strong>Security note:</strong> treat the Nomi API key like a password. Do not send it to ChatGPT or Claude directly. Paste it only into the AmaLink API Setup page you control.</div>
                <div class="step-list">
                  <div class="step-row"><div class="step-index">1</div><div><strong>Open the Nomi integrations area</strong><span>Go to <a href="https://beta.nomi.ai/profile/integrations" target="_blank" style="color: var(--accent-secondary); font-weight: 700;">beta.nomi.ai/profile/integrations</a>, or open Nomi, then Profile, then the Integrations section.</span><div class="detail-list"><div>If Nomi redirects you to sign in, sign in first and return to the integrations page.</div><div>The exact visual placement can change, but Nomi's docs point users to the Integration section of the Profile tab.</div></div></div></div>
                  <div class="step-row"><div class="step-index">2</div><div><strong>Copy the API key</strong><span>Copy the integration/API key shown by Nomi. It is usually formatted like a UUID.</span><div class="detail-list"><div>Do not copy your Nomi account password.</div><div>Copy only the key value shown in the integration page.</div></div></div></div>
                  <div class="step-row"><div class="step-index">3</div><div><strong>Save it in AmaLink API Setup</strong><span>Open AmaLink Nomi, go to API Setup, paste the key, and click Save Key.</span><div class="detail-list"><div>AmaLink calls Nomi to verify the key before saving.</div><div>If validation succeeds, the dashboard credentials state should become connected or verified.</div></div></div></div>
                  <div class="step-row"><div class="step-index">4</div><div><strong>Confirm Gateway Health</strong><span>Open Gateway Health and check the last four digits and last validated fields.</span><div class="detail-list"><div>The last four digits help confirm which key is stored without exposing the full key.</div><div>If validation shows Never or Missing, save the key again and check that your Nomi account API access is active.</div></div></div></div>
                  <div class="step-row"><div class="step-index">5</div><div><strong>Rotate or delete when needed</strong><span>If you think the key leaked, rotate/regenerate it in Nomi if available, then update AmaLink. Use Delete Key in AmaLink to remove the stored key.</span><div class="detail-list"><div>After deleting, ChatGPT or Claude can still authenticate to AmaLink, but Nomi tool calls will fail until a valid Nomi key is saved again.</div><div>Repeated invalid or excessive Nomi API calls can trigger API errors or rate limits.</div></div></div></div>
                </div>
              </div>
              <div class="guide-card">
                <div class="card-label">REFERENCE LINKS</div>
                <div class="source-list">
                  <a href="https://api.nomi.ai/docs/" target="_blank">Nomi.ai API Docs: Getting Started and Authorization</a>
                  <a href="https://api.nomi.ai/docs/reference/general/" target="_blank">Nomi.ai API Docs: Versioning, rate limits, and response codes</a>
                  <a href="https://nomi.ai/nomi-knowledge/take-your-nomi-anywhere-with-nomis-ai-companion-api/" target="_blank">Nomi.ai: API key in Integrations tab under Profile</a>
                </div>
              </div>
            </div>
          </article>

          <article id="guide-system" class="guide-panel ${activeGuide === 'system' ? '' : 'hidden'}">
            <a href="/guides" data-guide-link="index" class="back-link">Back to guides</a>
            <div class="view-header">
              <h1>System Flow</h1>
              <p>How the OAuth-protected MCP gateway protects your Nomi API key.</p>
            </div>
            <div class="guide-grid">
              <div class="guide-card">
                <div class="card-label">SYSTEM FLOW</div>
                <div class="guide-title">How AmaLink Nomi works</div>
                <p class="guide-copy">AmaLink Nomi is a remote MCP server. ChatGPT or Claude authenticates to AmaLink with OAuth, then AmaLink uses your encrypted Nomi API key server-side when a tool needs Nomi data.</p>
                <div class="system-flow">
                  <div class="flow-item"><strong>AI Client</strong><span>ChatGPT or Claude calls the public <code>/api/mcp</code> endpoint.</span></div>
                  <div class="flow-item"><strong>OAuth Gate</strong><span>AmaLink verifies the connector token and maps it to your account.</span></div>
                  <div class="flow-item"><strong>Secure Key Store</strong><span>The Nomi key is decrypted only on the server for the current request.</span></div>
                  <div class="flow-item"><strong>Nomi API</strong><span>AmaLink calls Nomi and returns only tool results to the AI client.</span></div>
                </div>
              </div>
              <div class="guide-card">
                <div class="card-label">DETAILED REQUEST PATH</div>
                <div class="step-list">
                  <div class="step-row"><div class="step-index">1</div><div><strong>You configure a public MCP endpoint</strong><span>Gateway Health shows the URL that external AI clients should use. It ends with <code>/api/mcp</code>.</span><div class="detail-list"><div>Remote MCP clients need a public HTTPS URL.</div><div>Local-only addresses work only for local MCP clients, not hosted ChatGPT or Claude connectors.</div></div></div></div>
                  <div class="step-row"><div class="step-index">2</div><div><strong>The client performs OAuth</strong><span>ChatGPT or Claude redirects you to AmaLink consent, then receives a token after you approve.</span><div class="detail-list"><div>The OAuth token represents permission to call AmaLink.</div><div>It is separate from the Nomi API key and can be disconnected from the AI client side.</div></div></div></div>
                  <div class="step-row"><div class="step-index">3</div><div><strong>A tool call arrives at AmaLink</strong><span>The client sends an MCP tool request to <code>/api/mcp</code> with the OAuth bearer token.</span><div class="detail-list"><div>AmaLink authenticates the token before running account-specific operations.</div><div>If the token is missing or invalid, the request should fail before Nomi is called.</div></div></div></div>
                  <div class="step-row"><div class="step-index">4</div><div><strong>AmaLink loads the stored Nomi credential</strong><span>If the request needs Nomi, AmaLink retrieves your encrypted credential, decrypts it server-side, and uses it for the Nomi API request.</span><div class="detail-list"><div>The browser and AI client do not receive the full Nomi key.</div><div>The UI only shows masked status such as the last four digits.</div></div></div></div>
                  <div class="step-row"><div class="step-index">5</div><div><strong>Nomi returns the result</strong><span>AmaLink forwards the relevant result back through MCP, such as lists of Nomis, room data, or message responses exposed by the server tools.</span><div class="detail-list"><div>Nomi API responses are JSON.</div><div>Errors from Nomi should be surfaced as tool errors, not as leaked credentials.</div></div></div></div>
                </div>
              </div>
              <div class="guide-card">
                <div class="card-label">TROUBLESHOOTING</div>
                <div class="step-list">
                  <div class="step-row"><div class="step-index">1</div><div><strong>Connector cannot reach server</strong><span>Confirm the deployment is public and <code>/health</code> returns OK from the internet.</span></div></div>
                  <div class="step-row"><div class="step-index">2</div><div><strong>OAuth approval loops or fails</strong><span>Reconnect from the AI client settings and make sure the canonical app URL matches the deployed AmaLink URL.</span></div></div>
                  <div class="step-row"><div class="step-index">3</div><div><strong>Nomi calls fail after connector works</strong><span>Open API Setup, save the Nomi key again, then check Gateway Health for last validated status.</span></div></div>
                  <div class="step-row"><div class="step-index">4</div><div><strong>Tools are missing in ChatGPT or Claude</strong><span>Refresh or reconnect the connector. Some workspaces require admin action approval before tools become available.</span></div></div>
                </div>
              </div>
            </div>
          </article>
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
      const guidesView = document.getElementById('guides-view');
      const statusView = document.getElementById('status-view');
      const toast = document.getElementById('toast');
      const viewRoutes = { home: '/', settings: '/settings', guides: '/guides', status: '/status' };
      const guideRoutes = {
        index: '/guides',
        chatgpt: '/guides/chatgpt',
        claude: '/guides/claude',
        'nomi-key': '/guides/nomi-key',
        system: '/guides/system',
      };
      const viewTitles = {
        home: 'AmaLink Nomi - Dashboard',
        settings: 'AmaLink Nomi - API Setup',
        guides: 'AmaLink Nomi - Guides',
        status: 'AmaLink Nomi - Gateway Health',
      };
      const guideTitles = {
        index: 'AmaLink Nomi - Guides',
        chatgpt: 'AmaLink Nomi - ChatGPT Guide',
        claude: 'AmaLink Nomi - Claude Guide',
        'nomi-key': 'AmaLink Nomi - Nomi API Key Guide',
        system: 'AmaLink Nomi - System Flow Guide',
      };
      let activeView = document.body.dataset.view || 'home';
      let activeGuide = document.body.dataset.guide || 'index';

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
        document.querySelectorAll('a[data-guide-link]').forEach((link) => {
          link.addEventListener('click', (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setActiveGuide(link.dataset.guideLink, true);
          });
        });
        window.addEventListener('popstate', () => setRouteFromPath(window.location.pathname, false));

        document.getElementById('key-form').onsubmit = async (e) => {
          e.preventDefault();
          const apiKey = document.getElementById('nomi-key').value.trim();
          if (!apiKey) {
            showToast('Paste a Nomi key first.');
            return;
          }
          try {
            const res = await fetch('/api/me/nomi-key', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
              body: JSON.stringify({ apiKey })
            });
            if (res.ok) { showToast('Key saved successfully.'); refresh(); document.getElementById('nomi-key').value = ''; }
            else showToast('Could not save key.');
          } catch (error) {
            console.error(error);
            showToast('Network error while saving key.');
          }
        };
        document.getElementById('delete-key').onclick = async () => {
          if (!confirm('Delete the stored Nomi key?')) return;
          try {
            const res = await fetch('/api/me/nomi-key', {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + session.access_token },
            });
            if (res.ok) { showToast('Key deleted.'); refresh(); }
            else showToast('Could not delete key.');
          } catch (error) {
            console.error(error);
            showToast('Network error while deleting key.');
          }
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
        if (nextView === 'guides') activeGuide = 'index';
        document.body.dataset.view = nextView;
        document.body.dataset.guide = activeGuide;
        renderViews();
        document.title = nextView === 'guides' ? guideTitles.index : viewTitles[nextView];
        const route = nextView === 'guides' ? guideRoutes.index : viewRoutes[nextView];
        if (push && window.location.pathname !== route) {
          window.history.pushState({ view: nextView, guide: activeGuide }, '', route);
        }
        if (nextView === 'status') refresh();
      }

      function setActiveGuide(nextGuide, push) {
        if (!guideRoutes[nextGuide]) return;
        activeView = 'guides';
        activeGuide = nextGuide;
        document.body.dataset.view = activeView;
        document.body.dataset.guide = activeGuide;
        renderViews();
        document.title = guideTitles[activeGuide];
        if (push && window.location.pathname !== guideRoutes[activeGuide]) {
          window.history.pushState({ view: activeView, guide: activeGuide }, '', guideRoutes[activeGuide]);
        }
      }

      function renderViews() {
        homeView.classList.toggle('hidden', activeView !== 'home');
        settingsView.classList.toggle('hidden', activeView !== 'settings');
        guidesView.classList.toggle('hidden', activeView !== 'guides');
        statusView.classList.toggle('hidden', activeView !== 'status');
        document.querySelectorAll('.guide-panel').forEach((panel) => {
          panel.classList.toggle('hidden', panel.id !== guidePanelId(activeGuide));
        });
        document.querySelectorAll('nav a[data-view-link]').forEach((link) => {
          link.dataset.active = String(link.dataset.viewLink === activeView);
        });
        document.querySelectorAll('a[data-guide-link]').forEach((link) => {
          link.dataset.active = String(link.dataset.guideLink === activeGuide);
        });
      }

      function setRouteFromPath(pathname) {
        activeView = viewFromPath(pathname);
        activeGuide = guideFromPath(pathname);
        document.body.dataset.view = activeView;
        document.body.dataset.guide = activeGuide;
        renderViews();
        document.title = activeView === 'guides' ? guideTitles[activeGuide] : viewTitles[activeView];
      }

      function viewFromPath(pathname) {
        if (pathname === '/settings') return 'settings';
        if (pathname === '/guides' || pathname.startsWith('/guides/')) return 'guides';
        if (pathname === '/status') return 'status';
        return 'home';
      }

      function guideFromPath(pathname) {
        if (!pathname.startsWith('/guides/')) return 'index';
        const slug = pathname.split('/')[2] || 'index';
        return guideRoutes[slug] ? slug : 'index';
      }

      function guidePanelId(guide) {
        return guide === 'index' ? 'guides-index' : 'guide-' + guide;
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
          document.getElementById('validated-value').textContent = data.validatedAt ? new Date(data.validatedAt).toLocaleString() : 'Never';
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
