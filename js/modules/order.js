/**
 * Vastraa - Demo Order Management & Tracking Simulator
 * Manages demonstration orders with realistic Indian courier lifecycle.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage.js";
import { formatPrice } from "./product-data.js";

// Seed demo orders for testing order tracking out of the box
const DEFAULT_DEMO_ORDERS = [
  {
    orderId: "VAS-2026-8841",
    customer: {
      fullName: "Ananya Sharma",
      email: "ananya.sharma@example.com",
      phone: "+91 98765 43210",
      address: "B-402, Heritage Palms, MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001"
    },
    items: [
      {
        productId: "vas-w-001",
        name: "Royal Crimson Kanjivaram Silk Saree",
        size: "Free Size",
        color: "Crimson Red",
        quantity: 1,
        pricePaise: 2850000
      }
    ],
    summary: {
      subtotalPaise: 2850000,
      discountPaise: 0,
      shippingPaise: 0,
      totalPaise: 2850000,
      formattedTotal: "₹28,500"
    },
    paymentMethod: "UPI (Demo)",
    status: "dispatched",
    statusText: "Dispatched & In Transit",
    timeline: [
      { step: "Order Confirmed", date: "10 Oct 2026, 14:30", completed: true },
      { step: "Artisan Quality Checked & Packaged", date: "11 Oct 2026, 09:15", completed: true },
      { step: "Dispatched via BlueDart Express", date: "11 Oct 2026, 11:00", completed: true },
      { step: "Out for Delivery", date: "Expected 13 Oct 2026", completed: false },
      { step: "Delivered", date: "Pending", completed: false }
    ],
    estimatedDelivery: "13 Oct 2026",
    trackingNumber: "BD-90481726IN",
    createdAt: "2026-10-10T09:00:00Z"
  }
];

export class OrderService {
  constructor() {
    this.initOrders();
  }

  initOrders() {
    const existing = getStorageItem(STORAGE_KEYS.ORDERS, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      setStorageItem(STORAGE_KEYS.ORDERS, DEFAULT_DEMO_ORDERS);
    }
  }

  getAllOrders() {
    return getStorageItem(STORAGE_KEYS.ORDERS, DEFAULT_DEMO_ORDERS);
  }

  getOrder(orderId) {
    if (!orderId) return null;
    const cleanId = orderId.trim().toUpperCase();
    const orders = this.getAllOrders();
    return orders.find(o => o.orderId.toUpperCase() === cleanId) || null;
  }

  createDemoOrder(formData, cartItems, cartSummary) {
    const timestamp = Date.now().toString().slice(-4);
    const orderId = `VAS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        apartment: formData.apartment || "",
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: "India"
      },
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name || "Handcrafted Heritage Ensemble",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        pricePaise: item.pricePaise
      })),
      summary: {
        subtotalPaise: cartSummary.subtotalPaise,
        discountPaise: cartSummary.discountPaise,
        shippingPaise: cartSummary.shippingPaise,
        totalPaise: cartSummary.totalPaise,
        formattedTotal: cartSummary.formattedTotal
      },
      paymentMethod: formData.paymentMethod || "Prepaid Card (Demo)",
      status: "confirmed",
      statusText: "Order Confirmed & Preparing for Atelier Handcrafting",
      timeline: [
        { step: "Order Confirmed", date: "Just now", completed: true },
        { step: "Artisan Quality Checked & Packaged", date: "In progress", completed: false },
        { step: "Dispatched via Express Courier", date: "Estimated in 24 hrs", completed: false },
        { step: "Out for Delivery", date: "Pending", completed: false },
        { step: "Delivered", date: "Pending", completed: false }
      ],
      estimatedDelivery: "3–5 Business Days",
      trackingNumber: `BD-${Math.floor(10000000 + Math.random() * 90000000)}IN`,
      createdAt: new Date().toISOString()
    };

    const orders = this.getAllOrders();
    orders.unshift(newOrder);
    setStorageItem(STORAGE_KEYS.ORDERS, orders);

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    if (!orderId) return null;
    const orders = this.getAllOrders();
    const order = orders.find(o => o.orderId.toUpperCase() === orderId.trim().toUpperCase());
    if (!order) return null;

    order.status = newStatus;
    const nowStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    switch (newStatus) {
      case "confirmed":
        order.statusText = "Order Confirmed & Preparing for Atelier Handcrafting";
        order.timeline[0].completed = true;
        order.timeline[1].completed = false;
        order.timeline[2].completed = false;
        order.timeline[3].completed = false;
        order.timeline[4].completed = false;
        break;
      case "quality_checked":
        order.statusText = "Artisan Quality Checked & Packaged";
        order.timeline[0].completed = true;
        order.timeline[1].completed = true;
        order.timeline[1].date = nowStr;
        order.timeline[2].completed = false;
        order.timeline[3].completed = false;
        order.timeline[4].completed = false;
        break;
      case "dispatched":
        order.statusText = "Dispatched via Express Courier";
        order.timeline[0].completed = true;
        order.timeline[1].completed = true;
        order.timeline[2].completed = true;
        order.timeline[2].date = nowStr;
        order.timeline[3].completed = false;
        order.timeline[4].completed = false;
        break;
      case "out_for_delivery":
        order.statusText = "Out for Delivery by Courier Agent";
        order.timeline[0].completed = true;
        order.timeline[1].completed = true;
        order.timeline[2].completed = true;
        order.timeline[3].completed = true;
        order.timeline[3].date = nowStr;
        order.timeline[4].completed = false;
        break;
      case "delivered":
        order.statusText = "Delivered to Customer";
        order.timeline.forEach(step => step.completed = true);
        order.timeline[4].date = nowStr;
        break;
    }

    setStorageItem(STORAGE_KEYS.ORDERS, orders);
    window?.dispatchEvent?.(new CustomEvent("vastraa:order-updated", { detail: { order } }));
    return order;
  }

  deleteOrder(orderId) {
    if (!orderId) return false;
    const orders = this.getAllOrders().filter(o => o.orderId.toUpperCase() !== orderId.trim().toUpperCase());
    setStorageItem(STORAGE_KEYS.ORDERS, orders);
    return true;
  }
}

export const orderService = new OrderService();

