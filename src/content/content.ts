'use strict';

// @ts-ignore
import injected from '../injected/injected?script&module';

/** Inject the wallet into the page */
const script = document.createElement('script');
script.id = 'injected';
script.src = chrome.runtime.getURL(injected);
script.type = "module";

const element = document.head || document.documentElement;
element.prepend(script);
script.remove();

/** Receive messages from the page and forward to background unchanged */
window.addEventListener("message", (event) => {
  if(!event.isTrusted) return; 
  console.log('received message in content', { event })
  chrome.runtime.sendMessage(event.data);
  console.log('sent');
}, false);

/** Receive messages from the background */
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.dir({ request, sender }, { depth: null });
    sendResponse({ "success": true });

    if (request.origin === 'background') {
      window.postMessage({
        ...request,
        origin: 'content',
      })
    }
  }
);