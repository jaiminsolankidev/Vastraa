/**
 * Vastraa - Main Client Application Script
 * Orchestrates header interactions, mobile navigation, cart drawer,
 * search overlay, global event listeners, and shared UI components.
 */

import { PRODUCTS, formatPrice, calculateDiscount, getProductById } from "./modules/product-data.js";
import { cart } from "./modules/cart.js";
import { wishlist } from "./modules/wishlist.js";
import { DialogController, initAccordions } from "./modules/accessibility.js";
import { toast } from "./modules/toast.js";
import { validateField, VALIDATION_RULES } from "./modules/validation.js";

// Global DOM Ready Orchestration
document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initMobileNavigation();
  initSearchOverlay();
  initCartDrawer();
  initGlobalBadges();
  initAccordions();
  initFooterNewsletter();
  initImageFallbacks();
  setupGlobalWishlistDelegation();
});

/**
 * Sticky Header Scroll Observer
 */
function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header.classList.add("site-header--scrolled");
    } else {
      header.classList.remove("site-header--scrolled");
    }
  }, { passive: true });
}

/**
 * Mobile Navigation Drawer Controller
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const drawer = document.getElementById("mobile-nav-drawer");
  const backdrop = document.getElementById("mobile-nav-backdrop");
  const closeBtn = drawer?.querySelector(".drawer-close-btn");

  if (!drawer || !backdrop) return;

  const controller = new DialogController(drawer, {
    onOpen: () => {
      backdrop.classList.add("is-open");
      toggleBtn?.setAttribute("aria-expanded", "true");
    },
    onClose: () => {
      backdrop.classList.remove("is-open");
      toggleBtn?.setAttribute("aria-expanded", "false");
    }
  });

  toggleBtn?.addEventListener("click", () => controller.open(toggleBtn));
  closeBtn?.addEventListener("click", () => controller.close());
  backdrop.addEventListener("click", () => controller.close());
}

/**
 * Search Overlay Controller
 */
function initSearchOverlay() {
  const openBtns = document.querySelectorAll("[data-action='open-search']");
  const overlay = document.getElementById("search-overlay");
  const closeBtn = overlay?.querySelector(".search-close-btn");
  const searchInput = overlay?.querySelector("input[name='q']");
  const searchForm = overlay?.querySelector("form");

  if (!overlay) return;

  const controller = new DialogController(overlay, {
    onOpen: () => {
      setTimeout(() => searchInput?.focus(), 100);
    }
  });

  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      controller.open(btn);
    });
  });

  closeBtn?.addEventListener("click", () => controller.close());

  // Search suggestions clicks
  overlay.querySelectorAll(".suggestion-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.textContent.trim();
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    });
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput?.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  });
}

/**
 * Slide-Out Cart Drawer Controller
 */
function initCartDrawer() {
  const openBtns = document.querySelectorAll("[data-action='open-cart']");
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-drawer-backdrop");
  const closeBtn = drawer?.querySelector(".cart-drawer__header .close-btn");

  if (!drawer || !backdrop) return;

  const controller = new DialogController(drawer, {
    onOpen: () => {
      backdrop.classList.add("is-open");
      renderCartDrawer();
    },
    onClose: () => {
      backdrop.classList.remove("is-open");
    }
  });

  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      controller.open(btn);
    });
  });

  closeBtn?.addEventListener("click", () => controller.close());
  backdrop.addEventListener("click", () => controller.close());

  // Listen to cart events to update drawer content and badges
  window.addEventListener("vastraa:cart-updated", () => {
    updateHeaderCounts();
    if (drawer.classList.contains("is-open")) {
      renderCartDrawer();
    }
  });

  // Delegated event handling for drawer items
  const drawerBody = drawer.querySelector(".cart-drawer__body");
  if (drawerBody) {
    drawerBody.addEventListener("click", (e) => {
      const inc = e.target.closest("[data-action='increment']");
      if (inc) {
        e.preventDefault();
        const id = inc.dataset.id;
        const itm = cart.items.find(i => i.id === id);
        if (itm) cart.updateQuantity(id, itm.quantity + 1);
        return;
      }

      const dec = e.target.closest("[data-action='decrement']");
      if (dec) {
        e.preventDefault();
        const id = dec.dataset.id;
        const itm = cart.items.find(i => i.id === id);
        if (itm) cart.updateQuantity(id, itm.quantity - 1);
        return;
      }

      const rm = e.target.closest("[data-action='remove']");
      if (rm) {
        e.preventDefault();
        cart.removeItem(rm.dataset.id);
        return;
      }
    });

    drawerBody.addEventListener("change", (e) => {
      const input = e.target.closest(".qty-input");
      if (input) {
        const val = parseInt(input.value, 10);
        if (!isNaN(val)) cart.updateQuantity(input.dataset.id, val);
      }
    });
  }

  // Render initial drawer
  renderCartDrawer();
}

/**
 * Render items and summary inside Cart Drawer
 */
export function renderCartDrawer() {
  const drawerBody = document.querySelector(".cart-drawer__body");
  const drawerFooter = document.querySelector(".cart-drawer__footer");
  const shippingMeter = document.querySelector(".cart-drawer__shipping-meter");
  if (!drawerBody || !drawerFooter) return;

  const items = cart.items;
  const summary = cart.getSummary();

  // Render Shipping Progress Meter
  if (shippingMeter) {
    if (items.length === 0) {
      shippingMeter.style.display = "none";
    } else {
      shippingMeter.style.display = "block";
      const percent = Math.min(100, Math.round((summary.subtotalPaise / 299900) * 100));
      const meterText = summary.isFreeShipping
        ? `<span>🎉 You unlocked <strong>Complimentary Express Shipping</strong>!</span>`
        : `<span>Add <strong>${formatPrice(summary.freeShippingThresholdRemainingPaise)}</strong> more for Free Shipping</span>`;

      shippingMeter.innerHTML = `
        <div class="meter-text">${meterText}</div>
        <div class="meter-bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <div class="meter-progress" style="width: ${percent}%;"></div>
        </div>
      `;
    }
  }

  // Render Cart Items
  if (items.length === 0) {
    drawerBody.innerHTML = `
      <div class="cart-empty">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h4>Your Shopping Bag is Empty</h4>
        <p>Explore our royal handloom weaves, festive lehengas, and regal couture.</p>
        <a href="shop.html" class="btn btn--primary btn--sm">Explore Collections</a>
      </div>
    `;
    drawerFooter.style.display = "none";
    return;
  }

  drawerFooter.style.display = "block";

  drawerBody.innerHTML = items.map(item => {
    const product = getProductById(item.productId);
    const imgUrl = product ? product.image : "assets/images/products/fallback-women.svg";
    const title = product ? product.name : "Handcrafted Ensemble";
    const lineTotal = formatPrice((product ? product.pricePaise : item.pricePaise) * item.quantity);

    return `
      <div class="cart-item" data-cart-id="${item.id}">
        <div class="cart-item__img-wrap">
          <img src="${imgUrl}" alt="${title}" loading="lazy" onerror="this.src='assets/images/products/fallback-women.svg'" />
        </div>
        <div class="cart-item__info">
          <h4 class="cart-item__title"><a href="product.html?slug=${product?.slug || ''}">${title}</a></h4>
          <div class="cart-item__meta">Size: <strong>${item.size}</strong> ${item.color ? `• Color: <strong>${item.color}</strong>` : ''}</div>
          <div class="cart-item__price">${lineTotal}</div>
          <div class="cart-item__actions" style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 12px !important; margin-top: 10px !important; width: 100% !important;">
            <div class="quantity-stepper" style="display: inline-flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; width: 108px !important; height: 36px !important; border: 1px solid #D1C4B0 !important; border-radius: 4px !important; background: #FFFFFF !important; overflow: hidden !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important;">
              <button type="button" class="qty-btn" data-action="decrement" data-id="${item.id}" aria-label="Decrease quantity" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 100% !important; border: none !important; background: #F8F4EE !important; color: #2B2523 !important; font-size: 16px !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; user-select: none !important;">−</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" max="20" data-id="${item.id}" aria-label="Item quantity" style="width: 44px !important; height: 100% !important; border: none !important; border-left: 1px solid #EAE0D5 !important; border-right: 1px solid #EAE0D5 !important; text-align: center !important; font-family: Inter, sans-serif !important; font-size: 14px !important; font-weight: 600 !important; color: #2B2523 !important; background: #FFFFFF !important; padding: 0 !important; margin: 0 !important; -moz-appearance: textfield;" />
              <button type="button" class="qty-btn" data-action="increment" data-id="${item.id}" aria-label="Increase quantity" style="display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 100% !important; border: none !important; background: #F8F4EE !important; color: #2B2523 !important; font-size: 16px !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; user-select: none !important;">+</button>
            </div>
            <button type="button" class="cart-item__remove" data-action="remove" data-id="${item.id}" style="cursor: pointer; display: inline-flex; align-items: center; gap: 4px; color: #9E1F2D; font-size: 0.825rem; font-weight: 500; background: #FFF5F5; border: 1px solid #FFD0D0; border-radius: 4px; padding: 6px 12px; transition: all 0.2s ease;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span style="pointer-events: none;">Remove</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");


  // Render Footer Summary
  drawerFooter.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <span>${summary.formattedSubtotal}</span>
    </div>
    ${summary.discountPaise > 0 ? `
      <div class="summary-row" style="color: var(--color-success, #235F3D);">
        <span>Privilege Discount (${summary.promo?.code})</span>
        <span>-${summary.formattedDiscount}</span>
      </div>
    ` : ''}
    <div class="summary-row">
      <span>Estimated Shipping</span>
      <span>${summary.formattedShipping}</span>
    </div>
    <div class="summary-row summary-row--total">
      <span>Total (Incl. of Taxes)</span>
      <span class="total-amount">${summary.formattedTotal}</span>
    </div>
    <div class="cart-drawer-btns">
      <a href="checkout.html" class="btn btn--primary btn--full">Proceed to Checkout</a>
      <a href="cart.html" class="btn btn--secondary btn--full btn--sm">View Full Bag</a>
    </div>
  `;
}

/**
 * Synchronize Header Badges (Bag & Wishlist)
 */
export function updateHeaderCounts() {
  const cartBadges = document.querySelectorAll(".badge-count[data-type='cart']");
  const cartCount = cart.getItemCount();
  cartBadges.forEach(badge => {
    badge.textContent = cartCount > 0 ? String(cartCount) : "";
    badge.dataset.count = String(cartCount);
  });

  const wishlistBadges = document.querySelectorAll(".badge-count[data-type='wishlist']");
  const wishCount = wishlist.getCount();
  wishlistBadges.forEach(badge => {
    badge.textContent = wishCount > 0 ? String(wishCount) : "";
    badge.dataset.count = String(wishCount);
  });
}

function initGlobalBadges() {
  updateHeaderCounts();
  window.addEventListener("vastraa:cart-updated", updateHeaderCounts);
  window.addEventListener("vastraa:wishlist-updated", updateHeaderCounts);
}

/**
 * Global Wishlist Click Delegation
 */
function setupGlobalWishlistDelegation() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wishlist-toggle]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const productId = btn.dataset.wishlistToggle;
    const isNowSaved = wishlist.toggle(productId);

    // Update button visual state
    btn.classList.toggle("is-active", isNowSaved);
    btn.setAttribute("aria-pressed", String(isNowSaved));
    btn.setAttribute("aria-label", isNowSaved ? "Remove from Wishlist" : "Save to Wishlist");
  });
}

/**
 * Reusable Product Card HTML Template Generator
 */
export function createProductCardHTML(product) {
  if (!product) return "";
  const isSaved = wishlist.has(product.id);
  const discount = calculateDiscount(product.pricePaise, product.compareAtPricePaise);
  const fallback = product.fallbackImage || "assets/images/products/fallback-women.svg";

  let badgesHTML = "";
  if (discount > 0) {
    badgesHTML += `<span class="badge badge--burgundy">${discount}% OFF</span>`;
  }
  if (product.newArrival) {
    badgesHTML += `<span class="badge badge--gold">NEW ARRIVAL</span>`;
  } else if (product.bestseller) {
    badgesHTML += `<span class="badge badge--sand">BESTSELLER</span>`;
  }

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__media">
        <a href="product.html?slug=${product.slug}" class="product-card__link" aria-label="${product.name}">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-card__img" 
            loading="lazy"
            onerror="this.src='${fallback}'"
          />
        </a>
        <div class="product-card__badges">
          ${badgesHTML}
        </div>
        <button 
          type="button" 
          class="product-card__wishlist-btn ${isSaved ? 'is-active' : ''}" 
          data-wishlist-toggle="${product.id}"
          aria-label="${isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}"
          aria-pressed="${String(isSaved)}"
        >
          <svg viewBox="0 0 24 24" fill="${isSaved ? '#641E2B' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="product-card__quick-add">
          <a href="product.html?slug=${product.slug}" class="btn btn--primary btn--sm btn--full">View Ensemble</a>
        </div>
      </div>
      <div class="product-card__content">
        <div class="product-card__category">${product.category} • ${product.subcategory.replace('-', ' ')}</div>
        <h3 class="product-card__title">
          <a href="product.html?slug=${product.slug}">${product.name}</a>
        </h3>
        <div class="product-card__meta">${product.material}</div>
        <div class="product-card__pricing">
          <span class="price-current">${formatPrice(product.pricePaise)}</span>
          ${product.compareAtPricePaise ? `<span class="price-compare">${formatPrice(product.compareAtPricePaise)}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">${discount}% off</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Newsletter Form Handling with Field-Level Validation
 */
function initFooterNewsletter() {
  const form = document.getElementById("footer-newsletter-form");
  if (!form) return;

  const emailInput = form.querySelector("input[type='email']");
  const statusMsg = document.getElementById("newsletter-status-msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!emailInput) return;

    const isValid = validateField(emailInput, {
      required: true,
      email: true,
      label: "Email"
    });

    if (isValid) {
      if (statusMsg) {
        statusMsg.textContent = "Thank you for subscribing to Vastraa Couture. Privileged previews will arrive in your inbox.";
        statusMsg.style.color = "#C5A15B";
      }
      toast.show("Subscribed successfully to Vastraa Gazette.", "success");
      form.reset();
    }
  });
}

/**
 * Image error fallback handler
 */
function initImageFallbacks() {
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = "assets/images/products/fallback-women.svg";
      }
    });
  });
}
