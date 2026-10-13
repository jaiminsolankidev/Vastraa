/**
 * Vastraa - Storage Guard Unit Tests
 */

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from "../js/modules/storage.js";

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
  localStorage: new MockLocalStorage()
};

describe("Storage Error Boundary & Resilience", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("Returns default value when key does not exist", () => {
    const val = getStorageItem("non_existent_key", []);
    assert.deepStrictEqual(val, []);
  });

  test("Safely handles corrupted non-JSON strings without throwing", () => {
    window.localStorage.setItem("corrupted_key", "{invalid json");
    const val = getStorageItem("corrupted_key", { fallback: true });
    assert.deepStrictEqual(val, { fallback: true });
  });

  test("Serializes and deserializes objects correctly", () => {
    const data = { id: "test", count: 42, active: true };
    setStorageItem(STORAGE_KEYS.CART, data);
    const retrieved = getStorageItem(STORAGE_KEYS.CART);
    assert.deepStrictEqual(retrieved, data);
  });

  test("Removes keys accurately", () => {
    setStorageItem("to_remove", "value");
    removeStorageItem("to_remove");
    assert.strictEqual(getStorageItem("to_remove"), null);
  });
});
