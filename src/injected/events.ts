type InjectedEventBase = {
  origin: "injected";
  requestId: number;
};

type RequestConnectionEvent = InjectedEventBase & {
  type: "requestConnection";
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

export function makeDisconnectEvent(requestId: number): DisconnectEvent {
  return {
    origin: "injected",
    requestId,
    type: "disconnect",
  };
}

export type InjectedEvent = RequestConnectionEvent | DisconnectEvent;
