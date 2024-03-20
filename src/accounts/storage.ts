import { Address } from "@solana/web3.js";
import { SavedAccount } from "./savedAccount";

const SAVED_ACCOUNTS_KEY = "accounts";

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return (await chrome.storage.local
    .get(SAVED_ACCOUNTS_KEY)
    .then((res) => res[SAVED_ACCOUNTS_KEY])
    .then((res) => (res ? JSON.parse(res) : []))) as SavedAccount[];
}

async function saveAccounts(savedAccounts: SavedAccount[]): Promise<void> {
  await chrome.storage.local.set({
    [SAVED_ACCOUNTS_KEY]: JSON.stringify(savedAccounts),
  });
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

  await saveAccounts([...accounts, newAccount]);
}

export async function getTags(): Promise<string[]> {
  const accounts = await getSavedAccounts();
  return [...new Set(accounts.flatMap((a) => a.tags))];
}

export async function getAccount(address: Address) {
  const accounts = await getSavedAccounts();
  const account = accounts.find((a) => a.address === address);
  if (!account) throw new Error("No account found for address");
  return account;
}

export async function updateAccount(account: SavedAccount): Promise<void> {
  const accounts = await getSavedAccounts();

  if (
    accounts.some(
      (a) => a.label === account.label && a.address !== account.address
    )
  ) {
    throw new Error("Label already exists");
  }

  const updated = accounts.map((a) => {
    if (a.address === account.address) {
      // replace the account with this address with the updated one
      return account;
    } else {
      // keep accounts with any other address unedited
      return a;
    }
  });

  await saveAccounts(updated);
}
