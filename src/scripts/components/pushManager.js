// Simple PushManager helper
export const PushManagerHelper = (function () {
  const PUBLIC_VAPID_KEY_PLACEHOLDER = '<<PASTE_PUBLIC_VAPID_KEY_HERE>>';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator)) throw new Error('ServiceWorker not supported');
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY_PLACEHOLDER)
    });
    return sub;
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      return true;
    }
    return false;
  }

  async function isSubscribed() {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  }

  return { subscribe, unsubscribe, isSubscribed };
})();