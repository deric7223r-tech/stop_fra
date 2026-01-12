import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validatePassword } from '../dist/utils/password.js';

test('validatePassword rejects weak passwords and accepts strong passwords', () => {
  const weak = validatePassword('abc');
  assert.equal(weak.valid, false);
  assert.ok(weak.errors.length > 0);

  const strong = validatePassword('Test123@Pass');
  assert.equal(strong.valid, true);
  assert.deepEqual(strong.errors, []);
});
