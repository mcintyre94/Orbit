import { z } from "zod";

export const biometricLockSettingsSchema = z.object({
  isEnabled: z.boolean(),
  credentialId: z.string(),
  publicKey: z.string(),
  relyingPartyId: z.string(),
});

export type BiometricLockSettings = z.infer<typeof biometricLockSettingsSchema>;

// Tracks when the extension was last unlocked (not continuous activity)
// Used to lock after 30 minutes since unlock
export const biometricLockStateSchema = z.object({
  isLocked: z.boolean(),
  lastUnlockTimestamp: z.number(),
});

export type BiometricLockState = z.infer<typeof biometricLockStateSchema>;
