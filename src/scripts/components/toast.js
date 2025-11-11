// src/scripts/components/toast.js
export function showToast(message, type = "success") {
  try {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    // Append to body
    document.body.appendChild(toast);
    // Force reflow then show (fade-in)
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    // Remove instantly after 3s (no fade-out)
    setTimeout(() => {
      // remove immediately without transition out
      toast.remove();
    }, 3000);
  } catch (e) {
    console.error('showToast error', e);
  }
}