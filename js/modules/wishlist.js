/**
 * Vastraa - Wishlist Management Module
 * Persists saved products to localStorage and synchronizes UI state.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage.js";
import { getProductById } from "./product-data.js";
import { cart } from "./cart.js";
import { toast } from "./toast.js";

export class WishlistService {
  constructor() {
    this.items = this.loadWishlist();
  }

  loadWishlist() {
    const raw = getStorageItem(STORAGE_KEYS.WISHLIST, []);
    if (!Array.isArray(raw)) return [];
    // Ensure all stored items correspond to existing products
    return raw.filter(id => typeof id === "string" && getProductById(id));
  }

  saveWishlist() {
    setStorageItem(STORAGE_KEYS.WISHLIST, this.items);
    this.broadcast();
  }

  broadcast() {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("vastraa:wishlist-updated", {
        detail: {
          items: this.items,
          count: this.items.length
        }
      });
      window.dispatchEvent(event);
    }
  }

  getCount() {
    return this.items.length;
  }

  has(productId) {
    return this.items.includes(productId);
  }

  toggle(productId) {
    const product = getProductById(productId);
    if (!product) return false;

    const index = this.items.indexOf(productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.saveWishlist();
      toast.show(`Removed "${product.name}" from wishlist.`, "success");
      return false; // Not in wishlist anymore
    } else {
      this.items.push(productId);
      this.saveWishlist();
      toast.show(`Saved "${product.name}" to wishlist.`, "success");
      return true; // Added to wishlist
    }
  }

  remove(productId) {
    const index = this.items.indexOf(productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.saveWishlist();
      toast.show("Item removed from wishlist.", "success");
      return true;
    }
    return false;
  }

  moveToCart(productId, size = null) {
    const product = getProductById(productId);
    if (!product) return false;

    const chosenSize = size || product.availableSizes[0];
    const chosenColor = product.availableColors?.[0]?.name || "";

    const added = cart.addItem(productId, chosenSize, chosenColor, 1);
    if (added) {
      this.remove(productId);
      return true;
    }
    return false;
  }
}

export const wishlist = new WishlistService();
