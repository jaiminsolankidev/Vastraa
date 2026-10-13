/**
 * Vastraa - Cart & Pricing Calculation Unit Tests
 * Verifies exact integer-paise monetary mathematics and discount rules.
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { formatPrice, calculateDiscount } from "../js/modules/product-data.js";
import { CartService, FREE_SHIPPING_THRESHOLD_PAISE, STANDARD_SHIPPING_PAISE } from "../js/modules/cart.js";

// Mock localStorage for node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.window = {
  localStorage: new MockLocalStorage(),
  dispatchEvent: () => true
};
globalThis.CustomEvent = class {
  constructor(name, detail) {
    this.name = name;
    this.detail = detail;
  }
};

describe("Cart and Integer-Paise Arithmetic", () => {
  let cart;

  beforeEach(() => {
    window.localStorage.clear();
    cart = new CartService();
  });

  test("Price formatting correctly formats integer paise into INR rupees", () => {
    assert.strictEqual(formatPrice(0), "₹0");
    assert.strictEqual(formatPrice(2850000), "₹28,500");
    assert.strictEqual(formatPrice(19900), "₹199");
    assert.strictEqual(formatPrice(8800000), "₹88,000");
  });

  test("Discount calculation calculates whole percentage accurately", () => {
    // ₹28,500 selling vs ₹34,000 compare-at
    const discount = calculateDiscount(2850000, 3400000);
    assert.strictEqual(discount, 16); // ~16.17% -> 16%

    // No discount when compare price is missing or lower
    assert.strictEqual(calculateDiscount(2850000, null), 0);
    assert.strictEqual(calculateDiscount(2850000, 2000000), 0);
  });

  test("Adding item to cart calculates subtotal and enforces stock quantity", () => {
    const added = cart.addItem("vas-w-001", "Free Size (Unstitched Blouse)", "Crimson Red", 1);
    assert.strictEqual(added, true);
    assert.strictEqual(cart.getItemCount(), 1);

    const summary = cart.getSummary();
    assert.strictEqual(summary.subtotalPaise, 2850000);
    // Above free shipping threshold (299900 paise = ₹2,999)
    assert.strictEqual(summary.shippingPaise, 0);
    assert.strictEqual(summary.isFreeShipping, true);
    assert.strictEqual(summary.totalPaise, 2850000);
  });

  test("Free shipping threshold logic (under ₹2,999 incurs ₹199 shipping)", () => {
    // Custom item under threshold (₹2,000)
    cart.items = [
      {
        id: "test-item-under-threshold",
        productId: "custom-accessory-item",
        size: "Standard",
        color: "Ivory",
        quantity: 1,
        pricePaise: 200000 // ₹2,000
      }
    ];

    const summary = cart.getSummary();
    assert.strictEqual(summary.subtotalPaise, 200000);
    assert.strictEqual(summary.shippingPaise, STANDARD_SHIPPING_PAISE); // 19900 paise
    assert.strictEqual(summary.isFreeShipping, false);
    assert.strictEqual(summary.totalPaise, 200000 + 19900); // ₹2,199
  });

  test("Promo code VASTRAA10 deducts 10% privilege discount", () => {
    cart.items = [
      {
        id: "item-1",
        productId: "vas-w-001", // ₹28,500
        size: "Free Size",
        color: "Crimson Red",
        quantity: 1,
        pricePaise: 2850000
      }
    ];

    const promoRes = cart.applyPromo("VASTRAA10");
    assert.strictEqual(promoRes.success, true);

    const summary = cart.getSummary();
    assert.strictEqual(summary.subtotalPaise, 2850000);
    assert.strictEqual(summary.discountPaise, 285000); // 10% of ₹28,500 = ₹2,850
    assert.strictEqual(summary.totalPaise, 2565000); // ₹25,650
  });

  test("Updating quantity and removing item updates state correctly", () => {
    cart.addItem("vas-w-001", "Free Size (Unstitched Blouse)", "Crimson Red", 1);
    const itemId = cart.items[0].id;

    cart.updateQuantity(itemId, 2);
    assert.strictEqual(cart.getItemCount(), 2);
    assert.strictEqual(cart.getSummary().subtotalPaise, 2850000 * 2);

    cart.removeItem(itemId);
    assert.strictEqual(cart.getItemCount(), 0);
    assert.strictEqual(cart.items.length, 0);
  });
});
