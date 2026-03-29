# AmaNomiBridge

Multi-tenant MCP gateway for the [Nomi API](https://api.nomi.ai/docs), designed for Vercel, Supabase OAuth, ChatGPT Developer Mode, Claude MCP connector, and generic remote MCP clients.

```
MCP client -> AmaNomiBridge -> user-bound encrypted Nomi key -> Nomi API
```

## What changed

- No more shared `MCP_AUTH_TOKEN`
- Every user connects their own Nomi API key through a small onboarding UI
- MCP discovery stays public, but all Nomi-backed `tools/call` requests require bearer auth
- Nomi credentials are validated before save and stored encrypted at rest
- Optional service-mode fallback via global `NOMI_API_KEY`

## Tools

| Tool | Description | Auth |
|------|-------------|------|
| `list_nomis` | List all Nomi characters for the authenticated user | required |
| `get_nomi` | Get details for one Nomi | required |
| `send_message` | Send a direct message to a Nomi | required |
| `list_rooms` | List rooms for the authenticated user | required |
| `send_room_message` | Send a message to a room | required |

Read-only tools expose `readOnlyHint` metadata.

## Environment

Copy the template and fill it:

```bash
cp .env.example .env
```

Required values:

```env
NOMI_API_KEY=7f9c3f69-385f-4a22-afe7-d7b50852cd06
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_AUDIENCE=authenticated
```

Optional overrides:

```env
SUPABASE_JWT_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
NOMI_KEY_ENCRYPTION_KEY=any-secret-string
NOMI_API_BASE_URL=https://api.nomi.ai
```

If `NOMI_KEY_ENCRYPTION_KEY` is omitted, encrypted storage derives its key from `NOMI_API_KEY`. A plain UUID-style Nomi key also works as the seed.

## Supabase setup

1. Provision Supabase Auth.
2. Apply the SQL migration in [supabase/migrations/20260329_create_user_nomi_credentials.sql](supabase/migrations/20260329_create_user_nomi_credentials.sql).
3. Configure your preferred login method in Supabase Auth. The built-in onboarding UI supports Google OAuth and magic-link email login.
4. In Supabase Auth URL configuration, set your deployed app URL as the Site URL and add every allowed callback origin to Redirect URLs. If this is misconfigured, auth flows often bounce to `http://localhost:3000`.

## Local development

```bash
npm install
npm run dev
```

Useful routes:

- `http://localhost:3000/` - onboarding home
- `http://localhost:3000/settings` - Nomi key settings
- `http://localhost:3000/status` - connection status
- `http://localhost:3000/api/mcp` - MCP endpoint
- `http://localhost:3000/.well-known/oauth-protected-resource/api/mcp` - protected resource metadata

## MCP auth model

The server uses a mixed surface:

- Public:
  - `initialize`
  - `notifications/initialized`
  - `tools/list`
  - OAuth discovery metadata
- Protected:
  - every `tools/call`

Tool calls require `Authorization: Bearer <Supabase access token>`.

If a client calls a protected MCP method without a token, the server responds with `401` and a `WWW-Authenticate` header pointing to the protected resource metadata URL.

## Onboarding flow

1. Open `/`
2. Sign in through Google or Supabase magic link
3. Open `/settings`
4. Paste your personal Nomi API key
5. The server validates the key against Nomi before storing it
6. The key is encrypted and stored in `user_nomi_credentials`

The MCP tools do not accept or store Nomi API keys.

## Vercel deployment

The repo is configured for a single Node function entrypoint at `api/index.ts`.

```bash
vercel
```

Before deploying:

1. Set the environment variables from `.env.example`
2. Apply the Supabase migration
3. Enable a Supabase sign-in method
4. If you want Google login, enable the Google provider in Supabase Auth and configure the Google OAuth client there
5. Keep Vercel Function max duration at 60 seconds or higher

## GitHub Actions release flow

The repo includes [production-release.yml](.github/workflows/production-release.yml) for a strict release order:

1. run tests and build
2. apply Supabase migrations
3. deploy to Vercel production

Configure these GitHub repository secrets before using it:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If you use this workflow for production releases, disable automatic Vercel production deploys from the Git integration. Otherwise Vercel may deploy `main` before the migration job finishes, which defeats the ordered release flow.

## Notes for clients

- ChatGPT Developer Mode: point it to `https://<your-domain>/api/mcp`
- Claude MCP connector: same endpoint, same bearer auth model
- Generic clients: use the same remote MCP endpoint and OAuth discovery metadata

## Security

- Raw Nomi keys are never logged
- Raw bearer tokens are never logged
- Nomi keys are stored encrypted at rest
- User data access is derived from the bearer token subject, not from MCP tool arguments
