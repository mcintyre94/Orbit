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

export type InjectedEvent =
  | RequestConnectionEvent
  | SilentConnectionEvent
  | DisconnectEvent;
