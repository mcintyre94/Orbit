import type { Address } from "@solana/web3.js";

type PopupEventBase = {
  origin: "popup";
  tabId: number;
  requestId: number;
};

type ConnectionSubmitEvent = PopupEventBase & {
  type: "connectionSubmit";
  forOrigin: string;
  addresses: Address[];
};

type ConnectionSubmitEventInput = {
  tabId: number;
  requestId: number;
  forOrigin: string;
  addresses: Address[];
};

export function makeConnectionSubmitEvent({
  tabId,
  requestId,
  forOrigin,
  addresses,
}: ConnectionSubmitEventInput): ConnectionSubmitEvent {
  return {
    origin: "popup",
    type: "connectionSubmit",
    tabId,
    requestId,
    addresses,
    forOrigin,
  };
}

export type PopupEvent = ConnectionSubmitEvent;
