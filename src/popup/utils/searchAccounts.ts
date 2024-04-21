import { SavedAccount } from "../../accounts/savedAccount";

// TODO: should this be using locale compare?
export function searchAccounts(accounts: SavedAccount[], searchQuery: string) {
  return accounts.filter(
    (account) =>
      account.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
