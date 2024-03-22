"use strict";
import {
  SOLANA_DEVNET_CHAIN,
  SOLANA_LOCALNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
} from "@solana/wallet-standard-chains";
import {
  SolanaSignTransaction,
  SolanaSignTransactionFeature,
} from "@solana/wallet-standard-features";
import {
  StandardConnect,
  StandardConnectFeature,
  StandardConnectMethod,
  StandardDisconnect,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEvents,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
  Wallet,
  WalletAccount,
  registerWallet,
} from "@wallet-standard/core";
import { getBase58Encoder } from "@solana/codecs-strings";
import {
  makeDisconnectEvent,
  makeRequestConnectionEvent,
  makeSilentConnectionEvent,
} from "./events";
import { ContentEvent, ConnectAccountsEvent } from "../content/event";

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

  resolve(event: ContentEvent) {
    const requestId = event.requestId;
    const [resolve, reject] = this.#resolvers[requestId];
    // TODO: add error handling, we should be able to reject too - on some basis
    resolve(event);
  }
}

class MultiWallet implements Wallet {
  constructor(requestManager: RequestManager) {
    if (new.target === MultiWallet) {
      Object.freeze(this);
    }

    this.#requestManager = requestManager;
  }

  #name = "Multiwallet";
  // TODO: Add image.
  #icon =
    "data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjEwMjQiIGhlaWdodD0iMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayIgZm9udC1zaXplPSIyNCI+CiAgICBXYWxsZXQgSWNvbiBQbGFjZWhvbGRlcgogIDwvdGV4dD4KPC9zdmc+Cg==" as const;

  readonly #base58Encoder = getBase58Encoder();

  readonly #requestManager = new RequestManager();

  #accounts: WalletAccount[] = [];

  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][];
  } = {};

  makeAccounts(addresses: string[]): WalletAccount[] {
    return addresses.map((address) => ({
      address,
      publicKey: this.#base58Encoder.encode(address),
      chains: this.chains,
      features: [StandardConnect, StandardEvents],
    }));
  }

  get version() {
    return "1.0.0" as const;
  }

  get name() {
    return this.#name;
  }

  get icon() {
    return this.#icon;
  }

  get chains() {
    return [
      SOLANA_MAINNET_CHAIN,
      SOLANA_DEVNET_CHAIN,
      SOLANA_TESTNET_CHAIN,
      SOLANA_LOCALNET_CHAIN,
    ] as const;
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignTransactionFeature {
    return {
      [StandardConnect]: {
        version: "1.0.0",
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: "1.0.0",
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: "1.0.0",
        on: this.#on,
      },
      // Note: wallet-adapter (and most apps) filter out wallet-standard wallets that don't have
      // this feature. For now add this so we show up in apps
      [SolanaSignTransaction]: {
        version: "1.0.0",
        signTransaction: () =>
          Promise.reject(
            new Error("Wallet does not support signing transactions")
          ),
        supportedTransactionVersions: [0],
      },
    };
  }

  get accounts() {
    return this.#accounts;
  }

  #connect: StandardConnectMethod = async ({ silent } = {}) => {
    const { requestId, promise } =
      this.#requestManager.addResolver<ConnectAccountsEvent>();

    const requestConnectionEvent = silent
      ? makeSilentConnectionEvent(requestId)
      : makeRequestConnectionEvent(requestId);
    console.log({ silent, requestConnectionEvent });
    window.postMessage(requestConnectionEvent);

    const { addresses } = await promise;
    const accounts: WalletAccount[] = this.makeAccounts(addresses);

    if (accounts.length === 0 && !silent) {
      throw new Error("The user rejected the request.");
    }

    const changed = this.#accounts !== accounts;
    this.#accounts = accounts;

    if (changed) {
      this.#emit("change", { accounts: this.accounts });
    }

    return {
      accounts: this.accounts,
    };
  };

  #disconnect: StandardDisconnectMethod = () => {
    this.#accounts = [];
    this.#emit("change", { accounts: this.accounts });

    const { requestId, promise } = this.#requestManager.addResolver<void>();
    const disconnectEvent = makeDisconnectEvent(requestId);
    window.postMessage(disconnectEvent);
    return promise;
  };

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#listeners[event]?.push(listener) ||
      (this.#listeners[event] = [listener]);
    return (): void => this.#off(event, listener);
  };

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
  }

  #off<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E]
  ): void {
    this.#listeners[event] = this.#listeners[event]?.filter(
      (existingListener) => listener !== existingListener
    );
  }
}

(function () {
  console.log("injected");

  const requestManager = new RequestManager();
  const wallet = new MultiWallet(requestManager);
  // this will expose accounts if there are any previously connected
  wallet["features"]["standard:connect"].connect({ silent: true });
  registerWallet(wallet);
  console.log("registered!");

  window.addEventListener(
    "message",
    (event: MessageEvent<ContentEvent>) => {
      if (!event.isTrusted) {
        console.log("dropping untrusted event", event);
        return;
      }

      if (event.data.origin !== "content") {
        return;
      }

      console.log("resolving request", event.data);
      requestManager.resolve(event.data);
    },
    false
  );
})();

export {};
