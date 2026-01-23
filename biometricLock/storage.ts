import { storage } from "#imports";
import {
  BiometricLockSettings,
  BiometricLockState,
  biometricLockSettingsSchema,
  biometricLockStateSchema,
} from "./schemas";

// local: persists across browser sessions
// session: clears on browser close (forces re-auth on restart)
const BIOMETRIC_SETTINGS_KEY = "local:biometricLockSettings";
const LOCK_STATE_KEY = "session:biometricLockState";

export async function getBiometricLockSettings(): Promise<BiometricLockSettings | null> {
  try {
    const jsonOrNull = await storage.getItem<string>(BIOMETRIC_SETTINGS_KEY);
    if (!jsonOrNull) {
      return null;
    }

    const parsed = JSON.parse(jsonOrNull);
    const result = biometricLockSettingsSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    console.error("Invalid biometric lock settings:", result.error);
    return null;
  } catch (error) {
    console.error("Error reading biometric lock settings:", error);
    return null;
  }
}

export async function saveBiometricLockSettings(
  settings: BiometricLockSettings
): Promise<void> {
  await storage.setItem<string>(
    BIOMETRIC_SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

export async function clearBiometricLockSettings(): Promise<void> {
  await storage.removeItem(BIOMETRIC_SETTINGS_KEY);
  await storage.removeItem(LOCK_STATE_KEY);
}

export async function getLockState(): Promise<BiometricLockState> {
  try {
    const jsonOrNull = await storage.getItem<string>(LOCK_STATE_KEY);
    if (!jsonOrNull) {
      // Default to locked if no state exists (e.g., after browser restart)
      return { isLocked: true, lastUnlockTimestamp: 0 };
    }

    const parsed = JSON.parse(jsonOrNull);
    const result = biometricLockStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    // Invalid state, default to locked
    return { isLocked: true, lastUnlockTimestamp: 0 };
  } catch (error) {
    console.error("Error reading lock state:", error);
    return { isLocked: true, lastUnlockTimestamp: 0 };
  }
}

export async function setLockState(state: BiometricLockState): Promise<void> {
  await storage.setItem<string>(LOCK_STATE_KEY, JSON.stringify(state));
}

export async function isBiometricLockEnabled(): Promise<boolean> {
  const settings = await getBiometricLockSettings();
  return settings?.isEnabled ?? false;
}
