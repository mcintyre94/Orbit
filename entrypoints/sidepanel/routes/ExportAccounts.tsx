import { FetcherWithComponents, Link as ReactRouterLink, NavLink, Outlet, useFetcher, useRouteLoaderData } from "react-router-dom";
import { Button, Stack, Title, Group, Anchor } from "@mantine/core";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { IconArrowLeft } from "@tabler/icons-react";

function SubLink({ to, label }: { to: string, label: string }) {
    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <Anchor
                    size="lg"
                    underline="never"
                    style={{
                        color: isActive ? 'var(--mantine-color-blue-2)' : 'var(--mantine-color-white)',
                        textDecoration: isActive ? 'underline' : undefined,
                    }}
                >
                    {label}
                </Anchor>
            )}
        </NavLink>
    )
}

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
                <SubLink to='addresses' label='Addresses' />
                <SubLink to='accounts' label='Accounts' />
            </Group>

            <Outlet />
        </Stack >
    )
}
