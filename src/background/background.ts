import type { InjectedEvent } from "../injected/events";

function openPopup(event: InjectedEvent, tabId: number, popupLeft: number) {
    if(event.type === 'requestConnection') {
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
        console.dir({ request, sender }, { depth: null });
        // TODO: do I need this/when?
        // sendResponse({ "success": true });

        // TODO: can also come from the popup
        const event = request as InjectedEvent

        if (event.origin === 'injected') {
            // We handle events from the injected wallet by opening a popup
            const windowWidth = 500;
            const popupLeft = sender.tab?.width ? sender.tab.width + (windowWidth / 2) - 10 : 0;

            console.log('background, opening window!');
            const tabId = sender.tab?.id ?? 0;
            openPopup(event, tabId, popupLeft);
        } else if (request.origin === 'extension_popup') {
            console.log('from extension, forwarding!');

            chrome.tabs.sendMessage(request.tabId, {
                from: 'extension_popup',
                via: 'background',
                event: request,
                origin: 'background',
            });

            // chrome.tabs.sendMessage()

            // chrome.runtime.sendMessage({
            //     from: 'extension_popup',
            //     via: 'background',
            //     event: request,
            // });
        }
    }
);
