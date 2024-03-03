import type { Address } from "@solana/web3.js";

type PopupEventBase = {
    origin: "popup";
    tabId: number;
    requestId: number;
};

type ConnectionSubmitEvent = PopupEventBase & {
    type: "connectionSubmit";
    address: Address;
};

export function makeConnectionSubmitEvent(
    tabId: number,
    requestId: number,
    address: Address,
): ConnectionSubmitEvent {
    return {
        origin: "popup",
        type: "connectionSubmit",
        tabId,
        requestId,
        address,
    };
}

export type PopupEvent = ConnectionSubmitEvent;
