import { Address } from "@solana/addresses";

import { type BackgroundEvent } from "../background/events";
import type { InjectedEvent } from "../injected/events";
import {
  getSavedConnection,
  removeConnection,
  saveConnection,
} from "../../connections/storage";
import {
  type AccountToConnect,
  makeConnectAccountsEvent,
  makeDisconnectCompleteEvent,
} from "./events";
import { getSavedAccounts } from "../../accounts/storage";

function injectWallet() {
  const script = document.createElement("script");
  script.id = "injected";
  script.src = browser.runtime.getURL("/injected.js");
  script.type = "module";
  const element = document.head || document.documentElement;
  element.prepend(script);
  script.remove();
}

async function convertAddressesToAccountsToConnect(
  addresses: Address[]
): Promise<AccountToConnect[]> {
  const allSavedAccounts = await getSavedAccounts();
  return addresses.flatMap((address) => {
    const account = allSavedAccounts.find(
      (account) => account.address === address
    );
    if (!account) {
      return [];
    }
    return [
      {
        address,
        label: account.label,
        tags: account.tags,
      },
    ];
  });
}

/** Receive messages from the page and forward to background unchanged */
function addWindowListener() {
  window.addEventListener(
    "message",
    async (event: MessageEvent<InjectedEvent>) => {
      if (!event.isTrusted) {
        console.log("dropping untrusted event", event);
        return;
      }

      // drop messages not from injected
      if (event.data.origin !== "injected") {
        return;
      }

      // if the message is silent connection request, check if we already have a connection
      // if we do return it, else return empty accounts
      // never pass to background to prompt user
      if (event.data.type === "silentConnection") {
        const origin = new URL(event.origin).hostname;
        const existingAddresses = (await getSavedConnection(origin)) ?? [];
        const accountsToConnect = await convertAddressesToAccountsToConnect(
          existingAddresses
        );
        const connectAccountsEvent = makeConnectAccountsEvent(
          event.data.requestId,
          accountsToConnect
        );
        window.postMessage(connectAccountsEvent);
        return;
      }

      // if the message is disconnect, remove from storage
      if (event.data.type === "disconnect") {
        const origin = event.origin;
        await removeConnection(origin);
        const disconnectCompleteEvent = makeDisconnectCompleteEvent(
          event.data.requestId
        );
        window.postMessage(disconnectCompleteEvent);
        return;
      }

      // for anything we can't handle directly, pass to background script

      console.log(
        "forwarding event data from injected to background unchanged",
        event.data
      );
      browser.runtime.sendMessage(event.data);
    },
    false
  );
}

/** Receive messages from the background */
function addMessageListener() {
  browser.runtime.onMessage.addListener(async function (request) {
    const event = request as BackgroundEvent;

    if (event.origin !== "background") {
      return;
    }

    if (event.type === "connectionSubmitForwarded") {
      await saveConnection(event.forOrigin, event.addresses);
      const accountsToConnect = await convertAddressesToAccountsToConnect(
        event.addresses
      );
      const connectAccountsEvent = makeConnectAccountsEvent(
        event.requestId,
        accountsToConnect
      );
      window.postMessage(connectAccountsEvent);
    }
  });
}

export function content() {
  injectWallet();
  addWindowListener();
  addMessageListener();
}
