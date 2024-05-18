import { getSavedAccounts } from "~/accounts/storage";
import { FilteredAccountsLoaderData } from "../routes/FilteredAccounts";

export async function getAccountsAndTags(
  filtersEnabled: boolean,
  tagsInSearch: Set<string>
) {
  let accounts = await getSavedAccounts();

  const allTagNamesSet = new Set(accounts.flatMap((a) => a.tags));
  const allTagNames = [...allTagNamesSet].sort();

  const tags = allTagNames.map((tag) => ({
    tagName: tag,
    selected: filtersEnabled ? tagsInSearch.has(tag) : false,
  }));

  // If filters enabled, show only accounts with any selected tags
  if (filtersEnabled) {
    accounts = accounts.filter((a) => a.tags.some((t) => tagsInSearch.has(t)));
  }

  return { accounts, tags };
}

// Use fetcher data to override loader data if present
export function getFilteredAccountsData(
  loaderData: FilteredAccountsLoaderData,
  fetcherData: FilteredAccountsLoaderData | undefined
): FilteredAccountsLoaderData {
  return fetcherData ?? loaderData;
}

export async function getUnfilteredAccountsData(): Promise<FilteredAccountsLoaderData> {
  const filtersEnabled = false;
  const { accounts, tags } = await getAccountsAndTags(false, new Set());
  return { accounts, filtersEnabled, searchQuery: "", tags };
}
