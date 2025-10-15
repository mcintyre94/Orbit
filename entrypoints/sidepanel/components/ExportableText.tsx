import { Button, Group, Stack, Code, alpha } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCopy, IconDownload, IconCheck } from "@tabler/icons-react";
import { useMemo } from "react";

type Props = {
    text: string;
    contentType: 'text/plain' | 'application/json'
}

export default function ExportableText({ text, contentType }: Props) {
    const clipboard = useClipboard();

    const downloadUrl = useMemo(() => {
        const blob = new Blob([text], { type: contentType });
        return URL.createObjectURL(blob);
    }, [text, contentType]);

    const downloadFilename = useMemo(() => {
        if (contentType === 'application/json') {
            return 'accounts.json'
        } else {
            return 'addresses.txt'
        }
    }, [contentType]);

    return (
        <Stack gap="md" align="flex-start">
            <Group gap="xs">
                <Button
                    size="xs"
                    variant="light"
                    leftSection={clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    onClick={() => clipboard.copy(text)}
                >
                    {clipboard.copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={14} />}
                    onClick={async () => {
                        await browser.downloads.download({
                            url: downloadUrl,
                            filename: downloadFilename,
                            saveAs: true,
                        })
                    }}
                >
                    Download
                </Button>
            </Group>

            <Code block c="white" styles={{
                root: {
                    background: 'transparent',
                    border: '1px solid var(--mantine-color-default-border)',
                    borderRadius: 'var(--mantine-radius-default)',
                    fontSize: 'var(--mantine-font-size-sm)',
                    padding: 'var(--mantine-spacing-sm)',
                    whiteSpace: 'pre-wrap',
                }
            }}>{text}</Code>
        </Stack>
    )
}
