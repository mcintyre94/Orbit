import { FetcherWithComponents, Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import { Box, Button, Group, Stack, Menu, ActionIcon, Flex } from "@mantine/core";
import { IconPlus, IconSettings } from "@tabler/icons-react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

export default function Home() {
    const loaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const fetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { accounts, filtersEnabled, tags, searchQuery } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <Stack gap="lg" align="flex-start">
            <Group>
                <Link to='/accounts/new'>
                    <Button leftSection={<IconPlus size={16} />} autoContrast>Add Account</Button>
                </Link>

                <Menu>
                    <Menu.Target>
                        <ActionIcon variant="outline" aria-label="settings" size="lg" color="blue.2">
                            <IconSettings size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Link to='/accounts/export/addresses'>
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
                {accounts.map(account => (
                    <Box w="100%" key={account.address}>
                        <Link to={`/accounts/${account.address}`}>
                            <AccountDisplay account={account} />
                        </Link>
                    </Box>
                ))}
            </Stack>
        </Stack>
    )
}