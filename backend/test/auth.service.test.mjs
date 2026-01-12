import assert from 'node:assert/strict';
import { test } from 'node:test';

import { authService } from '../dist/services/auth.service.js';

test('AuthService.validatePassword rejects weak passwords and accepts strong passwords', () => {
  const weak = authService.validatePassword('abc');
  assert.equal(weak.valid, false);
  assert.ok(weak.errors.length > 0);

  const strong = authService.validatePassword('Test123@Pass');
  assert.equal(strong.valid, true);
  assert.deepEqual(strong.errors, []);
});
