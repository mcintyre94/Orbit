import type { InjectedEvent } from "../injected/events";
import { PopupEvent } from "../popup/events";
import { makeConnectionSubmitForwardedEvent } from "./events";

type PopupInput = {
  event: InjectedEvent;
  tabId: number;
  popupLeft: number;
  popupHeight: number;
  forOrigin: string;
};

function openPopup({
  event,
  tabId,
  popupLeft,
  popupHeight,
  forOrigin,
}: PopupInput) {
  if (event.type === "requestConnection") {
    const encodedForOrigin = encodeURIComponent(forOrigin);

    // const url = `index.html?view=connect&tabId=${tabId}&requestId=${event.requestId}&forOrigin=${encodedForOrigin}`;
    const url = `/connect`;

    chrome.sidePanel.setOptions({
      path: url,
      enabled: true,
    });

    chrome.sidePanel
      .open({
        tabId,
      })
      .catch((e) => {
        console.error("error opening sidepanel", e);
        // failed to open side panel, try to open popup window instead (sad times)
        // this mostly happens on auto-connect, when we don't have user input (ugh)
        const options: chrome.windows.CreateData = {
          url,
          type: "popup",
          height: popupHeight,
          width: 500,
          left: popupLeft,
          top: 75,
        };

        chrome.windows.create(options);
      });
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // TODO: do I need this/when?
  //   sendResponse({ success: true });

  if (sender.origin === undefined) {
    console.log("dropping event with unknown origin", request, sender);
    return;
  }

  const event = request as InjectedEvent | PopupEvent;

  if (event.origin === "injected") {
    // We handle events from the injected wallet by opening a popup
    console.log("sender tab", sender.tab);
    const popupLeft = sender.tab?.width ?? 0;
    const popupHeight = sender.tab?.height ?? 500;

    console.log("background, opening window!");
    const tabId = sender.tab?.id ?? 0;
    openPopup({
      event,
      tabId,
      popupLeft,
      popupHeight,
      forOrigin: sender.origin,
    });
  } else if (event.origin === "popup") {
    // We handle events from the popup by forwarding them to the content script
    console.log(
      "background received event from extension popup, forwarding",
      event
    );
    chrome.tabs.sendMessage(
      event.tabId,
      makeConnectionSubmitForwardedEvent({
        requestId: event.requestId,
        forOrigin: event.forOrigin,
        addresses: event.addresses,
      })
    );
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
