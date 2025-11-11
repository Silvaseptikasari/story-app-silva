export function withViewTransition(fn) {
  // View Transition API (fallback safe)
  if (document.startViewTransition) {
    return document.startViewTransition(async () => {
      await fn();
    });
  }
  return fn();
}
