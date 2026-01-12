import assert from 'node:assert/strict';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

try {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.ok, true, `Expected /health to return 2xx, got ${res.status}`);

  const body = await res.json();
  assert.equal(body.status, 'healthy');

  console.log('✅ Integration smoke test passed');
} catch (err) {
  const maybeCode = err?.cause?.code || err?.code;
  if (maybeCode === 'ECONNREFUSED') {
    console.error(`❌ Integration smoke test failed: could not connect to ${baseUrl}`);
    console.error('Start the backend first (e.g. `npm run dev`) or set API_URL to the running server.');
    process.exit(1);
  }

  throw err;
}
