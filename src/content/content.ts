"use strict";

import {
  BackgroundEvent,
  ConnectionSubmitForwardedEvent,
  makeConnectionSubmitForwardedEvent,
} from "../background/events";
import type { InjectedEvent } from "../injected/events";
// @ts-ignore
import injected from "../injected/injected?script&module";
import {
  getSavedConnection,
  removeConnection,
  saveConnection,
} from "../connections/storage";
import {
  ConnectAccountsEvent,
  DisconnectCompleteEvent,
  makeConnectAccountsEvent,
  makeDisconnectCompleteEvent,
} from "./event";

/** Inject the wallet into the page */
const script = document.createElement("script");
script.id = "injected";
script.src = chrome.runtime.getURL(injected);
script.type = "module";

const element = document.head || document.documentElement;
element.prepend(script);
script.remove();

/** Receive messages from the page and forward to background unchanged */
window.addEventListener(
  "message",
  async (event: MessageEvent<InjectedEvent>) => {
    if (!event.isTrusted) {
      console.log("dropping untrusted event", event);
      return;
    }

    // drop messages not from injected
    if (event.data.origin !== "injected") {
      console.log("dropping event from origin", event.data.origin, event);
      return;
    }

    // if the message is connection request, check if we already have a connection
    // if we do return that instead of passing through
    if (event.data.type === "requestConnection") {
      const origin = event.origin;
      const existingAddresses = await getSavedConnection(origin);
      if (existingAddresses && existingAddresses.length > 0) {
        console.log("Found existing addresses for origin", {
          origin,
          existingAddresses,
        });
        // create a connect accounts event with these addresses + send back to page
        const connectAccountsEvent = makeConnectAccountsEvent(
          event.data.requestId,
          existingAddresses
        );
        window.postMessage(connectAccountsEvent);
        return;
      }
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
    chrome.runtime.sendMessage(event.data);
  },
  false
);

/** Receive messages from the background */
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // TODO: do I need this/when?
  // sendResponse({ "success": true });

  const event = request as BackgroundEvent;

  if (event.origin !== "background") {
    console.log("dropping event from origin", event.origin, event);
    return;
  }

  if (event.type === "connectionSubmitForwarded") {
    await saveConnection(event.forOrigin, event.addresses);
    const connectAccountsEvent = makeConnectAccountsEvent(
      event.requestId,
      event.addresses
    );
    window.postMessage(connectAccountsEvent);
  }
});
