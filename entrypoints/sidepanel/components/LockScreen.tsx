import { Stack, Button, Text, Image, Center } from "@mantine/core";
import { IconFingerprint } from "@tabler/icons-react";

interface LockScreenProps {
  onUnlock: () => void;
  isAuthenticating: boolean;
  error?: string;
}

export default function LockScreen({
  onUnlock,
  isAuthenticating,
  error,
}: LockScreenProps) {
  return (
    <Center h="100vh">
      <Stack align="center" gap="xl">
        <Image src="/icon/128.png" w={64} h={64} alt="Orbit" />
        <Text size="xl" fw={600}>
          Orbit is locked
        </Text>
        <Button
          leftSection={<IconFingerprint size={20} />}
          onClick={onUnlock}
          loading={isAuthenticating}
          size="lg"
          autoContrast
        >
          Unlock
        </Button>
        {error && (
          <Text c="red.4" size="sm">
            {error}
          </Text>
        )}
      </Stack>
    </Center>
  );
}
