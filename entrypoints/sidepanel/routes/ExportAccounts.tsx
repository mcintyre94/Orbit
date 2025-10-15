import { FetcherWithComponents, Link as ReactRouterLink, NavLink, Outlet, useFetcher, useRouteLoaderData } from "react-router-dom";
import { Button, Stack, Title, Group, Anchor } from "@mantine/core";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { InlineLink } from "../components/InlineLink";

export default function ExportAccounts() {
    const loaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const fetcher = useFetcher({ key: 'export-accounts-fetcher' }) as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { filtersEnabled, tags, searchQuery } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <Stack gap="lg">
            <Group>
                <NavLink to='/sidepanel.html'>
                    <Anchor component='button'>
                        <Button variant='outline'>
                            Back
                        </Button>
                    </Anchor>
                </NavLink>

                <Title order={2} lineClamp={1}>Export Accounts</Title>
            </Group>

            <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={fetcher} />

            <Group gap="lg">
                <InlineLink to='addresses' label='Addresses' />
                <InlineLink to='accounts' label='Accounts' />
            </Group>

            <Outlet />
        </Stack >
    )
}
