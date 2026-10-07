export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  const { code, state, error } = req.query;
  const origin = getOrigin(req);
  const fail = (message: string) => res.redirect(`${origin}/#oauth_error=${encodeURIComponent(message)}`);
  res.setHeader('Set-Cookie', 'github_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  if (error) return fail('GitHub sign-in was canceled or denied. Please try again.');

  let cookies: Record<string, string>;
  try { cookies = parseCookies(req.headers.cookie || ''); }
  catch { return fail('Your sign-in session is invalid. Please sign in again.'); }
  if (typeof state !== 'string' || !state || state !== cookies.github_oauth_state) {
    return fail('Your sign-in session has expired. Please sign in again.');
  }
  if (typeof code !== 'string' || !code) return fail('GitHub did not return a sign-in code. Please try again.');

  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return fail('GitHub sign-in is temporarily unavailable. Please try again later.');

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: getRedirectUri(req) }),
    });
    if (!tokenResponse.ok) return fail('GitHub sign-in could not be completed. Please try again.');
    const token = await tokenResponse.json();
    if (typeof token?.access_token !== 'string' || !token.access_token) return fail('GitHub sign-in could not be completed. Please try again.');
    return res.redirect(`${origin}/#oauth_token=${encodeURIComponent(token.access_token)}`);
  } catch {
    return fail('Unable to connect to GitHub. Please try again.');
  }
}

function parseCookies(value: string): Record<string, string> {
  return Object.fromEntries(value.split(';').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, decodeURIComponent(rest.join('='))];
  }).filter(([key]) => key));
}

function getRedirectUri(req: any) {
  if (process.env.GITHUB_REDIRECT_URI) return process.env.GITHUB_REDIRECT_URI;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}/api/auth/github/callback`;
}

function getOrigin(req: any) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
}
