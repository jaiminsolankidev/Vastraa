/**
 * Vastraa - Accessible Toast Notification Module
 * Provides both visible transient alerts and WCAG-compliant live-region announcements.
 */

class ToastService {
  constructor() {
    this.container = null;
    this.liveRegion = null;
    this.init();
  }

  init() {
    if (typeof document === "undefined") return;

    // Visual container
    let container = document.getElementById("vastraa-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "vastraa-toast-container";
      container.className = "vastraa-toast-container";
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);
    }
    this.container = container;

    // Accessible live region for screen readers
    let liveRegion = document.getElementById("vastraa-live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "vastraa-live-region";
      liveRegion.className = "sr-only";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      document.body.appendChild(liveRegion);
    }
    this.liveRegion = liveRegion;
  }

  show(message, type = "success", durationMs = 3500) {
    if (typeof document === "undefined") return;
    if (!this.container) this.init();

    // Screen reader announcement
    if (this.liveRegion) {
      this.liveRegion.textContent = "";
      setTimeout(() => {
        this.liveRegion.textContent = message;
      }, 50);
    }

    // Visual toast card
    const toast = document.createElement("div");
    toast.className = `vastraa-toast vastraa-toast--${type}`;
    
    const icon = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      <div class="vastraa-toast__icon">${icon}</div>
      <div class="vastraa-toast__message">${message}</div>
      <button type="button" class="vastraa-toast__close" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector(".vastraa-toast__close");
    const dismiss = () => {
      toast.classList.add("vastraa-toast--leaving");
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener("click", dismiss);
    this.container.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
      dismiss();
    }, durationMs);
  }
}

export const toast = new ToastService();
export function showToast(message, type = "success", durationMs = 3500) {
  toast.show(message, type, durationMs);
}

