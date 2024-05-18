import { CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { Button, ButtonGroup, Text, VStack, useClipboard } from "@chakra-ui/react";
import { useMemo } from "react";

type Props = {
    text: string;
    contentType: 'text/plain' | 'application/json'
}

export default function ExportableText({ text, contentType }: Props) {
    const clipboard = useClipboard(text);

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
        <VStack spacing={4} alignItems='flex-start'>
            <ButtonGroup size='xs'>
                <Button leftIcon={<CopyIcon />} onClick={() => clipboard.onCopy()}>{clipboard.hasCopied ? 'Copied' : 'Copy'}</Button>
                <Button leftIcon={<DownloadIcon />} onClick={async () => {
                    await chrome.downloads.download({
                        url: downloadUrl,
                        filename: downloadFilename,
                        saveAs: true,
                    })
                }}>Download</Button>
            </ButtonGroup>

            <Text fontSize='md' whiteSpace='pre-wrap' borderWidth='1px' borderRadius='md' padding={2}>{text}</Text>
        </VStack >
    )
}