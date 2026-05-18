import {
    chatPublicEnvSchema,
    vaultPublicEnvSchema,
    type ChatPublicEnv,
    type VaultPublicEnv,
} from '../schemas/env';
import { createCachedProcessEnvGetter } from '../utils/cached-process-env';

export {
    chatPublicEnvSchema,
    publicEnvBaseSchema,
    publicEnvSchema,
    vaultPublicEnvSchema,
    type ChatPublicEnv,
    type PublicEnv,
    type PublicEnvBase,
    type VaultPublicEnv,
} from '../schemas/env';

const vaultPublicEnv = createCachedProcessEnvGetter(vaultPublicEnvSchema);
const chatPublicEnv = createCachedProcessEnvGetter(chatPublicEnvSchema);

/**
 * Reset cached public env. Useful for testing.
 * @internal
 */
export function resetPublicEnvCache(): void {
    vaultPublicEnv.reset();
    chatPublicEnv.reset();
}

/**
 * Validate public env for `apps/vault` (browser-safe).
 * Results are cached for subsequent calls.
 */
export function getVaultPublicEnv(): VaultPublicEnv {
    return vaultPublicEnv.get();
}

/**
 * Validate public env for `apps/chat` (browser-safe).
 * Results are cached for subsequent calls.
 */
export function getChatPublicEnv(): ChatPublicEnv {
    return chatPublicEnv.get();
}

/**
 * Same as {@link getVaultPublicEnv} — minimal public schema (vault app).
 * Prefer `getVaultPublicEnv` or `getChatPublicEnv` for app-specific validation.
 */
export function getPublicEnv(): VaultPublicEnv {
    return getVaultPublicEnv();
}
