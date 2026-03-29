import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { ConfigurationError } from '../shared/errors';

export interface EncryptedCredential {
  ciphertext: string;
  iv: string;
}

export interface CredentialCipher {
  encrypt(plaintext: string): EncryptedCredential;
  decrypt(payload: EncryptedCredential): string;
}

export function createCredentialCipher(encodedKey: string): CredentialCipher {
  const key = decodeEncryptionKey(encodedKey);

  return {
    encrypt(plaintext: string): EncryptedCredential {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();

      return {
        ciphertext: `${ciphertext.toString('base64')}:${tag.toString('base64')}`,
        iv: iv.toString('base64'),
      };
    },
    decrypt(payload: EncryptedCredential): string {
      const [ciphertextBase64, tagBase64] = payload.ciphertext.split(':');
      if (!ciphertextBase64 || !tagBase64) {
        throw new ConfigurationError('Encrypted credential payload is malformed.');
      }

      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));

      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertextBase64, 'base64')),
        decipher.final(),
      ]);

      return plaintext.toString('utf8');
    },
  };
}

function decodeEncryptionKey(encodedKey: string): Buffer {
  const normalized = encodedKey.trim();
  if (!normalized) {
    throw new ConfigurationError('NOMI_KEY_ENCRYPTION_KEY cannot be empty when credential storage is enabled.');
  }

  const candidateBuffers = [
    Buffer.from(normalized, 'base64'),
    Buffer.from(normalized, 'hex'),
  ].filter((buffer) => buffer.length === 32);

  const key = candidateBuffers[0];
  if (key) {
    return key;
  }

  // Fall back to a deterministic SHA-256 derivation so plain UUID-like secrets also work.
  return createHash('sha256').update(normalized, 'utf8').digest();
}
