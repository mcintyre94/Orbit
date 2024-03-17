import { SavedAccount } from "./savedAccount";

const SAVED_ACCOUNTS_KEY = "accounts";

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return (await chrome.storage.local
    .get(SAVED_ACCOUNTS_KEY)
    .then((res) => res[SAVED_ACCOUNTS_KEY])
    .then((res) => (res ? JSON.parse(res) : []))) as SavedAccount[];
}

export async function saveNewAccount(newAccount: SavedAccount): Promise<void> {
  const accounts = await getSavedAccounts();

  for (const account of accounts) {
    if (account.address === newAccount.address) {
      throw new Error("Address already exists");
    }

    if (account.label === newAccount.label) {
      throw new Error("Label already exists");
    }
  }

  await chrome.storage.local.set({
    [SAVED_ACCOUNTS_KEY]: JSON.stringify([...accounts, newAccount]),
  });
}

export async function getTags(): Promise<string[]> {
  const accounts = await getSavedAccounts();
  return [...new Set(accounts.flatMap((a) => a.tags))];
}
