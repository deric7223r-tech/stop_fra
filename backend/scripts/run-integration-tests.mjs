import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

const res = await fetch(`${baseUrl}/health`);
assert.equal(res.ok, true, `Expected /health to return 2xx, got ${res.status}`);

const body = await res.json();
assert.equal(body.status, 'healthy');

console.log('✅ Integration smoke test passed');
