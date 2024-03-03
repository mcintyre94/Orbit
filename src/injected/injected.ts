'use strict';
import { SOLANA_DEVNET_CHAIN, SOLANA_LOCALNET_CHAIN, SOLANA_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN } from '@solana/wallet-standard-chains';
import { SolanaSignTransaction, SolanaSignTransactionFeature } from '@solana/wallet-standard-features';
import { StandardConnect, StandardConnectFeature, StandardConnectMethod, StandardDisconnect, StandardDisconnectFeature, StandardDisconnectMethod, StandardEvents, StandardEventsFeature, StandardEventsListeners, StandardEventsNames, StandardEventsOnMethod, Wallet, WalletAccount, registerWallet } from '@wallet-standard/core';
import { getBase58Encoder } from '@solana/codecs-strings';
import { makeRequestConnectionEvent } from './events';
import type { BackgroundEvent, ConnectionSubmitForwardedEvent } from '../background/events';

class RequestManager {
    constructor() {
        if (new.target === RequestManager) {
            Object.freeze(this);
        }
    }

    #requestId = 0;
    #resolvers: { [requestId: number]: [any, any] } = {};

    addResolver<T>() {
        const requestId = this.#requestId++;
        let resolve, reject;
        const promise = new Promise<T>((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        this.#resolvers[requestId] = [resolve, reject];
        return { requestId, promise };
    }

    // TODO: type this properly
    resolve(event: any) {
        const requestId = event.requestId;
        const [resolve, reject] = this.#resolvers[requestId]
        // TODO: add error handling, we should be able to reject too - on some basis
        resolve(event);
    }
}

class MultiWallet implements Wallet {
    constructor(requestManager: RequestManager) {
        if (new.target === MultiWallet) {
            Object.freeze(this);
        }

        this.#requestManager = requestManager
    }

    #name = 'Multiwallet';
    // TODO: Add image.
    #icon = 'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjEwMjQiIGhlaWdodD0iMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayIgZm9udC1zaXplPSIyNCI+CiAgICBXYWxsZXQgSWNvbiBQbGFjZWhvbGRlcgogIDwvdGV4dD4KPC9zdmc+Cg==' as const;

    readonly #base58Encoder = getBase58Encoder();

    readonly #requestManager = new RequestManager();

    #accounts: WalletAccount[] = [];

    readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};

    makeAccounts(addresses: string[]): WalletAccount[] {
        return addresses.map(address => ({
            address,
            publicKey: this.#base58Encoder.encode(address),
            chains: this.chains,
            features: [StandardConnect, StandardEvents]
        }));
    }

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return [SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN, SOLANA_TESTNET_CHAIN, SOLANA_LOCALNET_CHAIN] as const;
    }

    get features(): StandardConnectFeature & StandardDisconnectFeature & StandardEventsFeature & SolanaSignTransactionFeature {
        return {
            [StandardConnect]: {
                version: '1.0.0',
                connect: this.#connect,
            },
            [StandardDisconnect]: {
                version: '1.0.0',
                disconnect: this.#disconnect
            },
            [StandardEvents]: {
                version: '1.0.0',
                on: this.#on,
            },
            // TODO: remove this (and SolanaSignTransactionFeature), but wallet-adapter example can't see us then
            [SolanaSignTransaction]: {
                version: '1.0.0',
                signTransaction: () => Promise.resolve([{ signedTransaction: new Uint8Array() }]),
                supportedTransactionVersions: ['legacy', 0]
            }
        };
    }

    get accounts() {
        return this.#accounts;
    }

    #connect: StandardConnectMethod = async ({ silent } = {}) => {
        console.log('hello from connect');
        // TODO: get them 

        // TODO: add a type here when I create the response type
        const { requestId, promise } = this.#requestManager.addResolver<ConnectionSubmitForwardedEvent>();
        const requestConnectionEvent = makeRequestConnectionEvent(requestId);
        window.postMessage(requestConnectionEvent);

        console.log(`waiting on request ID ${requestId}`);

        // const { selectedAddresses } = await promise;
        const { address } = await promise;

        // const accounts: WalletAccount[] = this.makeAccounts(selectedAddresses);
        const accounts: WalletAccount[] = this.makeAccounts([address]);

        if (accounts === null) {
            throw new Error('The user rejected the request.');
        }

        this.#accounts = accounts;

        this.#emit('change', { accounts: this.accounts });

        return {
            accounts: this.accounts,
        };
    };

    #disconnect: StandardDisconnectMethod = () => {
        this.#accounts = [];
        this.#emit('change', { accounts: this.accounts });
        return Promise.resolve();
    }

    #on: StandardEventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}

(function () {
    console.log('injected');

    const requestManager = new RequestManager();
    const wallet = new MultiWallet(requestManager);
    console.dir({ requestManager, wallet }, { depth: null });
    registerWallet(wallet);
    console.log('registered!');

    window.addEventListener("message", (event: MessageEvent<BackgroundEvent>) => {
        if (!event.isTrusted) {
            console.log('dropping untrusted event', event);
            return;
        }

        if (event.data.origin !== 'background') {
            console.log('dropping event from origin', event.data.origin, event);
            return;
        }

        console.log('resolving request', event.data);
        requestManager.resolve(event.data);
    }, false);
})();

export { }