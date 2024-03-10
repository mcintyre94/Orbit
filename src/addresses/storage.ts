import { SavedAddress } from "./savedAddress";

const SAVED_ADDRESSES_KEY = "addresses";

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  return (await chrome.storage.local
    .get(SAVED_ADDRESSES_KEY)
    .then((res) => res[SAVED_ADDRESSES_KEY])
    .then((res) => (res ? JSON.parse(res) : []))) as SavedAddress[];
}
