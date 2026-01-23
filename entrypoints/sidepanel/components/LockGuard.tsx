import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LockScreen from "./LockScreen";
import {
  getBiometricLockSettings,
  getLockState,
  isBiometricLockEnabled,
  setLockState,
} from "~/biometricLock/storage";
import { authenticateBiometric } from "~/biometricLock/webauthn";

interface LockGuardProps {
  children: React.ReactNode;
}

export default function LockGuard({ children }: LockGuardProps) {
  const [isLocked, setIsLocked] = useState<boolean | null>(null); // null = loading
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string>();
  const location = useLocation();

  // Connect route should remain accessible when locked
  // (Orbit is read-only, so dApp connections are safe)
  const isConnectRoute = location.pathname.startsWith("/accounts/connect");

  useEffect(() => {
    checkLockState();
  }, []);

  async function checkLockState() {
    const enabled = await isBiometricLockEnabled();
    if (!enabled) {
      setIsLocked(false);
      return;
    }

    const state = await getLockState();
    setIsLocked(state.isLocked);
  }

  async function handleUnlock() {
    setIsAuthenticating(true);
    setError(undefined);

    try {
      const settings = await getBiometricLockSettings();
      if (!settings?.credentialId) {
        // No credential, something is wrong - unlock anyway
        await setLockState({ isLocked: false, lastUnlockTimestamp: Date.now() });
        setIsLocked(false);
        return;
      }

      const success = await authenticateBiometric(settings.credentialId);
      if (success) {
        await setLockState({ isLocked: false, lastUnlockTimestamp: Date.now() });
        setIsLocked(false);
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (e) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  // Still loading lock state
  if (isLocked === null) {
    return null;
  }

  // Connect route bypasses lock
  if (isConnectRoute) {
    return <>{children}</>;
  }

  // Show lock screen if locked
  if (isLocked) {
    return (
      <LockScreen
        onUnlock={handleUnlock}
        isAuthenticating={isAuthenticating}
        error={error}
      />
    );
  }

  // Unlocked - render children
  return <>{children}</>;
}
