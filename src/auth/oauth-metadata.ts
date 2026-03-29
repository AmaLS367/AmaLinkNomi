import type { IncomingMessage } from 'http';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { getEnv } from '../config/env';

export function buildProtectedResourceMetadata(req: IncomingMessage) {
  const env = getEnv();
  const resourceServerUrl = new URL('/api/mcp', getRequestOrigin(req));

  return {
    resource: resourceServerUrl.href,
    authorization_servers: [env.SUPABASE_JWT_ISSUER],
    scopes_supported: ['openid', 'email', 'profile'],
    resource_name: 'AmaNomiBridge',
    resource_documentation: new URL('/', getRequestOrigin(req)).href,
  };
}

export function buildAuthorizationServerMetadata() {
  const env = getEnv();
  const issuer = env.SUPABASE_JWT_ISSUER.replace(/\/$/, '');

  return {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    jwks_uri: env.SUPABASE_JWKS_URL,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
    scopes_supported: ['openid', 'email', 'profile'],
  };
}

export function buildWwwAuthenticateHeader(req: IncomingMessage): string {
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(new URL('/api/mcp', getRequestOrigin(req)));
  return `Bearer resource_metadata="${resourceMetadataUrl}", scope="openid email profile"`;
}

export function getRequestOrigin(req: IncomingMessage): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = forwardedHost || req.headers.host || 'localhost:3000';
  const protocol = typeof forwardedProto === 'string' ? forwardedProto : host.toString().includes('localhost') ? 'http' : 'https';

  return `${protocol}://${host}`;
}
