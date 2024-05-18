import { Address } from "@solana/addresses";
import { storage } from "wxt/storage";

type Connections = { [origin: string]: Address[] };

const CONNECTIONS_KEY = "local:connections";

async function getSavedConnections() {
  const connectionsStringifiedOrNull = await storage.getItem<string>(
    CONNECTIONS_KEY
  );
  return connectionsStringifiedOrNull
    ? JSON.parse(connectionsStringifiedOrNull)
    : {};
}

async function saveConnections(connections: Connections) {
  await storage.setItem<string>(CONNECTIONS_KEY, JSON.stringify(connections));
}

export async function saveConnection(origin: string, addresses: Address[]) {
  // don't save an empty list of addresses
  if (addresses.length === 0) return;

  const connections = await getSavedConnections();
  connections[origin] = addresses;
  await saveConnections(connections);
}

export async function getSavedConnection(
  origin: string
): Promise<Address[] | undefined> {
  const connections = await getSavedConnections();
  return connections[origin];
}

export async function removeConnection(origin: string) {
  const connections = await getSavedConnections();
  delete connections[origin];
  await saveConnections(connections);
}
