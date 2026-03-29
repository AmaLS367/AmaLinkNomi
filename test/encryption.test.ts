import test from 'node:test';
import assert from 'node:assert/strict';
import { createCredentialCipher } from '../src/security/credential-cipher';

test('credential cipher encrypts and decrypts API keys', () => {
  const cipher = createCredentialCipher('MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=');

  const encrypted = cipher.encrypt('nomi-secret-key');
  const decrypted = cipher.decrypt(encrypted);

  assert.equal(decrypted, 'nomi-secret-key');
  assert.notEqual(encrypted.ciphertext, 'nomi-secret-key');
  assert.match(encrypted.iv, /^[A-Za-z0-9+/=]+$/);
});

test('credential cipher accepts a Nomi-style UUID key', () => {
  const cipher = createCredentialCipher('7f9c3f69-385f-4a22-afe7-d7b50852cd06');

  const encrypted = cipher.encrypt('nomi-secret-key');
  const decrypted = cipher.decrypt(encrypted);

  assert.equal(decrypted, 'nomi-secret-key');
});
