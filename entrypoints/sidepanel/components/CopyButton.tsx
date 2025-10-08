import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard, Text } from "@chakra-ui/react";
import { Address } from "@solana/addresses";

export default function CopyButton({ address }: { address: Address }) {
    const { onCopy, hasCopied } = useClipboard(address);

    if (hasCopied) {
        return <Text fontSize='sm'>Copied</Text>
    } else {
        return <CopyIcon cursor='pointer' boxSize={4} onClick={(event) => {
            // prevent following the link it's nested in
            event.preventDefault();
            onCopy();
        }} />
    }
}
