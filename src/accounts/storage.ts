import { Address, isAddress } from "@solana/web3.js";
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

function validateAccount(savedAccount: SavedAccount) {
  if (!isAddress(savedAccount.address)) {
    throw new Error("Invalid address");
  }

  if (savedAccount.label.length === 0) {
    throw new Error("Label can't be empty");
  }
}

export async function saveNewAccount(newAccount: SavedAccount): Promise<void> {
  validateAccount(newAccount);
  const accounts = await getSavedAccounts();

  for (const account of accounts) {
    if (account.address === newAccount.address) {
      throw new Error("Address already exists");
    }

    if (
      account.label.localeCompare(newAccount.label, "en", {
        sensitivity: "accent",
      }) === 0
    ) {
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

export async function updateAccount(
  updatedAccount: SavedAccount
): Promise<void> {
  validateAccount(updatedAccount);
  const accounts = await getSavedAccounts();

  for (const account of accounts) {
    if (
      account.address !== updatedAccount.address &&
      account.label.localeCompare(updatedAccount.label, "en", {
        sensitivity: "accent",
      }) === 0
    ) {
      throw new Error("Label already exists");
    }
  }

  const updated = accounts.map((account) => {
    if (account.address === updatedAccount.address) {
      // replace the account with this address with the updated one
      return updatedAccount;
    } else {
      // keep accounts with any other address unedited
      return account;
    }
  });

  await saveAccounts(updated);
}

export async function deleteAccount(address: Address): Promise<void> {
  const accounts = await getSavedAccounts();
  const updated = accounts.filter((a) => a.address !== address);
  await saveAccounts(updated);
}
