# AmaNomiBridge

Remote MCP server gateway for the [Nomi API](https://api.nomi.ai/docs). Connects ChatGPT, Claude, and other MCP-compatible agents to your Nomi characters.

```
AI Agent → AmaNomiBridge → Nomi API
```

## Tools

| Tool | Description |
|------|-------------|
| `list_nomis` | List all Nomi characters on your account |
| `get_nomi` | Get details for a specific Nomi by ID |
| `send_message` | Send a message to a Nomi and receive their reply |
| `list_rooms` | List all rooms on your account |
| `send_room_message` | Send a message in a specific room |

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd ama-nomi-bridge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NOMI_API_KEY=your-nomi-api-key        # from nomi.ai → Profile → Integration
MCP_AUTH_TOKEN=your-secret-token      # any strong secret you choose
```

### 3. Build and run locally

```bash
npm run build
npm start
```

The MCP endpoint will be available at `http://localhost:3000/api/mcp`.

For development with auto-reload:

```bash
npm run dev
```

## Connecting an MCP client

Configure your MCP client (Claude Desktop, ChatGPT, etc.) with:

- **URL**: `http://localhost:3000/api/mcp` (local) or `https://<your-deployment>/api/mcp` (Vercel)
- **Auth header**: `Authorization: Bearer <MCP_AUTH_TOKEN>`
  - Alternative: `X-API-Key: <MCP_AUTH_TOKEN>`

## Deploy to Vercel

### Via CLI

```bash
npm i -g vercel
vercel
```

### Environment variables (Vercel dashboard)

Set these in your Vercel project settings → Environment Variables:

```
NOMI_API_KEY=your-nomi-api-key
MCP_AUTH_TOKEN=your-secret-mcp-auth-token
```

The endpoint will be live at `https://<project>.vercel.app/api/mcp`.

## Project structure

```
src/
  config/       env validation
  shared/       logger, errors, http helpers
  auth/         incoming request authentication
  nomi/         Nomi API client + types
  validation/   Zod schemas
  tools/        MCP tool handlers
  app/          server factory + Express bootstrap
  adapters/     Vercel-specific request handler
api/
  mcp.ts        Vercel serverless entry point
```

## Security

- `NOMI_API_KEY` is only used server-side, never exposed to clients
- All requests to `/api/mcp` require a valid `MCP_AUTH_TOKEN`
- Secrets are never logged
