type InjectedEvent = {
    origin: 'injected',
    requestId: number,
}

export type RequestConnectionEvent = InjectedEvent & {
    type: 'requestConnection',
}

export function makeRequestConnectionEvent(requestId: number): RequestConnectionEvent {
    return {
        origin: 'injected',
        requestId,
        type: 'requestConnection',
    }
}
