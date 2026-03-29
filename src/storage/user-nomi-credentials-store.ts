import { createCredentialCipher, type CredentialCipher } from '../security/credential-cipher';
import { getEnv } from '../config/env';
import { ConfigurationError, CredentialNotConfiguredError } from '../shared/errors';
import { getSupabaseServiceClient } from '../supabase/service-client';

interface StoredCredentialRow {
  user_id: string;
  nomi_api_key_encrypted: string;
  nomi_api_key_iv: string;
  nomi_api_key_last4: string;
  validated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CredentialStatus {
  configured: boolean;
  last4: string | null;
  validatedAt: string | null;
  updatedAt: string | null;
}

export class UserNomiCredentialsStore {
  private readonly cipher: CredentialCipher;

  constructor(cipher = createCredentialCipher(resolveCredentialSeed())) {
    this.cipher = cipher;
  }

  async getStatus(userId: string): Promise<CredentialStatus> {
    const row = await this.getRow(userId);
    if (!row) {
      return {
        configured: false,
        last4: null,
        validatedAt: null,
        updatedAt: null,
      };
    }

    return {
      configured: true,
      last4: row.nomi_api_key_last4,
      validatedAt: row.validated_at,
      updatedAt: row.updated_at,
    };
  }

  async getApiKey(userId: string): Promise<string> {
    const row = await this.getRow(userId);
    if (!row) {
      throw new CredentialNotConfiguredError();
    }

    return this.cipher.decrypt({
      ciphertext: row.nomi_api_key_encrypted,
      iv: row.nomi_api_key_iv,
    });
  }

  async upsertApiKey(userId: string, apiKey: string): Promise<CredentialStatus> {
    const encrypted = this.cipher.encrypt(apiKey);
    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      nomi_api_key_encrypted: encrypted.ciphertext,
      nomi_api_key_iv: encrypted.iv,
      nomi_api_key_last4: apiKey.slice(-4),
      validated_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseServiceClient();
    const result = await supabase
      .from('user_nomi_credentials')
      .upsert(payload, { onConflict: 'user_id' })
      .select('nomi_api_key_last4, validated_at, updated_at')
      .single();

    if (result.error) {
      throw result.error;
    }

    return {
      configured: true,
      last4: result.data.nomi_api_key_last4,
      validatedAt: result.data.validated_at,
      updatedAt: result.data.updated_at,
    };
  }

  async deleteApiKey(userId: string): Promise<void> {
    const supabase = getSupabaseServiceClient();
    const result = await supabase.from('user_nomi_credentials').delete().eq('user_id', userId);
    if (result.error) {
      throw result.error;
    }
  }

  private async getRow(userId: string): Promise<StoredCredentialRow | null> {
    const supabase = getSupabaseServiceClient();
    const result = await supabase
      .from('user_nomi_credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle<StoredCredentialRow>();

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }
}

function resolveCredentialSeed(): string {
  const env = getEnv();
  const seed = env.NOMI_KEY_ENCRYPTION_KEY ?? env.NOMI_API_KEY;

  if (!seed) {
    throw new ConfigurationError(
      'Either NOMI_API_KEY or NOMI_KEY_ENCRYPTION_KEY must be configured to enable encrypted credential storage.'
    );
  }

  return seed;
}
