import type { InjectedEvent } from "../injected/events";
import { PopupEvent } from "../popup/events";
import { makeConnectionSubmitForwardedEvent } from "./events";

function openPopup(
  event: InjectedEvent,
  tabId: number,
  popupLeft: number,
  popupHeight: number
) {
  if (event.type === "requestConnection") {
    chrome.sidePanel.setOptions({
      path: `index.html?view=connect&tabId=${tabId}&requestId=${event.requestId}`,
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
          url: `index.html?view=connect&tabId=${tabId}&requestId=${event.requestId}`,
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

  const event = request as InjectedEvent | PopupEvent;

  if (event.origin === "injected") {
    // We handle events from the injected wallet by opening a popup
    console.log("sender tab", sender.tab);
    const popupLeft = sender.tab?.width ?? 0;
    const popupHeight = sender.tab?.height ?? 500;

    console.log("background, opening window!");
    const tabId = sender.tab?.id ?? 0;
    openPopup(event, tabId, popupLeft, popupHeight);
  } else if (event.origin === "popup") {
    // We handle events from the popup by forwarding them to the content script
    console.log(
      "background received event from extension popup, forwarding",
      event
    );
    chrome.tabs.sendMessage(
      event.tabId,
      makeConnectionSubmitForwardedEvent(event.requestId, event.address)
    );
  } else {
    console.log("dropping event from unexpected origin", event);
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
