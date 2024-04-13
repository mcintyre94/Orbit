import type { Address } from "@solana/addresses";

type BackgroundEventBase = {
  origin: "background";
  requestId: number;
};

export type ConnectionSubmitForwardedEvent = BackgroundEventBase & {
  type: "connectionSubmitForwarded";
  forOrigin: string;
  addresses: Address[];
};

type ConnectionSubmitForwardedEventInput = {
  requestId: number;
  forOrigin: string;
  addresses: Address[];
};

export function makeConnectionSubmitForwardedEvent({
  requestId,
  forOrigin,
  addresses,
}: ConnectionSubmitForwardedEventInput): ConnectionSubmitForwardedEvent {
  return {
    origin: "background",
    type: "connectionSubmitForwarded",
    requestId,
    forOrigin,
    addresses,
  };
}

export type SilentConnectionSubmitForwardedEvent = BackgroundEventBase & {
  type: "silentConnectionSubmitForwarded";
  forOrigin: string;
  addresses: Address[];
};

export type BackgroundEvent = ConnectionSubmitForwardedEvent;
