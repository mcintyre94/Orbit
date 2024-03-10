"use strict";

import { BackgroundEvent } from "../background/events";
import type { InjectedEvent } from "../injected/events";
// @ts-ignore
import injected from "../injected/injected?script&module";

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
  (event: MessageEvent<InjectedEvent>) => {
    if (!event.isTrusted) {
      console.log("dropping untrusted event", event);
      return;
    }

    // drop messages not from injected
    if (event.data.origin !== "injected") {
      console.log("dropping event from origin", event.data.origin, event);
      return;
    }

    console.log(
      "forwarding event data from injected to background unchanged",
      event.data
    );
    chrome.runtime.sendMessage(event.data);
  },
  false
);

/** Receive messages from the background */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // TODO: do I need this/when?
  // sendResponse({ "success": true });

  const event = request as BackgroundEvent;

  if (event.origin !== "background") {
    console.log("dropping event from origin", event.origin, event);
    return;
  }

  // TODO: store addresses for connect
  if (event.type === "connectionSubmitForwarded") {
    console.log("store addresses for origin", {
      forOrigin: event.forOrigin,
      addresses: event.addresses,
    });
  }

  console.log(
    "forwarding event data from background to injected unchanged",
    event
  );
  window.postMessage(event);
});
