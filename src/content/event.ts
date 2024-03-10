import { Address } from "@solana/web3.js";

type ContentEventBase = {
  origin: "content";
  requestId: number;
};

type ConnectAccountsEvent = ContentEventBase & {
  type: "connectAccounts";
  addresses: Address[];
};

type DisconnectCompleteEvent = ContentEventBase & {
  type: "disconnectComplete";
};

export function makeConnectAccountsEvent(
  requestId: number,
  addresses: Address[]
): ConnectAccountsEvent {
  return {
    origin: "content",
    requestId,
    type: "connectAccounts",
    addresses,
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

export type ContentEvent = ConnectAccountsEvent | DisconnectCompleteEvent;
