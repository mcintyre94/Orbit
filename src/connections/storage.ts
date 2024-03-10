import { Address } from "@solana/web3.js";

type Connections = { [origin: string]: Address[] };

const CONNECTIONS_KEY = "connections";

async function getSavedConnections() {
  return (await chrome.storage.local
    .get(CONNECTIONS_KEY)
    .then((res) => res[CONNECTIONS_KEY])
    .then((res) => (res ? JSON.parse(res) : {}))) as Connections;
}

export async function saveConnection(origin: string, addresses: Address[]) {
  // don't save an empty list of addresses
  if (addresses.length === 0) return;

  const connections = await getSavedConnections();
  connections[origin] = addresses;
  await chrome.storage.local.set({
    [CONNECTIONS_KEY]: JSON.stringify(connections),
  });
}

export async function getSavedConnection(
  origin: string
): Promise<Address[] | undefined> {
  const connections = await getSavedConnections();
  return connections[origin];
}
