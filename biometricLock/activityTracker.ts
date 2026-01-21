import { updateLastActivity, isBiometricLockEnabled } from "./storage";

let isTracking = false;

/**
 * Debounce function to limit how often a function is called
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Start tracking user activity in the sidepanel.
 * Updates the last activity timestamp when user interacts with the UI.
 * Call this once on app initialization.
 */
export function startActivityTracking(): void {
  if (isTracking) return;
  isTracking = true;

  // Track meaningful user interactions
  const events = ["click", "keydown", "scroll", "focus"];

  // Debounce to avoid excessive storage writes
  const handler = debounce(async () => {
    const enabled = await isBiometricLockEnabled();
    if (enabled) {
      await updateLastActivity();
    }
  }, 1000);

  events.forEach((event) => {
    document.addEventListener(event, handler, { passive: true });
  });
}
