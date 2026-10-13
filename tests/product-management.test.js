/**
 * Vastraa - Product Management & Overrides Unit Tests
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

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
  dispatchEvent: () => {}
};

// Import after mocking window
const {
  PRODUCTS,
  updateProduct,
  addCustomProduct,
  deleteProduct,
  resetCatalogueToDefault,
  getProductById
} = await import("../js/modules/product-data.js");

describe("Product Management & Overrides", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCatalogueToDefault();
  });

  test("Allows updating title, price, and material of an existing ensemble", () => {
    const original = getProductById("vas-w-001");
    assert.ok(original);

    const updated = updateProduct("vas-w-001", {
      name: "Heritage Royal Crimson Silk Saree (Updated Edition)",
      pricePaise: 3200000,
      material: "100% Handloom Mulberry Silk & 24K Gold Zari"
    });

    assert.strictEqual(updated.name, "Heritage Royal Crimson Silk Saree (Updated Edition)");
    assert.strictEqual(updated.pricePaise, 3200000);
    assert.strictEqual(updated.material, "100% Handloom Mulberry Silk & 24K Gold Zari");

    // Check that getProductById retrieves the updated version
    const retrieved = getProductById("vas-w-001");
    assert.strictEqual(retrieved.name, "Heritage Royal Crimson Silk Saree (Updated Edition)");
  });

  test("Allows adding and subsequently editing a custom ensemble", () => {
    const customPiece = {
      id: "vas-custom-9999",
      slug: "custom-emerald-cape",
      name: "Custom Emerald Velvet Cape",
      category: "women",
      subcategory: "lehenga",
      pricePaise: 5500000,
      stockQuantity: 4,
      availability: "in_stock",
      material: "Silk Velvet",
      image: "https://example.com/cape.jpg"
    };

    addCustomProduct(customPiece);
    const added = getProductById("vas-custom-9999");
    assert.ok(added);
    assert.strictEqual(added.name, "Custom Emerald Velvet Cape");

    // Edit custom piece
    updateProduct("vas-custom-9999", {
      name: "Custom Emerald Royal Cape",
      pricePaise: 6000000
    });

    const edited = getProductById("vas-custom-9999");
    assert.strictEqual(edited.name, "Custom Emerald Royal Cape");
    assert.strictEqual(edited.pricePaise, 6000000);
  });

  test("Allows deleting an ensemble from the catalogue", () => {
    const target = getProductById("vas-w-002");
    assert.ok(target);

    deleteProduct("vas-w-002");
    const afterDelete = getProductById("vas-w-002");
    assert.strictEqual(afterDelete, null);
  });
});
