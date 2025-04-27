import { Address } from "@solana/addresses";

type ContentEventBase = {
  origin: "content";
  requestId: number;
};

export type AccountToConnect = {
  address: Address;
  label: string;
};

export type ConnectAccountsEvent = ContentEventBase & {
  type: "connectAccounts";
  accounts: AccountToConnect[];
};

type DisconnectCompleteEvent = ContentEventBase & {
  type: "disconnectComplete";
};

export type TagsForAccountsEvent = ContentEventBase & {
  type: "tagsForAccounts";
  tagsForAccounts: Record<Address, string[]>;
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

export function makeTagsForAccountsEvent(
  requestId: number,
  tagsForAccounts: Record<Address, string[]>
): TagsForAccountsEvent {
  return {
    origin: "content",
    requestId,
    type: "tagsForAccounts",
    tagsForAccounts,
  };
}

export type ContentEvent =
  | ConnectAccountsEvent
  | DisconnectCompleteEvent
  | TagsForAccountsEvent;
