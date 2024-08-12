import { SavedAccount } from "../../../accounts/savedAccount";

// TODO: should this be using locale compare?
export function searchAccounts(accounts: SavedAccount[], searchQuery: string) {
  const queryLowercase = searchQuery.toLowerCase();

  return accounts.filter(
    (account) =>
      account.label.toLowerCase().includes(queryLowercase) ||
      account.notes.toLowerCase().includes(queryLowercase) ||
      // addresses are case sensitive, but might be useful to search insensitively
      account.address.toLowerCase().includes(queryLowercase)
  );
}
