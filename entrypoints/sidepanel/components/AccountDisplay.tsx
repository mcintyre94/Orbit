import { Stack, Group, Tooltip, Text } from "@mantine/core";
import { loader as filteredAccountsLoader } from '../routes/FilteredAccounts'
import { shortAddress } from "../utils/address";
import CopyButton from "./CopyButton";
import TagBadge from "./TagBadge";
import classes from "../styles/HoverListItem.module.css";

interface Props {
    account: Awaited<ReturnType<typeof filteredAccountsLoader>>['accounts'][0];
    isSelected?: boolean;
}

export default function AccountDisplay({ account, isSelected }: Props) {
    return (
        <Stack
            gap="xs"
            className={classes.listitem}
            style={{
                borderLeft: isSelected ? '4px solid var(--mantine-color-blue-2)' : undefined
            }}
        >
            <Group gap="xs">
                <Text span size="lg" >{account.label}</Text>
                <Tooltip multiline maw="95%" label={account.address}>
                    <Text span size="md" c="gray.3">({shortAddress(account.address)})</Text>
                </Tooltip>
                <CopyButton address={account.address} />
            </Group>
            <Text size="sm">{account.notes.split('\n').filter(n => n.trim() !== '').join(', ')}</Text>
            <Group gap="xs">
                {account.tags.map(tag =>
                    <TagBadge key={tag} isFilled={false} isDisabled={false} color="gray.2">
                        {tag}
                    </TagBadge>
                )}
            </Group>
        </Stack>
    )
}