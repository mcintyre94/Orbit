import { FetcherWithComponents, Link, useFetcher, useRouteLoaderData } from "react-router-dom";
import { Box, Button, ButtonGroup, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, VStack } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { AddIcon, SettingsIcon } from "@chakra-ui/icons";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

export default function Home() {
    const loaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const fetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { accounts, filtersEnabled, tags, searchQuery } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <VStack spacing={8} alignItems='flex-start'>
            <ButtonGroup>
                <Link to='/accounts/new'>
                    <Button colorScheme='blue' leftIcon={<AddIcon />}>Add Account</Button>
                </Link>

                <Menu>
                    <MenuButton colorScheme='blue' variant='outline' as={IconButton} icon={<SettingsIcon />} aria-label="settings" />
                    <MenuList>
                        <Link to='/accounts/export'><MenuItem isDisabled={accounts.length === 0 && !filtersEnabled}>Export</MenuItem></Link>
                        <Link to='/accounts/import'><MenuItem>Import</MenuItem></Link>
                    </MenuList>
                </Menu>
            </ButtonGroup>

            <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={fetcher} />

            <Flex direction='column' alignItems='flex-start' width='100%'>
                {accounts.map(account => (
                    <Box width='100%' key={account.address} paddingBottom={1}>
                        <Link to={`/accounts/${account.address}/edit`}>
                            <AccountDisplay account={account} />
                        </Link>
                    </Box>
                ))}
            </Flex>
        </VStack>
    )
}