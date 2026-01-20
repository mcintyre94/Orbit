import { z } from "zod";

export const biometricLockSettingsSchema = z.object({
  isEnabled: z.boolean(),
  credentialId: z.string().nullable(),
  publicKey: z.string().nullable(),
  relyingPartyId: z.string(),
});

export type BiometricLockSettings = z.infer<typeof biometricLockSettingsSchema>;

export const biometricLockStateSchema = z.object({
  isLocked: z.boolean(),
  lastActivityTimestamp: z.number(),
});

export type BiometricLockState = z.infer<typeof biometricLockStateSchema>;
