import { Address } from "@solana/addresses";

type ContentEventBase = {
  origin: "content";
  requestId: number;
};

export type AccountToConnect = {
  address: Address;
  label: string;
  tags: string[];
};

export type ConnectAccountsEvent = ContentEventBase & {
  type: "connectAccounts";
  accounts: AccountToConnect[];
};

type DisconnectCompleteEvent = ContentEventBase & {
  type: "disconnectComplete";
};

export type FetchedTagsForAddressesEvent = ContentEventBase & {
  type: "fetchedTagsForAddresses";
  tags: { [address: string]: string[] };
};

export function makeConnectAccountsEvent(
  requestId: number,
  accounts: AccountToConnect[]
): ConnectAccountsEvent {
  return {
    origin: "content",
    requestId,
    type: "connectAccounts",
    accounts,
  };
}

export function makeDisconnectCompleteEvent(
  requestId: number
): DisconnectCompleteEvent {
  return {
    origin: "content",
    requestId,
    type: "disconnectComplete",
  };
}

export function makeFetchedTagsForAddressesEvent(
  requestId: number,
  tags: { [address: string]: string[] }
): FetchedTagsForAddressesEvent {
  return {
    origin: "content",
    requestId,
    type: "fetchedTagsForAddresses",
    tags,
  };
}

export type ContentEvent =
  | ConnectAccountsEvent
  | DisconnectCompleteEvent
  | FetchedTagsForAddressesEvent;
