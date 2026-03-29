import type { IncomingMessage } from 'http';
import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { OAUTH_SCOPES_SUPPORTED } from './local-oauth-provider';

export function buildProtectedResourceMetadata(req: IncomingMessage) {
  const resourceServerUrl = new URL('/api/mcp', getRequestOrigin(req));

  return {
    resource: resourceServerUrl.href,
    authorization_servers: [getRequestOrigin(req)],
    scopes_supported: OAUTH_SCOPES_SUPPORTED,
    resource_name: 'AmaNomiBridge',
    resource_documentation: new URL('/', getRequestOrigin(req)).href,
  };
}

export function buildAuthorizationServerMetadata(req: IncomingMessage) {
  const issuer = getRequestOrigin(req);
  return {
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    registration_endpoint: `${issuer}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
    scopes_supported: OAUTH_SCOPES_SUPPORTED,
  };
}

export function buildWwwAuthenticateHeader(req: IncomingMessage): string {
  const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(new URL('/api/mcp', getRequestOrigin(req)));
  return `Bearer resource_metadata="${resourceMetadataUrl}", scope="${OAUTH_SCOPES_SUPPORTED.join(' ')}"`;
}

export function getRequestOrigin(req: IncomingMessage): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = forwardedHost || req.headers.host || 'localhost:3000';
  const normalizedHost = host.toString();
  const protocol =
    typeof forwardedProto === 'string'
      ? forwardedProto
      : normalizedHost.includes('localhost') || normalizedHost.includes('127.0.0.1')
        ? 'http'
        : 'https';

  return `${protocol}://${host}`;
}
