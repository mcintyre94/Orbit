import { SavedAddress } from "./savedAddress";

const SAVED_ADDRESSES_KEY = "addresses";

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  return (await chrome.storage.local
    .get(SAVED_ADDRESSES_KEY)
    .then((res) => res[SAVED_ADDRESSES_KEY])
    .then((res) => (res ? JSON.parse(res) : []))) as SavedAddress[];
}

export async function saveNewAddress(newAddress: SavedAddress): Promise<void> {
  const addresses = await getSavedAddresses();

  for (const address of addresses) {
    if (address.address === newAddress.address) {
      throw new Error("Address already exists");
    }

    if (address.label === newAddress.label) {
      throw new Error("Label already exists");
    }
  }

  await chrome.storage.local.set({
    [SAVED_ADDRESSES_KEY]: JSON.stringify([...addresses, newAddress]),
  });
}

export async function getTags(): Promise<string[]> {
  const addresses = await getSavedAddresses();
  return [...new Set(addresses.flatMap((a) => a.tags))];
}
