import type { Address } from "@solana/web3.js";

type BackgroundEventBase = {
    origin: "background";
    requestId: number;
};

export type ConnectionSubmitForwardedEvent = BackgroundEventBase & {
    type: "connectionSubmitForwarded",
    address: Address
}

export function makeConnectionSubmitForwardedEvent(
    requestId: number,
    address: Address,
): ConnectionSubmitForwardedEvent {
    return {
        origin: "background",
        type: "connectionSubmitForwarded",
        requestId,
        address,
    };
}

export type BackgroundEvent = ConnectionSubmitForwardedEvent;
