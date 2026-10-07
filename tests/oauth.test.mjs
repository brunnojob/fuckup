import assert from 'node:assert/strict';
import { test } from 'node:test';
import start from '../api/auth/github/index.ts';
import callback from '../api/auth/github/callback.ts';

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    redirect(url) { this.url = url; return this; } };
}
const request = (query = {}) => ({ method: 'GET', headers: { host: 'example.com', cookie: 'github_oauth_state=valid' }, query });
const error = (res) => new URL(res.url, 'https://example.com').hash.includes('oauth_error=');

test('OAuth login and callback regression cases', async (t) => {
  const previous = { id: process.env.GITHUB_CLIENT_ID, secret: process.env.GITHUB_CLIENT_SECRET, redirect: process.env.GITHUB_REDIRECT_URI, fetch: globalThis.fetch };
  t.after(() => {
    for (const [key, value] of [['GITHUB_CLIENT_ID', previous.id], ['GITHUB_CLIENT_SECRET', previous.secret], ['GITHUB_REDIRECT_URI', previous.redirect]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    globalThis.fetch = previous.fetch;
  });
  process.env.GITHUB_CLIENT_ID = 'client';
  process.env.GITHUB_CLIENT_SECRET = 'secret';
  delete process.env.GITHUB_REDIRECT_URI;

  await t.test('missing either credential returns to the app without starting OAuth', () => {
    for (const key of ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']) {
      const original = process.env[key]; process.env[key] = ' ';
      const res = response(); start(request(), res);
      assert.ok(error(res)); assert.equal(res.headers['Set-Cookie'], undefined);
      assert.equal(res.headers['Cache-Control'], 'no-store');
      process.env[key] = original;
    }
  });
  await t.test('configured login generates a matching state cookie and callback', () => {
    const res = response(); start(request(), res);
    const url = new URL(res.url);
    assert.equal(url.origin, 'https://github.com');
    assert.equal(url.searchParams.get('client_id'), 'client');
    assert.equal(url.searchParams.get('redirect_uri'), 'https://example.com/api/auth/github/callback');
    assert.match(url.searchParams.get('state'), /^[a-f0-9]{48}$/);
    assert.ok(res.headers['Set-Cookie'].startsWith('github_oauth_state=' + url.searchParams.get('state') + ';'));
  });
  await t.test('invalid state, missing code and malformed cookie never exchange a token', async () => {
    globalThis.fetch = () => { throw new Error('unexpected token exchange'); };
    for (const req of [request({ state: 'wrong', code: 'code' }), request({ state: 'valid' }), { ...request({ state: 'valid', code: 'code' }), headers: { host: 'example.com', cookie: 'github_oauth_state=%' } }]) {
      const res = response(); await callback(req, res); assert.ok(error(res));
      assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
    }
  });
  await t.test('provider rejection returns a readable error', async () => {
    const res = response(); await callback(request({ error: 'access_denied' }), res); assert.ok(error(res));
  });
  await t.test('network, HTTP and malformed response failures return to the app', async () => {
    for (const fetcher of [async () => { throw new Error('network'); }, async () => ({ ok: false }), async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }), async () => ({ ok: true, json: async () => ({ error: 'bad_verification_code' }) })]) {
      globalThis.fetch = fetcher;
      const res = response(); await callback(request({ state: 'valid', code: 'code' }), res); assert.ok(error(res));
    }
  });
  await t.test('successful callback preserves frontend token handoff', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ access_token: 'test-token' }) });
    const res = response(); await callback(request({ state: 'valid', code: 'code' }), res);
    assert.equal(res.url, 'https://example.com/#oauth_token=test-token');
    assert.equal(res.headers['Cache-Control'], 'no-store');
  });
  await t.test('both endpoints reject non-GET methods', async () => {
    for (const handler of [start, callback]) {
      const res = response(); await handler({ ...request(), method: 'POST' }, res); assert.equal(res.statusCode, 405);
    }
  });
});
