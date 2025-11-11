// src/scripts/utils/networkHelper.js
export const NetworkHelper = (function () {
  const subscribers = [];

  function isOnline() {
    return navigator.onLine;
  }

  function subscribe(fn) {
    if (typeof fn === 'function') subscribers.push(fn);
  }

  function notify(status) {
    subscribers.forEach((s) => {
      try { s(status); } catch (e) { console.error(e); }
    });
  }

  function init() {
    window.addEventListener('online', () => {
      notify(true);
    });
    window.addEventListener('offline', () => {
      notify(false);
    });
    // initial notify
    setTimeout(() => notify(isOnline()), 100);
  }

  return { init, subscribe, isOnline };
})();