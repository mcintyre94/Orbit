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

type GetTagsForAddressesEvent = InjectedEventBase & {
  type: "getTagsForAddresses";
  addresses: string[];
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

export function makeGetTagsForAddressesEvent(
  requestId: number,
  addresses: string[]
): GetTagsForAddressesEvent {
  return {
    origin: "injected",
    requestId,
    type: "getTagsForAddresses",
    addresses,
  };
}

export type InjectedEvent =
  | RequestConnectionEvent
  | SilentConnectionEvent
  | DisconnectEvent
  | GetTagsForAddressesEvent;
