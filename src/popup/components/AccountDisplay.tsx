import { VStack, HStack, Tooltip, Wrap, WrapItem, Tag, Text, useClipboard } from "@chakra-ui/react";
import { loader as filteredAccountsLoader } from '../routes/FilteredAccounts'
import { shortAddress } from "../utils/address";
import { Address } from "@solana/addresses";
import { CopyIcon } from "@chakra-ui/icons";

function CopyButton({ address }: { address: Address }) {
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

interface Props {
    account: Awaited<ReturnType<typeof filteredAccountsLoader>>['accounts'][0]
}

export default function AccountDisplay({ account }: Props) {
    return (
        <VStack padding={4} key={account.address} spacing={1} alignItems='flex-start' _hover={{ backgroundColor: 'gray.700' }}>
            <HStack>
                <Text as='span' fontSize='lg'>{account.label}</Text>
                <Tooltip label={account.address}>
                    <Text as='span' fontSize='md' color='gray.400'>({shortAddress(account.address)})</Text>
                </Tooltip>
                <CopyButton address={account.address} />
            </HStack>
            <Text fontSize='sm'>{account.notes.split('\n').join(', ')}</Text>
            <Wrap>
                {account.tags.map(tag =>
                    <WrapItem key={tag}>
                        <Tag variant='outline' size='sm' key={tag}>{tag}</Tag>
                    </WrapItem>
                )}
            </Wrap>
        </VStack>
    )
}