import { CopyButton as MantineCopyButton, ActionIcon, Text } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { Address } from "@solana/addresses";

export default function CopyButton({ address }: { address: Address }) {
    return (
        <MantineCopyButton value={address} timeout={2000}>
            {({ copied, copy }) => (
                copied ? (
                    <Text size="sm">Copied</Text>
                ) : (
                    <ActionIcon
                        variant="transparent"
                        onClick={(event) => {
                            // prevent following the link it's nested in
                            event.preventDefault();
                            copy();
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        <IconCopy size={16} />
                    </ActionIcon>
                )
            )}
        </MantineCopyButton>
    );
}
