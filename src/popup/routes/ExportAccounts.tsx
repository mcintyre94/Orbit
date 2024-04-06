import { FetcherWithComponents, Link as ReactRouterLink, NavLink, Outlet, useFetcher, useLoaderData } from "react-router-dom";
import { Box, Button, ButtonGroup, Flex, Link, Tab, TabList, TabPanel, TabPanels, Tabs, VStack, Text, useClipboard, Heading, Spacer, HStack } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData, getUnfilteredAccountsData } from "../utils/filterAccounts";
import { CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

export async function loader(): Promise<FilteredAccountsLoaderData> {
    return getUnfilteredAccountsData();
}

export default function ExportAccounts() {
    const loaderData = useLoaderData() as FilteredAccountsLoaderData;
    const fetcher = useFetcher({ key: 'export-accounts-fetcher' }) as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { filtersEnabled, tags } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <Flex direction='column' minHeight='100vh'>
            <VStack spacing={8} alignItems='flex-start'>
                <Heading alignSelf='center' as='h1' size='xl' noOfLines={1}>Export Accounts</Heading>

                <TagFilters tags={tags} filtersEnabled={filtersEnabled} fetcher={fetcher} />

                <HStack gap='8'>
                    <Link to='addresses' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Addresses</Link>
                    <Link to='accounts' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Accounts</Link>
                </HStack>

                <Outlet />
            </VStack>
            <Spacer />
            <Box marginBottom={8} marginTop={8}>
                <Link to='/index.html' as={ReactRouterLink}>
                    <Button colorScheme='white' variant='outline'>
                        Back
                    </Button>
                </Link>
            </Box>
        </Flex>
    )
}
