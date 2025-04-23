"use strict";
import { registerWallet } from "@wallet-standard/core";
import type { ContentEvent } from "../content/events";
import { RequestManager } from "@/wallet/requestManager";
import { OrbitWallet } from "@/wallet/orbit";

export function injected() {
  const requestManager = new RequestManager();
  const wallet = new OrbitWallet(requestManager);
  // this will expose accounts if there are any previously connected
  wallet["features"]["standard:connect"].connect({ silent: true });
  registerWallet(wallet);

  window.addEventListener(
    "message",
    (event: MessageEvent<ContentEvent>) => {
      if (!event.isTrusted) {
        return;
      }

      if (event.data.origin !== "content") {
        return;
      }

      requestManager.resolve(event.data);
    },
    false
  );
}
