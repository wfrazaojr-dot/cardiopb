import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import crypto from 'node:crypto';

// deno-lint-ignore no-undef
const GOVBR_CONFIG = {
  authUrl: 'https://sso.acesso.gov.br/authorize',
  tokenUrl: 'https://sso.acesso.gov.br/token',
  jwkUrl: 'https://sso.acesso.gov.br/jwk',
  // deno-lint-ignore no-undef
  clientId: Deno.env.get('GOVBR_CLIENT_ID'),
  // deno-lint-ignore no-undef
  clientSecret: Deno.env.get('GOVBR_CLIENT_SECRET'),
  // deno-lint-ignore no-undef
  redirectUri: Deno.env.get('GOVBR_REDIRECT_URI') || 'https://coracaoparaibano.gov.br/govbr-callback',
};

// Gerar code_verifier e code_challenge para PKCE
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('hex').slice(0, 128);
  const challenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return { codeVerifier, codeChallenge: challenge };
}

// deno-lint-ignore no-undef
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Action 1: Gerar URL de autorização
    if (action === 'generate-auth-url') {
      const nonce = crypto.randomBytes(8).toString('hex');
      const state = crypto.randomBytes(16).toString('hex');
      const { codeVerifier, codeChallenge } = generatePKCE();

      // Armazenar na sessão (via cookie ou localStorage - será feito no frontend)
      const authUrl = new URL(GOVBR_CONFIG.authUrl);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', GOVBR_CONFIG.clientId);
      authUrl.searchParams.append('scope', 'openid email profile');
      authUrl.searchParams.append('redirect_uri', GOVBR_CONFIG.redirectUri);
      authUrl.searchParams.append('nonce', nonce);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');

      return Response.json({
        authUrl: authUrl.toString(),
        state,
        nonce,
        codeVerifier,
      });
    }

    // Action 2: Trocar code por tokens
    if (action === 'exchange-code') {
      const { code, codeVerifier, state: receivedState } = await req.json();

      if (!code || !codeVerifier) {
        return Response.json({ error: 'Missing code or codeVerifier' }, { status: 400 });
      }

      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: GOVBR_CONFIG.redirectUri,
        client_id: GOVBR_CONFIG.clientId,
        client_secret: GOVBR_CONFIG.clientSecret,
        code_verifier: codeVerifier,
      });

      const tokenResponse = await fetch(GOVBR_CONFIG.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('GOV.BR token error:', error);
        return Response.json(
          { error: 'Failed to exchange code for tokens' },
          { status: 400 }
        );
      }

      const tokens = await tokenResponse.json();
      
      // Decodificar ID token para extrair informações do usuário
      const idTokenParts = tokens.id_token.split('.');
      const decodedPayload = JSON.parse(
        atob(idTokenParts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      return Response.json({
        success: true,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        email: decodedPayload.email,
        cpf: decodedPayload.sub,
        name: decodedPayload.name,
        expiresIn: tokens.expires_in,
      });
    }

    // Action 3: Validar se usuário existe
    if (action === 'check-user') {
      const { email } = await req.json();

      const user = await base44.entities.User.filter({ email }, null, 1).catch(() => null);

      if (!user || user.length === 0) {
        return Response.json({ exists: false, status: null });
      }

      return Response.json({
        exists: true,
        status: user[0].status_acesso,
        isActive: user[0].status_acesso === 'ATIVO',
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GOV.BR Auth Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});