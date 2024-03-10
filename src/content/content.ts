"use strict";

import {
  BackgroundEvent,
  ConnectionSubmitForwardedEvent,
  makeConnectionSubmitForwardedEvent,
} from "../background/events";
import type { InjectedEvent } from "../injected/events";
// @ts-ignore
import injected from "../injected/injected?script&module";
import { getSavedConnection, saveConnection } from "../connections/storage";

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
        // create a connection submit event with these addresses + send back to page
        const newEvent: ConnectionSubmitForwardedEvent =
          makeConnectionSubmitForwardedEvent({
            requestId: event.data.requestId,
            forOrigin: origin,
            addresses: existingAddresses,
          });

        window.postMessage(newEvent);
        return;
      }
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
    console.log("store addresses for origin", {
      forOrigin: event.forOrigin,
      addresses: event.addresses,
    });
    await saveConnection(event.forOrigin, event.addresses);
  }

  console.log(
    "forwarding event data from background to injected unchanged",
    event
  );
  window.postMessage(event);
});
