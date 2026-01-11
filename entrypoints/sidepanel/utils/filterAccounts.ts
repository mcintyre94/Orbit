import { getSavedAccounts } from "~/accounts/storage";
import { FilteredAccountsLoaderData } from "../routes/FilteredAccounts";
import { getSavedFilterState } from "./filterState";
import { searchAccounts } from "./searchAccounts";

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
  // Try to restore saved filter state
  const savedState = await getSavedFilterState();

  const filtersEnabled = savedState?.enableFilters ?? false;
  const selectedTags = new Set(savedState?.selectedTags ?? []);

  const { accounts, tags } = await getAccountsAndTags(
    filtersEnabled,
    selectedTags
  );

  let filteredAccounts = accounts;
  const searchQuery = savedState?.search ?? "";

  if (searchQuery) {
    filteredAccounts = searchAccounts(filteredAccounts, searchQuery);
  }

  return {
    accounts: filteredAccounts,
    filtersEnabled,
    searchQuery,
    tags,
  };
}
