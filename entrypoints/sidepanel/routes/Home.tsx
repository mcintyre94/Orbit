import { FetcherWithComponents, Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import { Box, Button, Group, Stack, Menu, ActionIcon, Text } from "@mantine/core";
import { IconPlus, IconSettings } from "@tabler/icons-react";
import { useEffect } from "react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { saveFilterState } from "../utils/filterState";

export default function Home() {
    const loaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const fetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { accounts, filtersEnabled, tags, searchQuery } = getFilteredAccountsData(loaderData, fetcher.data)

    // Save filter state whenever it changes
    useEffect(() => {
        const currentState = getFilteredAccountsData(loaderData, fetcher.data);

        if (fetcher.state === 'idle' && currentState) {
            const selectedTags = currentState.tags
                .filter(t => t.selected)
                .map(t => t.tagName);

            saveFilterState({
                enableFilters: currentState.filtersEnabled,
                search: currentState.searchQuery,
                selectedTags
            });
        }
    }, [loaderData, fetcher.data, fetcher.state]);

    return (
        <Stack gap="lg" align="flex-start">
            <Group>
                <Link to='/accounts/new'>
                    <Button leftSection={<IconPlus size={16} />} autoContrast>Add Account</Button>
                </Link>

                <Menu width={150}>
                    <Menu.Target>
                        <ActionIcon variant="outline" aria-label="settings" size="lg" color="blue.2">
                            <IconSettings size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Link to='/accounts/settings'>
                            <Menu.Item>Settings</Menu.Item>
                        </Link>
                        <Menu.Divider />
                        <Link to='/accounts/export'>
                            <Menu.Item disabled={accounts.length === 0 && !filtersEnabled}>Export</Menu.Item>
                        </Link>
                        <Link to='/accounts/import'>
                            <Menu.Item>Import</Menu.Item>
                        </Link>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={fetcher} />

            <Stack align="flex-start" w="100%" gap={0}>
                {accounts.length === 0 ? (
                    <Text c="dimmed" size="sm">
                        {searchQuery || filtersEnabled
                            ? 'No accounts match your search or filter criteria'
                            : 'No accounts yet. Click "Add Account" to get started.'}
                    </Text>
                ) : (
                    accounts.map(account => (
                        <Box w="100%" key={account.address}>
                            <Link to={`/accounts/${account.address}`}>
                                <AccountDisplay account={account} />
                            </Link>
                        </Box>
                    ))
                )}
            </Stack>
        </Stack>
    )
}