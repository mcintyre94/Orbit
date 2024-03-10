type InjectedEventBase = {
  origin: "injected";
  requestId: number;
};

type RequestConnectionEvent = InjectedEventBase & {
  type: "requestConnection";
};

type RequestConnectionEventInput = {
  requestId: number;
};

export function makeRequestConnectionEvent({
  requestId,
}: RequestConnectionEventInput): RequestConnectionEvent {
  return {
    origin: "injected",
    requestId,
    type: "requestConnection",
  };
}

export type InjectedEvent = RequestConnectionEvent;
