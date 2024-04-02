import { LoaderFunctionArgs } from "react-router-dom";
import { getAccountsAndTags } from '../utils/filterAccounts'

// Shared loader used for filtering accounts based on tags
export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);

    const enableFilters = searchParams.get("enableFilters");
    const filtersEnabled = enableFilters === "enabled";
    let tagsInSearch = new Set(searchParams.getAll("tag"));

    const { accounts, tags } = await getAccountsAndTags(filtersEnabled, tagsInSearch);
    return { accounts, filtersEnabled, tags };
}

export type FilteredAccountsLoaderData = Awaited<ReturnType<typeof loader>>;