/**
 * Vastraa - Shopping Cart Management Module
 * Uses integer-paise arithmetic for exact monetary math and emits lifecycle events.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage.js";
import { formatPrice, getProductById } from "./product-data.js";
import { toast } from "./toast.js";

// Free shipping threshold: ₹2,999 (299900 paise)
export const FREE_SHIPPING_THRESHOLD_PAISE = 299900;
// Standard flat shipping charge: ₹199 (19900 paise)
export const STANDARD_SHIPPING_PAISE = 19900;

export class CartService {
  constructor() {
    this.items = this.loadCart();
    this.promoCode = getStorageItem(STORAGE_KEYS.PROMO, null);
  }

  loadCart() {
    const raw = getStorageItem(STORAGE_KEYS.CART, []);
    if (!Array.isArray(raw)) return [];
    // Validate each cart item structure
    return raw.filter(item => item && item.productId && item.quantity > 0);
  }

  saveCart() {
    setStorageItem(STORAGE_KEYS.CART, this.items);
    this.broadcast();
  }

  broadcast() {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("vastraa:cart-updated", {
        detail: {
          items: this.items,
          count: this.getItemCount(),
          summary: this.getSummary()
        }
      });
      window.dispatchEvent(event);
    }
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  /**
   * Add product to cart with chosen size and color
   */
  addItem(productId, size, color, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
      toast.show("Product not found.", "error");
      return false;
    }

    if (!size) {
      toast.show("Please select a size before adding to bag.", "error");
      return false;
    }

    const maxStock = product.stockQuantity || 10;
    const existingIndex = this.items.findIndex(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantity + quantity;
      if (newQty > maxStock) {
        toast.show(`Cannot add more. Maximum available stock is ${maxStock}.`, "error");
        return false;
      }
      this.items[existingIndex].quantity = newQty;
    } else {
      if (quantity > maxStock) {
        toast.show(`Only ${maxStock} items available in stock.`, "error");
        return false;
      }
      this.items.push({
        id: `${productId}-${size}-${color || "default"}`.replace(/\s+/g, "-"),
        productId,
        size,
        color: color || (product.availableColors?.[0]?.name || ""),
        quantity,
        pricePaise: product.pricePaise,
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart();
    toast.show(`Added "${product.name}" to your shopping bag.`, "success");
    return true;
  }

  updateQuantity(cartItemId, newQuantity) {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty)) return false;

    const index = this.items.findIndex(item => item.id === cartItemId);
    if (index === -1) return false;

    if (qty <= 0) {
      return this.removeItem(cartItemId);
    }

    const item = this.items[index];
    const product = getProductById(item.productId);
    const maxStock = product ? (product.stockQuantity ?? 10) : 10;

    if (qty > maxStock) {
      toast.show(`Maximum available quantity is ${maxStock}.`, "error");
      item.quantity = maxStock;
    } else {
      item.quantity = qty;
    }

    this.saveCart();
    return true;
  }


  removeItem(cartItemId) {
    const initialLen = this.items.length;
    this.items = this.items.filter(item => item.id !== cartItemId);
    if (this.items.length !== initialLen) {
      this.saveCart();
      toast.show("Item removed from your shopping bag.", "success");
      return true;
    }
    return false;
  }

  clear() {
    this.items = [];
    this.promoCode = null;
    setStorageItem(STORAGE_KEYS.PROMO, null);
    this.saveCart();
  }

  applyPromo(code) {
    if (!code) return { success: false, message: "Please enter a promo code." };
    const normalized = code.trim().toUpperCase();
    if (normalized === "VASTRAA10") {
      this.promoCode = { code: "VASTRAA10", discountPercent: 10 };
      setStorageItem(STORAGE_KEYS.PROMO, this.promoCode);
      this.broadcast();
      return { success: true, message: "Code VASTRAA10 applied! 10% privilege discount added." };
    }
    if (normalized === "FESTIVE500") {
      this.promoCode = { code: "FESTIVE500", flatDiscountPaise: 50000 };
      setStorageItem(STORAGE_KEYS.PROMO, this.promoCode);
      this.broadcast();
      return { success: true, message: "Code FESTIVE500 applied! Flat ₹500 discount added." };
    }
    return { success: false, message: "Invalid or expired promo code." };
  }

  removePromo() {
    this.promoCode = null;
    setStorageItem(STORAGE_KEYS.PROMO, null);
    this.broadcast();
  }

  getSummary() {
    // Calculate subtotal
    const subtotalPaise = this.items.reduce((acc, item) => {
      const product = getProductById(item.productId);
      const price = product ? product.pricePaise : item.pricePaise;
      return acc + (price * item.quantity);
    }, 0);

    // Calculate promo discount
    let discountPaise = 0;
    if (this.promoCode) {
      if (this.promoCode.discountPercent) {
        discountPaise = Math.round((subtotalPaise * this.promoCode.discountPercent) / 100);
      } else if (this.promoCode.flatDiscountPaise) {
        discountPaise = Math.min(this.promoCode.flatDiscountPaise, subtotalPaise);
      }
    }

    const netSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);

    // Shipping charge logic
    let shippingPaise = 0;
    if (this.items.length > 0) {
      shippingPaise = netSubtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : STANDARD_SHIPPING_PAISE;
    }

    const totalPaise = netSubtotalPaise + shippingPaise;

    // GST component (12% inclusive for apparel above ₹1000)
    const gstPaise = Math.round(netSubtotalPaise - (netSubtotalPaise / 1.12));

    return {
      subtotalPaise,
      discountPaise,
      shippingPaise,
      gstPaise,
      totalPaise,
      isFreeShipping: shippingPaise === 0 && this.items.length > 0,
      freeShippingThresholdRemainingPaise: Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - netSubtotalPaise),
      promo: this.promoCode,
      formattedSubtotal: formatPrice(subtotalPaise),
      formattedDiscount: formatPrice(discountPaise),
      formattedShipping: shippingPaise === 0 ? "FREE" : formatPrice(shippingPaise),
      formattedTotal: formatPrice(totalPaise),
      formattedGst: formatPrice(gstPaise)
    };
  }
}

export const cart = new CartService();
