type InjectedEventBase = {
    origin: 'injected',
    requestId: number,
}

type RequestConnectionEvent = InjectedEventBase & {
    type: 'requestConnection',
}

export function makeRequestConnectionEvent(requestId: number): RequestConnectionEvent {
    return {
        origin: 'injected',
        requestId,
        type: 'requestConnection',
    }
}

export type InjectedEvent = RequestConnectionEvent