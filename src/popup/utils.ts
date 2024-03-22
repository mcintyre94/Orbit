import { getSavedAccounts } from "../accounts/storage";

export function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

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
