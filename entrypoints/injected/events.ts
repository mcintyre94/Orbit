import { Address } from "@solana/addresses";

type InjectedEventBase = {
  origin: "injected";
  requestId: number;
};

type RequestConnectionEvent = InjectedEventBase & {
  type: "requestConnection";
};

type SilentConnectionEvent = InjectedEventBase & {
  type: "silentConnection";
};

type DisconnectEvent = InjectedEventBase & {
  type: "disconnect";
};

type GetTagsForAccountsEvent = InjectedEventBase & {
  type: "getTagsForAccounts";
  addresses: Address[];
};

export function makeRequestConnectionEvent(
  requestId: number
): RequestConnectionEvent {
  return {
    origin: "injected",
    requestId,
    type: "requestConnection",
  };
}

export function makeSilentConnectionEvent(
  requestId: number
): SilentConnectionEvent {
  return {
    origin: "injected",
    requestId,
    type: "silentConnection",
  };
}

export function makeDisconnectEvent(requestId: number): DisconnectEvent {
  return {
    origin: "injected",
    requestId,
    type: "disconnect",
  };
}

export function makeGetTagsForAccountsEvent(
  requestId: number,
  addresses: Address[]
): GetTagsForAccountsEvent {
  return {
    origin: "injected",
    requestId,
    type: "getTagsForAccounts",
    addresses,
  };
}

export type InjectedEvent =
  | RequestConnectionEvent
  | SilentConnectionEvent
  | DisconnectEvent
  | GetTagsForAccountsEvent;
