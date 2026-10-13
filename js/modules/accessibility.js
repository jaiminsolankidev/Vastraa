/**
 * Vastraa - Accessibility & Focus Management Module
 * Manages focus traps, Escape key handling, and ARIA disclosures (WCAG 2.2 AA).
 */

export class DialogController {
  constructor(dialogElement, options = {}) {
    this.dialog = dialogElement;
    this.options = options;
    this.previouslyFocusedElement = null;
    this.focusableElements = [];
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getFocusableElements() {
    if (!this.dialog) return [];
    return Array.from(
      this.dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  open(triggerElement = null) {
    if (!this.dialog) return;
    this.previouslyFocusedElement = triggerElement || document.activeElement;
    this.dialog.classList.add("is-open");
    this.dialog.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    this.focusableElements = this.getFocusableElements();
    if (this.focusableElements.length > 0) {
      setTimeout(() => {
        this.focusableElements[0].focus();
      }, 50);
    }

    document.addEventListener("keydown", this.handleKeyDown);

    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  close() {
    if (!this.dialog) return;
    this.dialog.classList.remove("is-open");
    this.dialog.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    document.removeEventListener("keydown", this.handleKeyDown);

    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === "function") {
      this.previouslyFocusedElement.focus();
    }

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  handleKeyDown(event) {
    if (event.key === "Escape" || event.key === "Esc") {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === "Tab") {
      this.focusableElements = this.getFocusableElements();
      if (this.focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
}

/**
 * Initialize accessible accordion toggles
 */
export function initAccordions() {
  const triggers = document.querySelectorAll("[data-accordion-trigger]");
  triggers.forEach(trigger => {
    // Avoid double binding
    if (trigger.dataset.accordionBound) return;
    trigger.dataset.accordionBound = "true";

    trigger.addEventListener("click", () => {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      const targetId = trigger.getAttribute("aria-controls");
      const targetPanel = targetId ? document.getElementById(targetId) : trigger.nextElementSibling;

      if (!targetPanel) return;

      trigger.setAttribute("aria-expanded", String(!isExpanded));
      if (!isExpanded) {
        targetPanel.classList.add("is-open");
        targetPanel.removeAttribute("hidden");
      } else {
        targetPanel.classList.remove("is-open");
        targetPanel.setAttribute("hidden", "");
      }
    });
  });
}
