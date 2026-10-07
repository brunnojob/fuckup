import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDatabaseUrl } from '../lib/database-config.ts';

test('missing or blank database variables report no connection', () => {
  assert.equal(getDatabaseUrl({}), undefined);
  assert.equal(getDatabaseUrl({ DATABASE_URL: ' ', POSTGRES_PRISMA_URL: '', POSTGRES_URL: '\n' }), undefined);
});
test('connection variable priority is deterministic', () => {
  assert.equal(getDatabaseUrl({ DATABASE_URL: ' primary ', POSTGRES_PRISMA_URL: 'pooled', POSTGRES_URL: 'legacy' }), 'primary');
  assert.equal(getDatabaseUrl({ DATABASE_URL: ' ', POSTGRES_PRISMA_URL: ' pooled ', POSTGRES_URL: 'legacy' }), 'pooled');
  assert.equal(getDatabaseUrl({ POSTGRES_URL: ' legacy ' }), 'legacy');
});
