import test from 'node:test';
import assert from 'node:assert/strict';
import { mapSupabaseStorageError } from '../src/storage/user-nomi-credentials-store';
import { ConfigurationError } from '../src/shared/errors';

test('mapSupabaseStorageError explains when the Supabase migration is missing', () => {
  const error = mapSupabaseStorageError({
    code: 'PGRST205',
    message: "Could not find the table 'public.user_nomi_credentials' in the schema cache",
  });

  assert.ok(error instanceof ConfigurationError);
  assert.match(error.message, /Apply the Supabase migration for user_nomi_credentials before using onboarding\./);
});
