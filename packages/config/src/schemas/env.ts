import { z } from 'zod';
import {
    AIDA_DEBUG_TRACE_DEFAULT,
    DEBUG_DEFAULT,
    LOG_LEVEL_DEFAULT,
    LOG_LEVELS,
} from '../constants/env';

export function booleanTransform(value: string | undefined): boolean {
    return value?.toLowerCase() === 'true';
}

export const booleanSchema = z.string().default(DEBUG_DEFAULT).transform(booleanTransform);

/** Public vars shared by `apps/chat` and `apps/vault` (.env.example). */
export const publicEnvBaseSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

/** `apps/vault` — matches vault/.env.example (no vault-domain self-reference). */
export const vaultPublicEnvSchema = publicEnvBaseSchema;

/** `apps/chat` — matches chat/.env.example (link to vault origin). */
export const chatPublicEnvSchema = publicEnvBaseSchema.extend({
    NEXT_PUBLIC_VAULT_DOMAIN: z.string().min(1),
});

/**
 * Alias for `vaultPublicEnvSchema` (minimal public surface).
 * Prefer `vaultPublicEnvSchema` / `chatPublicEnvSchema` for clarity.
 */
export const publicEnvSchema = vaultPublicEnvSchema;

/** Core backend vars used by both api-gateway and background-service. */
export const coreBackendEnvSchema = z.object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    LOG_LEVEL: z.enum(LOG_LEVELS).default(LOG_LEVEL_DEFAULT),
    DEBUG: z.string().default(DEBUG_DEFAULT).transform(booleanTransform),
    AIDA_DEBUG_TRACE: z.string().default(AIDA_DEBUG_TRACE_DEFAULT).transform(booleanTransform),
});

/** `apps/api-gateway` — matches api-gateway/.env.example. */
export const serverEnvSchema = coreBackendEnvSchema.extend({
    PORT: z.coerce.number().int().positive(),
    APP_ENCRYPTION_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    SUPPORT_EMAIL_FROM: z.string().min(1),
    BEDROCK_MODEL_SUMMARIZER: z.string().min(1),
});

/** `apps/background-service` — matches background-service/.env.example. */
export const workerEnvSchema = coreBackendEnvSchema.extend({
    PORT: z.coerce.number().int().positive(),
    BEDROCK_MODEL_SUMMARIZER: z.string().min(1),
    BEDROCK_MODEL_EMBEDDING: z.string().min(1),
});

export type PublicEnvKey = keyof z.infer<typeof vaultPublicEnvSchema>;
export type ChatPublicEnvKey = keyof z.infer<typeof chatPublicEnvSchema>;
export type ServerEnvKey = keyof z.infer<typeof serverEnvSchema>;
export type WorkerEnvKey = keyof z.infer<typeof workerEnvSchema>;

export type PublicEnvBase = z.infer<typeof publicEnvBaseSchema>;
export type VaultPublicEnv = z.infer<typeof vaultPublicEnvSchema>;
export type ChatPublicEnv = z.infer<typeof chatPublicEnvSchema>;
/** @deprecated Prefer `VaultPublicEnv`. */
export type PublicEnv = VaultPublicEnv;

export type CoreBackendEnv = z.infer<typeof coreBackendEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export function formatZodError(error: z.ZodError): string {
    return `Invalid environment variables:\n\n${z.prettifyError(error)}`;
}
