# Biometric Lock Implementation Plan

This document details the implementation of a biometric lock feature (Touch ID/Windows Hello) using WebAuthn for the Orbit Chrome extension.

## Requirements Summary

| Requirement | Decision |
|-------------|----------|
| **What to protect** | Extension UI (sidepanel routes), but NOT the Connect screen |
| **Lock triggers** | After 30 minutes of inactivity OR browser restart |
| **Auth method** | Biometric only via WebAuthn (Touch ID, Windows Hello, etc.) |
| **Fallback** | None - if biometrics unavailable, feature is unavailable |
| **Recovery** | Data becomes inaccessible if biometrics fail; user can re-import |
| **Settings location** | New Settings route |
| **Disable lock** | Requires biometric auth first |

---

## Phase 1: Core Infrastructure

### 1.1 Add Dependencies

**File:** `package.json`

```json
"dependencies": {
  "@lo-fi/webauthn-local-client": "^0.15.0"
}
```

### 1.2 Create Biometric Lock Storage Module

**New File:** `biometricLock/storage.ts`

```typescript
import { storage } from "#imports";

// Storage keys
const BIOMETRIC_SETTINGS_KEY = "local:biometricLockSettings";
const LOCK_STATE_KEY = "session:biometricLockState";

// Types
interface BiometricLockSettings {
  isEnabled: boolean;
  credentialId: string | null;      // Base64 encoded credential ID
  publicKey: string | null;         // Base64 encoded public key
  relyingPartyId: string;
}

interface BiometricLockState {
  isLocked: boolean;
  lastActivityTimestamp: number;    // Unix timestamp
}

// Functions to implement
export async function getBiometricLockSettings(): Promise<BiometricLockSettings | null>;
export async function saveBiometricLockSettings(settings: BiometricLockSettings): Promise<void>;
export async function clearBiometricLockSettings(): Promise<void>;
export async function getLockState(): Promise<BiometricLockState>;
export async function setLockState(state: BiometricLockState): Promise<void>;
export async function updateLastActivity(): Promise<void>;
export async function isBiometricLockEnabled(): Promise<boolean>;
```

### 1.3 Create WebAuthn Wrapper Module

**New File:** `biometricLock/webauthn.ts`

```typescript
import { supportsWebAuthn, register, auth } from "@lo-fi/webauthn-local-client";

export interface RegistrationResult {
  credentialId: string;
  publicKey: string;
}

export async function checkBiometricSupport(): Promise<boolean>;
export async function registerBiometric(userId: string): Promise<RegistrationResult>;
export async function authenticateBiometric(credentialId: string): Promise<boolean>;
```

**Implementation Notes:**
- Use `supportsWebAuthn` to check device capability
- Set `userVerification: "required"` to force biometric (not just PIN)
- Handle errors: `NotAllowedError` (cancelled), `NotSupportedError`, `SecurityError`

### 1.4 Create Zod Schemas

**New File:** `biometricLock/schemas.ts`

```typescript
import { z } from "zod";

export const biometricLockSettingsSchema = z.object({
  isEnabled: z.boolean(),
  credentialId: z.string().nullable(),
  publicKey: z.string().nullable(),
  relyingPartyId: z.string(),
});

export type BiometricLockSettings = z.infer<typeof biometricLockSettingsSchema>;
```

---

## Phase 2: Lock Screen UI

### 2.1 Create Lock Screen Component

**New File:** `entrypoints/sidepanel/components/LockScreen.tsx`

```tsx
import { Stack, Button, Text, Image, Center } from "@mantine/core";
import { IconFingerprint } from "@tabler/icons-react";

interface LockScreenProps {
  onUnlock: () => void;
  isAuthenticating: boolean;
  error?: string;
}

export default function LockScreen({ onUnlock, isAuthenticating, error }: LockScreenProps) {
  return (
    <Center h="100vh">
      <Stack align="center" gap="xl">
        <Image src="/icon/128.png" w={64} h={64} alt="Orbit" />
        <Text size="xl" fw={600}>Orbit is locked</Text>
        <Button
          leftSection={<IconFingerprint size={20} />}
          onClick={onUnlock}
          loading={isAuthenticating}
          size="lg"
          autoContrast
        >
          Unlock
        </Button>
        {error && <Text c="red.4" size="sm">{error}</Text>}
      </Stack>
    </Center>
  );
}
```

---

## Phase 3: Settings Route

### 3.1 Create Settings Route

**New File:** `entrypoints/sidepanel/routes/Settings.tsx`

```tsx
import { Form, useLoaderData, Link } from "react-router-dom";
import { Button, Stack, Title, Group, Text, Switch, Card } from "@mantine/core";
import { IconArrowLeft, IconFingerprint } from "@tabler/icons-react";

export async function loader() {
  const isSupported = await checkBiometricSupport();
  const settings = await getBiometricLockSettings();
  return {
    isSupported,
    isEnabled: settings?.isEnabled ?? false
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "enable") {
    const result = await registerBiometric("orbit-user");
    await saveBiometricLockSettings({
      isEnabled: true,
      credentialId: result.credentialId,
      publicKey: result.publicKey,
      relyingPartyId: window.location.hostname
    });
    return { success: true };
  }

  if (intent === "disable") {
    // Called after successful auth verification in component
    await clearBiometricLockSettings();
    return { success: true };
  }

  return null;
}

export default function Settings() {
  const { isSupported, isEnabled } = useLoaderData();

  return (
    <Stack gap="lg">
      <Group>
        <Link to="/accounts/home">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
            Back
          </Button>
        </Link>
        <Title order={3}>Settings</Title>
      </Group>

      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="sm">
              <IconFingerprint size={24} />
              <Text fw={500}>Biometric Lock</Text>
            </Group>
            {isSupported ? (
              <Form method="post">
                <input type="hidden" name="intent" value={isEnabled ? "disable" : "enable"} />
                <Switch checked={isEnabled} onChange={(e) => e.target.form?.requestSubmit()} />
              </Form>
            ) : (
              <Text size="sm" c="dimmed">Not available</Text>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {isSupported
              ? "Require Touch ID or Windows Hello to access Orbit"
              : "Biometric authentication is not available on this device"
            }
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
```

### 3.2 Update Home Settings Menu

**Modify:** `entrypoints/sidepanel/routes/Home.tsx`

Add Settings link to the menu dropdown:

```tsx
<Menu.Dropdown>
  <Link to='/accounts/settings'>
    <Menu.Item>Settings</Menu.Item>
  </Link>
  <Link to='/accounts/export'>
    <Menu.Item disabled={accounts.length === 0 && !filtersEnabled}>Export</Menu.Item>
  </Link>
  <Link to='/accounts/import'>
    <Menu.Item>Import</Menu.Item>
  </Link>
</Menu.Dropdown>
```

---

## Phase 4: Router Integration

### 4.1 Create Lock Guard Component

**New File:** `entrypoints/sidepanel/components/LockGuard.tsx`

```tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LockScreen from "./LockScreen";

interface LockGuardProps {
  children: React.ReactNode;
}

export default function LockGuard({ children }: LockGuardProps) {
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string>();
  const location = useLocation();

  // Skip lock for Connect route (read-only, low risk)
  const isConnectRoute = location.pathname.startsWith("/accounts/connect");

  useEffect(() => {
    checkLockState();
  }, []);

  // Update activity timestamp on navigation
  useEffect(() => {
    if (!isLocked) {
      updateLastActivity();
    }
  }, [location.pathname]);

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
      const success = await authenticateBiometric(settings.credentialId);
      if (success) {
        await setLockState({ isLocked: false, lastActivityTimestamp: Date.now() });
        setIsLocked(false);
      }
    } catch (e) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (isLocked === null) return null; // Loading
  if (isConnectRoute) return <>{children}</>;
  if (isLocked) return <LockScreen onUnlock={handleUnlock} isAuthenticating={isAuthenticating} error={error} />;

  return <>{children}</>;
}
```

### 4.2 Update Layout

**Modify:** `entrypoints/sidepanel/layout.tsx`

```tsx
import { Box } from "@mantine/core";
import { Outlet } from "react-router-dom";
import LockGuard from "./components/LockGuard";

export default function Layout() {
  return (
    <LockGuard>
      <Box m='md'>
        <Outlet />
      </Box>
    </LockGuard>
  );
}
```

### 4.3 Add Settings Route to Router

**Modify:** `entrypoints/sidepanel/main.tsx`

```tsx
import Settings, { loader as settingsLoader, action as settingsAction } from './routes/Settings';

// Add to router children under accounts:
{
  path: "settings",
  loader: settingsLoader,
  action: settingsAction,
  element: <Settings />,
}
```

---

## Phase 5: Inactivity Timer & Browser Restart

### 5.1 Activity Tracker

**New File:** `biometricLock/activityTracker.ts`

```typescript
import { updateLastActivity, isBiometricLockEnabled } from "./storage";

let isTracking = false;

export function startActivityTracking() {
  if (isTracking) return;
  isTracking = true;

  const events = ["click", "keydown", "scroll", "focus"];

  const handler = debounce(async () => {
    const enabled = await isBiometricLockEnabled();
    if (enabled) {
      await updateLastActivity();
    }
  }, 1000);

  events.forEach(event => {
    document.addEventListener(event, handler, { passive: true });
  });
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### 5.2 Background Script Updates

**Modify:** `entrypoints/background/index.ts`

```typescript
const LOCK_ALARM_NAME = "biometricLockAlarm";
const INACTIVITY_TIMEOUT_MINUTES = 30;

// Lock on browser startup
browser.runtime.onStartup.addListener(async () => {
  const enabled = await isBiometricLockEnabled();
  if (enabled) {
    await setLockState({ isLocked: true, lastActivityTimestamp: 0 });
  }
});

// Set up inactivity check alarm (every 5 minutes)
browser.alarms.create(LOCK_ALARM_NAME, { periodInMinutes: 5 });

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === LOCK_ALARM_NAME) {
    const enabled = await isBiometricLockEnabled();
    if (!enabled) return;

    const state = await getLockState();
    if (state.isLocked) return;

    const inactiveMs = Date.now() - state.lastActivityTimestamp;
    if (inactiveMs >= INACTIVITY_TIMEOUT_MINUTES * 60 * 1000) {
      await setLockState({ isLocked: true, lastActivityTimestamp: state.lastActivityTimestamp });
    }
  }
});
```

---

## Phase 6: Permissions

**Modify:** `wxt.config.ts`

```typescript
manifest: {
  permissions: ["sidePanel", "storage", "downloads", "alarms"],
},
```

---

## File Summary

### New Files

| File | Purpose |
|------|---------|
| `biometricLock/storage.ts` | Lock settings and state persistence |
| `biometricLock/webauthn.ts` | WebAuthn wrapper for biometric ops |
| `biometricLock/schemas.ts` | Zod schemas for validation |
| `biometricLock/activityTracker.ts` | User activity tracking |
| `entrypoints/sidepanel/components/LockScreen.tsx` | Lock screen UI |
| `entrypoints/sidepanel/routes/Settings.tsx` | Settings route |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add `@lo-fi/webauthn-local-client` |
| `wxt.config.ts` | Add `alarms` permission |
| `entrypoints/sidepanel/main.tsx` | Add Settings route, init activity tracking |
| `entrypoints/sidepanel/layout.tsx` | Wrap with LockGuard |
| `entrypoints/sidepanel/routes/Home.tsx` | Add Settings menu item |
| `entrypoints/background/index.ts` | Inactivity timer, browser startup handler |

---

## Implementation Order

1. **Phase 1** - Core infrastructure (storage, webauthn, schemas)
2. **Phase 2** - Lock screen UI
3. **Phase 3** - Settings route + Home menu update
4. **Phase 4** - Router integration (LockGuard)
5. **Phase 5** - Inactivity timer + browser restart detection
6. **Phase 6** - Permission updates

---

## Edge Cases & Considerations

### Session vs Local Storage
- `session:` for lock state (clears on browser close = re-auth required)
- `local:` for settings/credentials (persists)

### Connect Route Exemption
The Connect route remains accessible when locked because Orbit is read-only.

### WebAuthn Errors to Handle
- `NotAllowedError` - User cancelled or timeout
- `NotSupportedError` - Feature not supported
- `SecurityError` - Invalid origin

### Credential Invalidation
If user removes biometrics from device settings, auth will fail. User must re-import data.

---

## Resources

- [@lo-fi/webauthn-local-client](https://github.com/mylofi/webauthn-local-client)
- [Web Authentication API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
