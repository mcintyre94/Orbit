import { useState, useEffect } from "react";
import {
  ActionFunctionArgs,
  NavLink,
  useActionData,
  useLoaderData,
  useSubmit,
} from "react-router-dom";
import {
  Button,
  Stack,
  Title,
  Group,
  Text,
  Switch,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFingerprint } from "@tabler/icons-react";
import { checkBiometricSupport, registerBiometric, authenticateBiometric } from "~/biometricLock/webauthn";
import {
  getBiometricLockSettings,
  saveBiometricLockSettings,
  clearBiometricLockSettings,
  setLockState,
} from "~/biometricLock/storage";

export async function loader() {
  const isSupported = await checkBiometricSupport();
  const settings = await getBiometricLockSettings();
  return {
    isSupported,
    isEnabled: settings?.isEnabled ?? false,
    credentialId: settings?.credentialId ?? null,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "enable") {
    try {
      const result = await registerBiometric("orbit-user");
      await saveBiometricLockSettings({
        isEnabled: true,
        credentialId: result.credentialId,
        publicKey: result.publicKey,
        relyingPartyId: window.location.hostname,
      });
      // Start unlocked after enabling
      await setLockState({ isLocked: false, lastActivityTimestamp: Date.now() });
      return { success: true, action: "enabled" };
    } catch (error) {
      console.error("Failed to enable biometric lock:", error);
      return { error: "Failed to enable biometric lock. Please try again." };
    }
  }

  if (intent === "disable") {
    try {
      await clearBiometricLockSettings();
      return { success: true, action: "disabled" };
    } catch (error) {
      console.error("Failed to disable biometric lock:", error);
      return { error: "Failed to disable biometric lock." };
    }
  }

  return null;
}

type LoaderData = Awaited<ReturnType<typeof loader>>;
type ActionData = { success: boolean; action: string } | { error: string } | null;

export default function Settings() {
  const { isSupported, isEnabled, credentialId } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const submit = useSubmit();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Show notifications based on action result
  useEffect(() => {
    if (actionData && "success" in actionData) {
      if (actionData.action === "enabled") {
        notifications.show({
          title: "Biometric lock enabled",
          message: "Orbit will now require authentication to access",
          color: "green",
        });
      } else if (actionData.action === "disabled") {
        notifications.show({
          title: "Biometric lock disabled",
          message: "Orbit no longer requires authentication",
          color: "blue",
        });
      }
    } else if (actionData && "error" in actionData) {
      notifications.show({
        title: "Error",
        message: actionData.error,
        color: "red",
      });
    }
  }, [actionData]);

  async function handleToggle() {
    if (isEnabled) {
      // Disabling requires biometric auth first
      if (!credentialId) {
        // No credential stored, just disable
        submit({ intent: "disable" }, { method: "post" });
        return;
      }

      setIsAuthenticating(true);
      try {
        const success = await authenticateBiometric(credentialId);
        if (success) {
          submit({ intent: "disable" }, { method: "post" });
        } else {
          notifications.show({
            title: "Authentication required",
            message: "Please authenticate to disable biometric lock",
            color: "red",
          });
        }
      } catch (error) {
        notifications.show({
          title: "Authentication failed",
          message: "Could not verify your identity",
          color: "red",
        });
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      // Enabling - just submit the form to trigger registration
      submit({ intent: "enable" }, { method: "post" });
    }
  }

  return (
    <Stack gap="lg">
      <Group>
        <NavLink to="/sidepanel.html">
          <Anchor component="button">
            <Button variant="outline">Back</Button>
          </Anchor>
        </NavLink>
        <Title order={2}>Settings</Title>
      </Group>

      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <IconFingerprint size={24} />
            <Stack gap={4}>
              <Text fw={500}>Enable Lock</Text>
              <Text size="sm" c="dimmed">
                {isSupported
                  ? "Require TouchID or similar to access Orbit"
                  : "Passkey authentication is not available on this device"}
              </Text>
            </Stack>
          </Group>
          {isSupported && (
            <Switch
              checked={isEnabled}
              onChange={handleToggle}
              disabled={isAuthenticating}
              size="md"
            />
          )}
        </Group>
        {isEnabled && (
          <Text size="xs" c="dimmed">
            Note: If you lose access to your passkey, you&apos;ll need to
            re-import your accounts from a backup.
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
