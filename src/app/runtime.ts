import { getEnv } from '../config/env';
import { AuthError } from '../shared/errors';
import { NomiApiClient } from '../nomi/nomi-client';
import { UserNomiCredentialsStore } from '../storage/user-nomi-credentials-store';
import type { AuthenticatedUser } from '../auth/token-auth';

export interface AppRuntime {
  getNomiClient(): Promise<NomiApiClient>;
  authUser: AuthenticatedUser | null;
}

export function createAppRuntime(authUser: AuthenticatedUser | null): AppRuntime {
  const env = getEnv();
  const store = new UserNomiCredentialsStore();
  let clientPromise: Promise<NomiApiClient> | null = null;

  return {
    authUser,
    async getNomiClient() {
      if (!clientPromise) {
        clientPromise = resolveApiKey(env, store, authUser).then((apiKey) =>
          new NomiApiClient({
            apiKey,
            baseUrl: env.NOMI_API_BASE_URL,
          })
        );
      }

      return clientPromise;
    },
  };
}

async function resolveApiKey(
  env: ReturnType<typeof getEnv>,
  store: UserNomiCredentialsStore,
  authUser: AuthenticatedUser | null
): Promise<string> {
  if (authUser) {
    try {
      return await store.getApiKey(authUser.id);
    } catch (error) {
      if (env.NOMI_API_KEY) {
        return env.NOMI_API_KEY;
      }

      throw error;
    }
  }

  if (env.NOMI_API_KEY) {
    return env.NOMI_API_KEY;
  }

  throw new AuthError('Authentication required for Nomi tools.');
}
