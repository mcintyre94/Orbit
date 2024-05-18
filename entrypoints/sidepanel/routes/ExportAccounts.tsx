import { FetcherWithComponents, Link as ReactRouterLink, NavLink, Outlet, useFetcher, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { Box, Button, Flex, Link, VStack, Heading, Spacer, HStack } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

export default function ExportAccounts() {
    const loaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const fetcher = useFetcher({ key: 'export-accounts-fetcher' }) as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { filtersEnabled, tags, searchQuery } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <Flex direction='column' minHeight='100vh'>
            <VStack spacing={8} alignItems='flex-start'>
                <Heading alignSelf='center' as='h1' size='xl' noOfLines={1}>Export Accounts</Heading>

                <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={fetcher} />

                <HStack gap='8'>
                    <Link to='addresses' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Addresses</Link>
                    <Link to='accounts' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Accounts</Link>
                </HStack>

                <Outlet />
            </VStack>
            <Spacer />
            <Box marginBottom={8} marginTop={8}>
                <Link to='/sidepanel.html' as={ReactRouterLink}>
                    <Button colorScheme='white' variant='outline'>
                        Back
                    </Button>
                </Link>
            </Box>
        </Flex>
    )
}
