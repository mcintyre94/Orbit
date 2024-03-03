import type { InjectedEvent } from "../injected/events";
import { PopupEvent } from "../popup/events";
import { makeConnectionSubmitForwardedEvent } from "./events";

function openPopup(event: InjectedEvent, tabId: number, popupLeft: number) {
    if (event.type === 'requestConnection') {
        const options: chrome.windows.CreateData = {
            url: `index.html?view=connect&tabId=${tabId}&requestId=${event.requestId}`,
            type: "popup",
            height: 500,
            width: 500,
            left: popupLeft,
        }

        chrome.windows.create(options);
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // TODO: do I need this/when?
        // sendResponse({ "success": true });

        const event = request as (InjectedEvent | PopupEvent);

        if (event.origin === 'injected') {
            // We handle events from the injected wallet by opening a popup
            const windowWidth = 500;
            const popupLeft = sender.tab?.width ? sender.tab.width + (windowWidth / 2) - 10 : 0;

            console.log('background, opening window!');
            const tabId = sender.tab?.id ?? 0;
            openPopup(event, tabId, popupLeft);
        } else if (event.origin === 'popup') {
            // We handle events from the popup by forwarding them to the content script
            console.log('background received event from extension popup, forwarding', event);
            chrome.tabs.sendMessage(event.tabId, makeConnectionSubmitForwardedEvent(event.requestId, event.address))
        } else {
            console.log('dropping event from unexpected origin', event);
        }
    }
);
