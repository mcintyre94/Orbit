import type { InjectedEvent } from "../injected/events";
import { SidePanelEvent } from "../sidepanel/events";
import { makeConnectionSubmitForwardedEvent } from "./events";
import {
  isBiometricLockEnabled,
  setLockState,
  getLockState,
} from "~/biometricLock/storage";

const LOCK_ALARM_NAME = "biometricLockAlarm";
const INACTIVITY_TIMEOUT_MINUTES = 30;

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
      return;
    }

    const event = request as InjectedEvent | SidePanelEvent;

    if (event.origin === "injected") {
      // We handle events from the injected wallet by opening a sidepanel
      const tabId = sender.tab?.id ?? 0;
      openSidePanel({
        event,
        tabId,
        forOrigin: new URL(sender.url).hostname,
      });
    } else if (event.origin === "sidePanel") {
      // We handle events from the sidepanel by forwarding them to the content script
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

/**
 * Lock the extension on browser startup if biometric lock is enabled.
 * This ensures users must authenticate when they restart their browser.
 */
async function handleBrowserStartup() {
  const enabled = await isBiometricLockEnabled();
  if (enabled) {
    try {
      await setLockState({ isLocked: true, lastUnlockTimestamp: 0 });
    } catch (error) {
      console.error("Failed to lock on browser startup:", error);
      // Continue - extension can still function, user will need to unlock on first access
    }
  }
}

/**
 * Check if lock timeout has been exceeded since last unlock.
 * Locks the extension if 30+ minutes have passed since unlock.
 */
async function checkInactivity() {
  const enabled = await isBiometricLockEnabled();
  if (!enabled) return;

  const state = await getLockState();
  if (state.isLocked) return; // Already locked

  const now = Date.now();
  const timeSinceUnlock = now - state.lastUnlockTimestamp;
  const timeoutMs = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

  if (timeSinceUnlock >= timeoutMs) {
    try {
      await setLockState({
        isLocked: true,
        lastUnlockTimestamp: state.lastUnlockTimestamp,
      });
    } catch (error) {
      console.error("Failed to lock after inactivity timeout:", error);
      // Continue - will retry on next check (every 5 minutes)
    }
  }
}

/**
 * Set up the inactivity check alarm.
 * Checks every 5 minutes for inactivity.
 */
function setupInactivityAlarm() {
  browser.alarms.create(LOCK_ALARM_NAME, { periodInMinutes: 5 });
}

export default defineBackground(function () {
  main();

  // Lock on browser startup
  browser.runtime.onStartup.addListener(handleBrowserStartup);

  // Check for inactivity periodically
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === LOCK_ALARM_NAME) {
      checkInactivity();
    }
  });

  // Set up the inactivity alarm
  setupInactivityAlarm();
});
