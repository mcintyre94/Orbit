import type { InjectedEvent } from "../injected/events";
import { SidePanelEvent } from "../sidepanel/events";
import { makeConnectionSubmitForwardedEvent } from "./events";

type SidePanel = {
  setOptions({
    path,
    enabled,
  }: {
    path: string;
    enabled: boolean;
  }): Promise<void>;

  open({ tabId }: { tabId: number }): Promise<void>;

  setPanelBehavior({
    openPanelOnActionClick,
  }: {
    openPanelOnActionClick: boolean;
  }): Promise<void>;
};

type OpenSidePanelInput = {
  event: InjectedEvent;
  tabId: number;
  forOrigin: string;
};

function openSidePanel({ event, tabId, forOrigin }: OpenSidePanelInput) {
  if (event.type === "requestConnection") {
    const encodedForOrigin = encodeURIComponent(forOrigin);

    const url = `/sidepanel.html?connect=1&tabId=${tabId}&requestId=${event.requestId}&forOrigin=${encodedForOrigin}`;

    const sidePanel = (browser as { sidePanel?: unknown })
      .sidePanel as unknown as SidePanel;

    sidePanel.setOptions({
      path: url,
      enabled: true,
    });

    sidePanel
      .open({
        tabId,
      })
      .catch((e) => {
        console.error("error opening sidepanel", e);
        // failed to open side panel, for now don't provide a popup fallback
      });
  }
}

function main() {
  browser.runtime.onMessage.addListener(function (request, sender) {
    if (sender.url === undefined) {
      console.log("dropping event with unknown origin", request, sender);
      return;
    }

    const event = request as InjectedEvent | SidePanelEvent;

    if (event.origin === "injected") {
      // We handle events from the injected wallet by opening a sidepanel
      console.log("sender tab", sender.tab);

      console.log("background, opening window!");
      const tabId = sender.tab?.id ?? 0;
      openSidePanel({
        event,
        tabId,
        forOrigin: new URL(sender.url).hostname,
      });
    } else if (event.origin === "sidePanel") {
      // We handle events from the sidepanel by forwarding them to the content script
      console.log(
        "background received event from extension sidepanel, forwarding",
        event
      );
      browser.tabs.sendMessage(
        event.tabId,
        makeConnectionSubmitForwardedEvent({
          requestId: event.requestId,
          forOrigin: event.forOrigin,
          addresses: event.addresses,
        })
      );
    }
  });

  const sidePanel = (browser as { sidePanel?: unknown })
    .sidePanel as unknown as SidePanel;

  // Allows users to open the side panel by clicking on the action toolbar icon
  sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}

export default defineBackground(function () {
  main();
});
