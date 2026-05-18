import { serverEnvSchema, type ServerEnv } from '../schemas/env';
import { createCachedProcessEnvGetter } from '../utils/cached-process-env';

export { serverEnvSchema, type ServerEnv };

const serverEnv = createCachedProcessEnvGetter(serverEnvSchema);

/**
 * Reset the cached server env. Useful for testing.
 * @internal
 */
export const resetServerEnvCache = serverEnv.reset;

/**
 * Get server environment variables - backend only, contains secrets.
 * Validates required server env vars and returns them with proper types.
 * Results are cached for subsequent calls.
 * Never import this in frontend code.
 */
export function getServerEnv(): ServerEnv {
    return serverEnv.get();
}
