import type { Address } from "@solana/addresses";

type SidePanelEventBase = {
  origin: "sidePanel";
  tabId: number;
  requestId: number;
};

type ConnectionSubmitEvent = SidePanelEventBase & {
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
    origin: "sidePanel",
    type: "connectionSubmit",
    tabId,
    requestId,
    addresses,
    forOrigin,
  };
}

export type SidePanelEvent = ConnectionSubmitEvent;
