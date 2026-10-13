/**
 * Vastraa - Local Storage Utility Module
 * Safe wrapper around localStorage with JSON validation and error fallback.
 */

const STORAGE_KEYS = {
  CART: "vastraa_cart_v1",
  WISHLIST: "vastraa_wishlist_v1",
  ORDERS: "vastraa_orders_v1",
  PROMO: "vastraa_promo_v1"
};

/**
 * Safely parse JSON from storage or return fallback defaultValue
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultValue;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[Vastraa Storage] Corrupted or unavailable storage for key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safely set serialized JSON in localStorage
 */
export function setStorageItem(key, value) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[Vastraa Storage] Error saving key "${key}":`, err);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[Vastraa Storage] Error removing key "${key}":`, err);
    return false;
  }
}

export { STORAGE_KEYS };
