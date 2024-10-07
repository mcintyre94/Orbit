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
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
  type Wallet,
  type WalletAccount,
  registerWallet,
} from "@wallet-standard/core";
import { getBase58Encoder } from "@solana/codecs-strings";
import {
  makeDisconnectEvent,
  makeRequestConnectionEvent,
  makeSilentConnectionEvent,
} from "./events";
import type {
  ContentEvent,
  ConnectAccountsEvent,
  AccountToConnect,
} from "../content/events";

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

class OrbitWallet implements Wallet {
  constructor(requestManager: RequestManager) {
    if (new.target === OrbitWallet) {
      Object.freeze(this);
    }

    this.#requestManager = requestManager;
  }

  #name = "Orbit";
  #icon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTI4IiB6b29tQW5kUGFuPSJtYWduaWZ5IiB2aWV3Qm94PSIwIDAgOTYgOTUuOTk5OTk5IiBoZWlnaHQ9IjEyOCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmVyc2lvbj0iMS4wIj48ZGVmcz48Y2xpcFBhdGggaWQ9ImRmMWYwMjNhNzkiPjxwYXRoIGQ9Ik0gMjQgMjQgTCA3MiAyNCBMIDcyIDcyIEwgMjQgNzIgWiBNIDI0IDI0ICIgY2xpcC1ydWxlPSJub256ZXJvIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9IjU3ODdiNDQ5YTAiPjxwYXRoIGQ9Ik0gNDggMjQgQyAzNC43NDYwOTQgMjQgMjQgMzQuNzQ2MDk0IDI0IDQ4IEMgMjQgNjEuMjUzOTA2IDM0Ljc0NjA5NCA3MiA0OCA3MiBDIDYxLjI1MzkwNiA3MiA3MiA2MS4yNTM5MDYgNzIgNDggQyA3MiAzNC43NDYwOTQgNjEuMjUzOTA2IDI0IDQ4IDI0IFogTSA0OCAyNCAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJjNWE2YjhmYTM5Ij48cGF0aCBkPSJNIDQzLjUgNS4xMDE1NjIgTCA1Mi41IDUuMTAxNTYyIEwgNTIuNSAxNC4xMDE1NjIgTCA0My41IDE0LjEwMTU2MiBaIE0gNDMuNSA1LjEwMTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSIwNzIzZTAzNWI2Ij48cGF0aCBkPSJNIDQ4IDUuMTAxNTYyIEMgNDUuNTE1NjI1IDUuMTAxNTYyIDQzLjUgNy4xMTMyODEgNDMuNSA5LjYwMTU2MiBDIDQzLjUgMTIuMDg1OTM4IDQ1LjUxNTYyNSAxNC4xMDE1NjIgNDggMTQuMTAxNTYyIEMgNTAuNDg0Mzc1IDE0LjEwMTU2MiA1Mi41IDEyLjA4NTkzOCA1Mi41IDkuNjAxNTYyIEMgNTIuNSA3LjExMzI4MSA1MC40ODQzNzUgNS4xMDE1NjIgNDggNS4xMDE1NjIgWiBNIDQ4IDUuMTAxNTYyICIgY2xpcC1ydWxlPSJub256ZXJvIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImVhMDhhZGNkMzEiPjxwYXRoIGQ9Ik0gNzkuNjQ4NDM4IDMwLjYwMTU2MiBMIDg4LjY0ODQzOCAzMC42MDE1NjIgTCA4OC42NDg0MzggMzkuNjAxNTYyIEwgNzkuNjQ4NDM4IDM5LjYwMTU2MiBaIE0gNzkuNjQ4NDM4IDMwLjYwMTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSIzMDQ5NjNlYjY4Ij48cGF0aCBkPSJNIDg0LjE0ODQzOCAzMC42MDE1NjIgQyA4MS42NjQwNjIgMzAuNjAxNTYyIDc5LjY0ODQzOCAzMi42MTMyODEgNzkuNjQ4NDM4IDM1LjEwMTU2MiBDIDc5LjY0ODQzOCAzNy41ODU5MzggODEuNjY0MDYyIDM5LjYwMTU2MiA4NC4xNDg0MzggMzkuNjAxNTYyIEMgODYuNjM2NzE5IDM5LjYwMTU2MiA4OC42NDg0MzggMzcuNTg1OTM4IDg4LjY0ODQzOCAzNS4xMDE1NjIgQyA4OC42NDg0MzggMzIuNjEzMjgxIDg2LjYzNjcxOSAzMC42MDE1NjIgODQuMTQ4NDM4IDMwLjYwMTU2MiBaIE0gODQuMTQ4NDM4IDMwLjYwMTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJiYzk3YjE3ZDZjIj48cGF0aCBkPSJNIDY3LjUgNzMuMzUxNTYyIEwgNzYuNSA3My4zNTE1NjIgTCA3Ni41IDgyLjM1MTU2MiBMIDY3LjUgODIuMzUxNTYyIFogTSA2Ny41IDczLjM1MTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSIzNTBhMDEzNjU3Ij48cGF0aCBkPSJNIDcyIDczLjM1MTU2MiBDIDY5LjUxNTYyNSA3My4zNTE1NjIgNjcuNSA3NS4zNjMyODEgNjcuNSA3Ny44NTE1NjIgQyA2Ny41IDgwLjMzNTkzOCA2OS41MTU2MjUgODIuMzUxNTYyIDcyIDgyLjM1MTU2MiBDIDc0LjQ4NDM3NSA4Mi4zNTE1NjIgNzYuNSA4MC4zMzU5MzggNzYuNSA3Ny44NTE1NjIgQyA3Ni41IDc1LjM2MzI4MSA3NC40ODQzNzUgNzMuMzUxNTYyIDcyIDczLjM1MTU2MiBaIE0gNzIgNzMuMzUxNTYyICIgY2xpcC1ydWxlPSJub256ZXJvIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImRiMzk0M2I1MWEiPjxwYXRoIGQ9Ik0gNi4zMDA3ODEgMzUuMTAxNTYyIEwgMTUuMzAwNzgxIDM1LjEwMTU2MiBMIDE1LjMwMDc4MSA0NC4xMDE1NjIgTCA2LjMwMDc4MSA0NC4xMDE1NjIgWiBNIDYuMzAwNzgxIDM1LjEwMTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSIxNTgwMDRiM2JlIj48cGF0aCBkPSJNIDEwLjgwMDc4MSAzNS4xMDE1NjIgQyA4LjMxNjQwNiAzNS4xMDE1NjIgNi4zMDA3ODEgMzcuMTEzMjgxIDYuMzAwNzgxIDM5LjYwMTU2MiBDIDYuMzAwNzgxIDQyLjA4NTkzOCA4LjMxNjQwNiA0NC4xMDE1NjIgMTAuODAwNzgxIDQ0LjEwMTU2MiBDIDEzLjI4NTE1NiA0NC4xMDE1NjIgMTUuMzAwNzgxIDQyLjA4NTkzOCAxNS4zMDA3ODEgMzkuNjAxNTYyIEMgMTUuMzAwNzgxIDM3LjExMzI4MSAxMy4yODUxNTYgMzUuMTAxNTYyIDEwLjgwMDc4MSAzNS4xMDE1NjIgWiBNIDEwLjgwMDc4MSAzNS4xMDE1NjIgIiBjbGlwLXJ1bGU9Im5vbnplcm8iLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iYTM2YTk4Nzg5NyI+PHBhdGggZD0iTSAxOS41IDc0Ljg1MTU2MiBMIDI4LjUgNzQuODUxNTYyIEwgMjguNSA4My44NTE1NjIgTCAxOS41IDgzLjg1MTU2MiBaIE0gMTkuNSA3NC44NTE1NjIgIiBjbGlwLXJ1bGU9Im5vbnplcm8iLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iZjlmYjYwZDViMCI+PHBhdGggZD0iTSAyNCA3NC44NTE1NjIgQyAyMS41MTU2MjUgNzQuODUxNTYyIDE5LjUgNzYuODYzMjgxIDE5LjUgNzkuMzUxNTYyIEMgMTkuNSA4MS44MzU5MzggMjEuNTE1NjI1IDgzLjg1MTU2MiAyNCA4My44NTE1NjIgQyAyNi40ODQzNzUgODMuODUxNTYyIDI4LjUgODEuODM1OTM4IDI4LjUgNzkuMzUxNTYyIEMgMjguNSA3Ni44NjMyODEgMjYuNDg0Mzc1IDc0Ljg1MTU2MiAyNCA3NC44NTE1NjIgWiBNIDI0IDc0Ljg1MTU2MiAiIGNsaXAtcnVsZT0ibm9uemVybyIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNkZjFmMDIzYTc5KSI+PGcgY2xpcC1wYXRoPSJ1cmwoIzU3ODdiNDQ5YTApIj48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgdHJhbnNmb3JtPSJtYXRyaXgoMC43NSwgMCwgMCwgMC43NSwgMjMuOTk5OTk5LCAyNC4wMDAwMDEpIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBkPSJNIDMyLjAwMDAwMSAtMC4wMDAwMDEgQyAxNC4zMjgxMjYgLTAuMDAwMDAxIDAuMDAwMDAxIDE0LjMyODEyNCAwLjAwMDAwMSAzMS45OTk5OTkgQyAwLjAwMDAwMSA0OS42NzE4NzMgMTQuMzI4MTI2IDYzLjk5OTk5OCAzMi4wMDAwMDEgNjMuOTk5OTk4IEMgNDkuNjcxODc1IDYzLjk5OTk5OCA2NCA0OS42NzE4NzMgNjQgMzEuOTk5OTk5IEMgNjQgMTQuMzI4MTI0IDQ5LjY3MTg3NSAtMC4wMDAwMDEgMzIuMDAwMDAxIC0wLjAwMDAwMSBaIE0gMzIuMDAwMDAxIC0wLjAwMDAwMSAiIHN0cm9rZT0iIzkwY2RmNCIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2Utb3BhY2l0eT0iMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjQiLz48L2c+PC9nPjxnIGNsaXAtcGF0aD0idXJsKCNjNWE2YjhmYTM5KSI+PGcgY2xpcC1wYXRoPSJ1cmwoIzA3MjNlMDM1YjYpIj48cGF0aCBmaWxsPSIjOTBjZGY0IiBkPSJNIDQzLjUgNS4xMDE1NjIgTCA1Mi41IDUuMTAxNTYyIEwgNTIuNSAxNC4xMDE1NjIgTCA0My41IDE0LjEwMTU2MiBaIE0gNDMuNSA1LjEwMTU2MiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9nPjwvZz48ZyBjbGlwLXBhdGg9InVybCgjZWEwOGFkY2QzMSkiPjxnIGNsaXAtcGF0aD0idXJsKCMzMDQ5NjNlYjY4KSI+PHBhdGggZmlsbD0iIzkwY2RmNCIgZD0iTSA3OS42NDg0MzggMzAuNjAxNTYyIEwgODguNjQ4NDM4IDMwLjYwMTU2MiBMIDg4LjY0ODQzOCAzOS42MDE1NjIgTCA3OS42NDg0MzggMzkuNjAxNTYyIFogTSA3OS42NDg0MzggMzAuNjAxNTYyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L2c+PC9nPjxnIGNsaXAtcGF0aD0idXJsKCNiYzk3YjE3ZDZjKSI+PGcgY2xpcC1wYXRoPSJ1cmwoIzM1MGEwMTM2NTcpIj48cGF0aCBmaWxsPSIjOTBjZGY0IiBkPSJNIDY3LjUgNzMuMzUxNTYyIEwgNzYuNSA3My4zNTE1NjIgTCA3Ni41IDgyLjM1MTU2MiBMIDY3LjUgODIuMzUxNTYyIFogTSA2Ny41IDczLjM1MTU2MiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9nPjwvZz48ZyBjbGlwLXBhdGg9InVybCgjZGIzOTQzYjUxYSkiPjxnIGNsaXAtcGF0aD0idXJsKCMxNTgwMDRiM2JlKSI+PHBhdGggZmlsbD0iIzkwY2RmNCIgZD0iTSA2LjMwMDc4MSAzNS4xMDE1NjIgTCAxNS4zMDA3ODEgMzUuMTAxNTYyIEwgMTUuMzAwNzgxIDQ0LjEwMTU2MiBMIDYuMzAwNzgxIDQ0LjEwMTU2MiBaIE0gNi4zMDA3ODEgMzUuMTAxNTYyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L2c+PC9nPjxnIGNsaXAtcGF0aD0idXJsKCNhMzZhOTg3ODk3KSI+PGcgY2xpcC1wYXRoPSJ1cmwoI2Y5ZmI2MGQ1YjApIj48cGF0aCBmaWxsPSIjOTBjZGY0IiBkPSJNIDE5LjUgNzQuODUxNTYyIEwgMjguNSA3NC44NTE1NjIgTCAyOC41IDgzLjg1MTU2MiBMIDE5LjUgODMuODUxNTYyIFogTSAxOS41IDc0Ljg1MTU2MiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9nPjwvZz48L3N2Zz4=" as const;

  readonly #base58Encoder = getBase58Encoder();

  readonly #requestManager = new RequestManager();

  #accounts: WalletAccount[] = [];

  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][];
  } = {};

  makeAccounts(accounts: AccountToConnect[]): WalletAccount[] {
    return accounts.map((account) => ({
      address: account.address,
      publicKey: this.#base58Encoder.encode(account.address) as Uint8Array,
      label: account.label,
      chains: this.chains,
      features: [StandardConnect, StandardEvents, "additionalField:tags"],
      tags: account.tags,
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

    const { accounts } = await promise;
    const walletAccounts: WalletAccount[] = this.makeAccounts(accounts);

    if (walletAccounts.length === 0 && !silent) {
      throw new Error("The user rejected the request.");
    }

    const changed = this.#accounts !== walletAccounts;
    this.#accounts = walletAccounts;

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

export function injected() {
  console.log("GM, Orbit injected!");
  const requestManager = new RequestManager();
  const wallet = new OrbitWallet(requestManager);
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
}
