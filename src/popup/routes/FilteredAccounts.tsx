import { LoaderFunctionArgs } from "react-router-dom";
import { getAccountsAndTags } from '../utils/filterAccounts'
import { searchAccounts } from '../utils/searchAccounts'

// Shared loader used for filtering accounts based on tags
export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);

    const enableFilters = searchParams.get("enableFilters");
    const filtersEnabled = enableFilters === "enabled";
    let tagsInSearch = new Set(searchParams.getAll("tag"));

    let { accounts, tags } = await getAccountsAndTags(filtersEnabled, tagsInSearch);

    const searchQuery = searchParams.get("search") ?? "";
    if (searchQuery) {
        accounts = searchAccounts(accounts, searchQuery)
    }

    return { accounts, filtersEnabled, searchQuery, tags };
}

export type FilteredAccountsLoaderData = Awaited<ReturnType<typeof loader>>;