/**
 * Build Script: Generate 100% Self-Contained, Resilient Admin Suite (admin.html)
 * Embeds full luxury styles and seed data so it runs flawlessly on BOTH http:// and file:///
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// 1. Read CSS
const cssPath = path.join(ROOT_DIR, "css", "main.css");
const compiledCSS = fs.readFileSync(cssPath, "utf8");

// 2. Read products from product-data.js
const productDataPath = path.join(ROOT_DIR, "js", "modules", "product-data.js");
const productDataModule = await import("../js/modules/product-data.js");
const seedProducts = productDataModule.PRODUCTS;

// 3. Read seed orders from order.js
const orderDataModule = await import("../js/modules/order.js");
const seedOrders = [
  {
    orderId: "VAS-2026-8841",
    customer: {
      fullName: "Maharani Sunita Devi",
      email: "sunita.devi@heritage.in",
      phone: "+91 98201 44552",
      address: "12/A, Civil Lines, Near Raj Bhavan",
      city: "Jaipur",
      state: "Rajasthan",
      postalCode: "302006"
    },
    items: [
      {
        productId: "vas-w-001",
        name: "Royal Crimson Kanjivaram Silk Saree",
        size: "Free Size (Unstitched Blouse)",
        color: "Crimson Red",
        quantity: 1,
        pricePaise: 2850000
      }
    ],
    summary: {
      subtotalPaise: 2850000,
      discountPaise: 285000,
      shippingPaise: 0,
      totalPaise: 2565000,
      formattedTotal: "₹25,650"
    },
    paymentMethod: "Prepaid UPI",
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
  },
  {
    orderId: "VAS-2026-7290",
    customer: {
      fullName: "Rajesh Singhania",
      email: "r.singhania@apexcorp.com",
      phone: "+91 99887 66554",
      address: "Penthouse 4B, Skyview Towers, Worli Seaface",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400018"
    },
    items: [
      {
        productId: "vas-m-001",
        name: "Shahi Raw Silk Ivory Sherwani Set",
        size: "42",
        color: "Ivory Cream",
        quantity: 1,
        pricePaise: 6500000
      }
    ],
    summary: {
      subtotalPaise: 6500000,
      discountPaise: 0,
      shippingPaise: 0,
      totalPaise: 6500000,
      formattedTotal: "₹65,000"
    },
    paymentMethod: "Corporate Net Banking",
    status: "quality_checked",
    statusText: "Quality Checked & Packaged",
    timeline: [
      { step: "Order Confirmed", date: "11 Oct 2026, 08:45", completed: true },
      { step: "Artisan Quality Checked", date: "11 Oct 2026, 11:20", completed: true },
      { step: "Dispatched via BlueDart Express", date: "Expected Today", completed: false },
      { step: "Delivered", date: "Pending", completed: false }
    ],
    estimatedDelivery: "14 Oct 2026",
    trackingNumber: "BD-88271109IN",
    createdAt: "2026-10-11T03:15:00Z"
  },
  {
    orderId: "VAS-2026-6104",
    customer: {
      fullName: "Aditi Rao",
      email: "aditi.rao@gmail.com",
      phone: "+91 94451 88920",
      address: "Plot 88, Jubilee Hills, Road No. 36",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500033"
    },
    items: [
      {
        productId: "vas-w-002",
        name: "Noorani Zardozi Embroidered Bridal Lehenga",
        size: "M",
        color: "Royal Wine",
        quantity: 1,
        pricePaise: 8800000
      }
    ],
    summary: {
      subtotalPaise: 8800000,
      discountPaise: 880000,
      shippingPaise: 0,
      totalPaise: 7920000,
      formattedTotal: "₹79,200"
    },
    paymentMethod: "Credit Card (Visa Signature)",
    status: "confirmed",
    statusText: "Order Confirmed",
    timeline: [
      { step: "Order Confirmed", date: "11 Oct 2026, 10:10", completed: true },
      { step: "Quality Checked", date: "Scheduled", completed: false },
      { step: "Dispatched", date: "Scheduled", completed: false },
      { step: "Delivered", date: "Pending", completed: false }
    ],
    estimatedDelivery: "15 Oct 2026",
    trackingNumber: "BD-77341908IN",
    createdAt: "2026-10-11T04:40:00Z"
  }
];

const htmlContent = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Atelier Executive Suite | Vastraa Heritage Operations</title>

  <!-- Typography Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/main.css">
  <link rel="icon" type="image/svg+xml" href="assets/images/icons/logo.svg">

  <!-- Embedded Standalone Styles (Ensures 100% Styling on file:/// and http://) -->
  <style>
    /* Inlined Core & Admin Styles for bulletproof standalone rendering */
    ${compiledCSS}

    /* Extra luxury polish & enhancements */
    .admin-page {
      background-color: #F8F3EB !important;
      min-height: 100vh;
      color: #292521;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .admin-page__header {
      background-color: #641E2B !important;
      color: #FFFFFF !important;
      border-bottom: 2px solid #C5A15B;
      padding: 1rem 0;
    }
    .admin-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .admin-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .admin-brand__logo {
      height: 38px;
      filter: brightness(0) invert(1);
    }
    .admin-brand__title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin: 0;
      color: #FFFFFF;
    }
    .admin-brand__badge {
      background-color: rgba(197, 161, 91, 0.2);
      color: #C5A15B;
      border: 1px solid rgba(197, 161, 91, 0.4);
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .btn-storefront {
      background: transparent;
      color: #F8F3EB;
      border: 1px solid rgba(248, 243, 235, 0.4);
      padding: 7px 14px;
      font-size: 0.85rem;
      border-radius: 4px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-storefront:hover {
      background-color: rgba(255, 255, 255, 0.12);
      border-color: #C5A15B;
      color: #C5A15B;
    }
    .btn-storefront--highlight {
      background-color: rgba(197, 161, 91, 0.25);
      border-color: #C5A15B;
      color: #C5A15B;
      font-weight: 600;
    }
    .btn-storefront--highlight:hover {
      background-color: #C5A15B;
      color: #292521;
    }

    /* KPI Cards */
    .admin-page__stats {
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      background-color: #FFFFFF;
      border: 1px solid #E4D8C7;
      border-radius: 6px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(41, 37, 33, 0.05);
      position: relative;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(41, 37, 33, 0.08);
    }
    .stat-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background-color: #E9DFD1;
    }
    .stat-card--gold::before { background-color: #C5A15B; }
    .stat-card--burgundy::before { background-color: #641E2B; }
    .stat-card--warning::before { background-color: #E65100; }
    .stat-card--success::before { background-color: #2E7D32; }

    .stat-card__label {
      font-size: 0.775rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6B635B;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .stat-card__value {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.15rem;
      font-weight: 700;
      color: #292521;
      line-height: 1.1;
    }
    .stat-card__sub {
      font-size: 0.8rem;
      color: #6B635B;
      margin-top: 0.5rem;
    }

    /* Tabs */
    .admin-page__tabs {
      display: flex;
      gap: 0.75rem;
      border-bottom: 2px solid #E9DFD1;
      margin-bottom: 2rem;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      padding: 0.85rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #6B635B;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: #641E2B;
    }
    .tab-btn.is-active {
      color: #641E2B;
      font-weight: 700;
      border-bottom-color: #641E2B;
    }
    .tab-badge {
      background-color: #E9DFD1;
      color: #292521;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 700;
    }

    /* Tab Panes */
    .tab-pane {
      display: none;
    }
    .tab-pane.is-active {
      display: block;
      animation: fadeIn 0.25s ease-out;
    }

    /* Toolbar */
    .admin-toolbar {
      background-color: #FFFFFF;
      border: 1px solid #E4D8C7;
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .admin-toolbar__search {
      flex: 1;
      min-width: 260px;
      position: relative;
    }
    .admin-toolbar__search svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6B635B;
    }
    .admin-toolbar__search input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      border: 1px solid #E4D8C7;
      border-radius: 4px;
      font-size: 0.9rem;
      outline: none;
    }
    .admin-toolbar__search input:focus {
      border-color: #C5A15B;
      box-shadow: 0 0 0 2px rgba(197, 161, 91, 0.2);
    }
    .admin-toolbar__filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .filter-pill {
      background-color: #FAF6F0;
      border: 1px solid #E4D8C7;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #6B635B;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-pill:hover {
      background-color: #E9DFD1;
      color: #292521;
    }
    .filter-pill.is-active {
      background-color: #641E2B;
      border-color: #641E2B;
      color: #FFFFFF;
      font-weight: 600;
    }

    /* Table */
    .admin-table-container {
      background-color: #FFFFFF;
      border: 1px solid #E4D8C7;
      border-radius: 6px;
      overflow-x: auto;
      box-shadow: 0 2px 6px rgba(41, 37, 33, 0.04);
    }
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .admin-table th {
      background-color: #FAF6F0;
      padding: 12px 16px;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #641E2B;
      font-weight: 700;
      border-bottom: 2px solid #E4D8C7;
      white-space: nowrap;
    }
    .admin-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #EFE7DC;
      vertical-align: middle;
      font-size: 0.9rem;
    }
    .admin-table tr:hover td {
      background-color: #FAF8F5;
    }
    .product-thumb {
      width: 52px;
      height: 65px;
      object-fit: cover;
      border-radius: 4px;
      background-color: #E9DFD1;
      border: 1px solid #EFE7DC;
    }
    .product-meta__title {
      font-weight: 600;
      color: #292521;
      display: block;
      margin-bottom: 3px;
      font-size: 0.925rem;
    }
    .product-meta__sku {
      font-size: 0.75rem;
      color: #6B635B;
      font-family: monospace;
    }

    /* Stock Meters */
    .stock-meter-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }
    .stock-bar-bg {
      width: 100%;
      height: 6px;
      background-color: #E0E0E0;
      border-radius: 3px;
      overflow: hidden;
    }
    .stock-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .stock-bar-fill--healthy { background-color: #2E7D32; }
    .stock-bar-fill--low { background-color: #E65100; }
    .stock-bar-fill--out { background-color: #C62828; }

    /* Controls & Actions */
    .stock-control {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .stock-control button {
      width: 28px;
      height: 28px;
      border: 1px solid #E4D8C7;
      background-color: #E9DFD1;
      color: #292521;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
    }
    .stock-control button:hover {
      background-color: #C5A15B;
      color: #FFFFFF;
    }
    .stock-control input {
      width: 48px;
      height: 28px;
      text-align: center;
      border: 1px solid #E4D8C7;
      border-radius: 3px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .action-btn {
      padding: 6px 12px;
      font-size: 0.775rem;
      font-weight: 600;
      border-radius: 4px;
      border: 1px solid #E4D8C7;
      background-color: #FFFFFF;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #292521;
      transition: all 0.2s ease;
    }
    .action-btn:hover { background-color: #E9DFD1; }
    .action-btn--primary {
      background-color: #641E2B;
      color: #FFFFFF;
      border-color: #641E2B;
    }
    .action-btn--primary:hover { background-color: #832737; }
    .action-btn--danger {
      color: #C62828;
      border-color: #FFCDD2;
      background-color: #FFEBEE;
    }
    .action-btn--danger:hover { background-color: #FFCDD2; }

    /* Studio Layout */
    .studio-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2.5rem;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .studio-layout {
        grid-template-columns: 1fr;
      }
    }
    .studio-section-card {
      background-color: #FFFFFF;
      border: 1px solid #E4D8C7;
      border-radius: 6px;
      padding: 1.75rem;
      box-shadow: 0 2px 6px rgba(41, 37, 33, 0.04);
      margin-bottom: 1.5rem;
    }
    .studio-section-card__title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.35rem;
      color: #641E2B;
      margin-bottom: 1rem;
      border-bottom: 1px solid #EFE7DC;
      padding-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .studio-preview-col {
      position: sticky;
      top: 24px;
    }
    .preview-card-wrap {
      background-color: #FFFFFF;
      border: 1px solid #C5A15B;
      border-radius: 6px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(41, 37, 33, 0.08);
    }
    .preview-card-wrap .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #E9DFD1;
    }
    .preview-card-wrap .preview-header h4 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.15rem;
      color: #641E2B;
      margin: 0;
    }
    .preview-card-wrap .preview-card {
      border: 1px solid #EFE7DC;
      border-radius: 4px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .preview-card .preview-img-container {
      width: 100%;
      aspect-ratio: 3 / 4;
      position: relative;
      background-color: #E9DFD1;
      overflow: hidden;
    }
    .preview-card .preview-img-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preview-card .preview-details {
      padding: 12px;
    }
    .preview-card .preview-details .preview-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.05rem;
      font-weight: 600;
      color: #292521;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .studio-size-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 6px;
    }
    .size-chip-btn {
      background-color: #FFFFFF;
      border: 1px solid #E4D8C7;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .size-chip-btn:hover { background-color: #E9DFD1; }
    .size-chip-btn.is-selected {
      background-color: #641E2B;
      border-color: #641E2B;
      color: #FFFFFF;
      font-weight: 600;
    }
    .preset-buttons-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .preset-btn {
      background-color: #E9DFD1;
      border: none;
      padding: 5px 10px;
      font-size: 0.75rem;
      border-radius: 3px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .preset-btn:hover {
      background-color: #C5A15B;
      color: #FFFFFF;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="admin-page">
  <!-- Top Accessibility Live Region -->
  <div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>

  <!-- Admin Header Bar -->
  <header class="admin-page__header" role="banner">
    <div class="container admin-header-inner">
      <div class="admin-brand">
        <a href="index.html" aria-label="Back to Vastraa Storefront">
          <img src="assets/images/icons/logo.svg" alt="Vastraa Logo" class="admin-brand__logo">
        </a>
        <div>
          <h1 class="admin-brand__title">Atelier Executive Suite</h1>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span class="admin-brand__badge">Business Operations v2.5</span>
            <span style="font-size: 0.75rem; color: #DFC48A; display: inline-flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #4CAF50;"></span>
              Live Storefront Connected
            </span>
          </div>
        </div>
      </div>

      <div class="admin-actions">
        <a href="shop.html" class="btn-storefront" target="_blank" rel="noopener">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View Storefront
        </a>
        <button type="button" class="btn-storefront btn-storefront--highlight" id="btn-quick-create-demo-order" title="Simulate an incoming customer order">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          + Test Demo Order
        </button>
        <button type="button" class="btn-storefront" id="admin-logout-btn" title="Lock Administrative Session">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Lock Session
        </button>
      </div>
    </div>
  </header>

  <!-- Login Gate Modal (if session locked) -->
  <div id="login-gate" style="display: none; position: fixed; inset: 0; background: rgba(41, 37, 33, 0.9); z-index: 9999; backdrop-filter: blur(8px); align-items: center; justify-content: center;">
    <div style="background: #FFFFFF; border-radius: 8px; padding: 2.5rem; max-width: 440px; width: 92%; text-align: center; border: 1px solid #C5A15B; box-shadow: 0 20px 50px rgba(0,0,0,0.4);">
      <img src="assets/images/icons/logo.svg" alt="Vastraa" style="height: 48px; margin-bottom: 1.25rem;">
      <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 1.85rem; color: #641E2B; margin-bottom: 0.5rem;">Atelier Authentication</h2>
      <p style="font-size: 0.875rem; color: #6B635B; margin-bottom: 1.75rem; line-height: 1.5;">Enter administrative credentials to oversee live inventory levels, fulfill customer orders, and publish new artisanal ensembles.</p>
      
      <form id="login-gate-form">
        <div style="margin-bottom: 1.25rem; text-align: left;">
          <label for="admin-passcode" style="display: block; font-size: 0.8rem; font-weight: 600; color: #292521; margin-bottom: 0.35rem;">Atelier Passcode</label>
          <input type="password" id="admin-passcode" placeholder="Passcode (Default: vastraa2026)" value="vastraa2026" style="width: 100%; padding: 11px 14px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 1rem;" required>
          <p id="login-error" style="color: #9E1F2D; font-size: 0.75rem; margin-top: 0.35rem; display: none;">Invalid passcode. Try 'vastraa2026' or click Demo Login below.</p>
        </div>
        <button type="submit" class="btn btn--primary" style="width: 100%; margin-bottom: 0.75rem; padding: 12px; font-weight: 600; cursor: pointer;">Unlock Console</button>
        <button type="button" id="quick-demo-login-btn" class="btn btn--outline" style="width: 100%; font-size: 0.85rem; cursor: pointer; padding: 10px;">✨ 1-Click Instant Demo Login</button>
      </form>
    </div>
  </div>

  <main class="container" id="admin-main-content">
    
    <!-- Executive KPI Summary Cards -->
    <section class="admin-page__stats" aria-label="Key Business & Inventory Metrics">
      <div class="stats-grid">
        <div class="stat-card stat-card--gold">
          <div class="stat-card__label">Active Ensembles</div>
          <div class="stat-card__value" id="kpi-total-products">--</div>
          <div class="stat-card__sub" id="kpi-products-breakdown">Across Women, Men & Kids</div>
        </div>

        <div class="stat-card stat-card--burgundy">
          <div class="stat-card__label">Atelier Stock Valuation</div>
          <div class="stat-card__value" id="kpi-stock-valuation">--</div>
          <div class="stat-card__sub" id="kpi-units-count">Calculating units...</div>
        </div>

        <div class="stat-card stat-card--warning">
          <div class="stat-card__label">Stock Health & Alerts</div>
          <div class="stat-card__value" id="kpi-low-stock">--</div>
          <div class="stat-card__sub" id="kpi-stock-health-sub">Replenishment needed</div>
        </div>

        <div class="stat-card stat-card--gold">
          <div class="stat-card__label">Customer Orders & GMV</div>
          <div class="stat-card__value" id="kpi-total-orders">--</div>
          <div class="stat-card__sub" id="kpi-total-revenue">Gross: ₹0</div>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <nav class="admin-page__tabs" aria-label="Admin Navigation Tabs" role="tablist">
      <button type="button" class="tab-btn is-active" role="tab" aria-selected="true" aria-controls="pane-inventory" id="tab-inventory">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        Inventory & Stock Matrix
        <span class="tab-badge" id="badge-tab-inventory">0</span>
      </button>

      <button type="button" class="tab-btn" role="tab" aria-selected="false" aria-controls="pane-orders" id="tab-orders">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        Orders & Fulfillment Pipeline
        <span class="tab-badge" id="badge-tab-orders" style="background-color: #E3F2FD; color: #1565C0;">0</span>
      </button>

      <button type="button" class="tab-btn" role="tab" aria-selected="false" aria-controls="pane-studio" id="tab-studio">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        Atelier Product Studio
      </button>

      <button type="button" class="tab-btn" role="tab" aria-selected="false" aria-controls="pane-data" id="tab-data">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        Data & Codebase Sync
      </button>
    </nav>

    <!-- =========================================================================
         TAB 1: INVENTORY & STOCK MATRIX
         ========================================================================= -->
    <section class="tab-pane is-active" id="pane-inventory" role="tabpanel" aria-labelledby="tab-inventory">
      
      <!-- Toolbar -->
      <div class="admin-toolbar">
        <div class="admin-toolbar__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="inventory-search" placeholder="Filter by ensemble name, SKU, fabric, or occasion...">
        </div>

        <div class="admin-toolbar__filters" id="inventory-filters">
          <button type="button" class="filter-pill is-active" data-filter="all">All Ensembles</button>
          <button type="button" class="filter-pill" data-filter="low-stock">Low Stock (&lt; 3)</button>
          <button type="button" class="filter-pill" data-filter="out-of-stock">Out of Stock</button>
          <button type="button" class="filter-pill" data-filter="women">Women</button>
          <button type="button" class="filter-pill" data-filter="men">Men</button>
          <button type="button" class="filter-pill" data-filter="kids">Kids</button>
          <button type="button" class="action-btn" id="btn-restock-all" style="background-color: #E8F5E9; color: #2E7D32; border-color: #A5D6A7; font-weight: 600;" title="Restock all low-stock pieces to 10 units">
            ⚡ Quick Restock All Low
          </button>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="admin-table-container">
        <table class="admin-table" id="inventory-table" aria-label="Catalogue Inventory Listing">
          <thead>
            <tr>
              <th scope="col" style="width: 70px;">Ensemble</th>
              <th scope="col">Title & Provenance</th>
              <th scope="col">Category</th>
              <th scope="col">Retail Price</th>
              <th scope="col" style="width: 140px;">Stock Health</th>
              <th scope="col" style="width: 150px;">Inventory Control</th>
              <th scope="col">Status</th>
              <th scope="col" style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-tbody">
            <!-- Dynamic product rows populated via JavaScript -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- =========================================================================
         TAB 2: ORDERS & FULFILLMENT PIPELINE
         ========================================================================= -->
    <section class="tab-pane" id="pane-orders" role="tabpanel" aria-labelledby="tab-orders">
      
      <!-- Order Filter Toolbar -->
      <div class="admin-toolbar">
        <div class="admin-toolbar__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="orders-search" placeholder="Search by Order ID (VAS-2026-XXXX), patron name, phone, or city...">
        </div>

        <div class="admin-toolbar__filters" id="orders-filters">
          <button type="button" class="filter-pill is-active" data-status="all">All Orders</button>
          <button type="button" class="filter-pill" data-status="confirmed">Confirmed</button>
          <button type="button" class="filter-pill" data-status="quality_checked">Quality Checked</button>
          <button type="button" class="filter-pill" data-status="dispatched">Dispatched</button>
          <button type="button" class="filter-pill" data-status="delivered">Delivered</button>
          <button type="button" class="action-btn action-btn--primary" id="btn-create-order-toolbar">
            + New Test Order
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="admin-table-container">
        <table class="admin-table" id="orders-table" aria-label="Customer Orders Listing">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col">Date Placed</th>
              <th scope="col">Patron & Destination</th>
              <th scope="col">Ensembles</th>
              <th scope="col">Grand Total</th>
              <th scope="col" style="width: 190px;">Fulfillment Stage</th>
              <th scope="col" style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="orders-tbody">
            <!-- Dynamic order rows populated via JavaScript -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- =========================================================================
         TAB 3: ATELIER PRODUCT STUDIO (INTERACTIVE SPLIT-SCREEN)
         ========================================================================= -->
    <section class="tab-pane" id="pane-studio" role="tabpanel" aria-labelledby="tab-studio">
      <div class="studio-layout">
        
        <!-- Left: Studio Configurator Cards -->
        <div class="studio-form-col">
          <form id="studio-product-form" novalidate>
            
            <!-- Section 1: Title & Provenance -->
            <div class="studio-section-card">
              <h3 class="studio-section-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                1. Ensemble Identity & Provenance
              </h3>
              
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label for="studio-name" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.9rem;">Ensemble Title *</label>
                <input type="text" id="studio-name" placeholder="e.g., Royal Emerald Chanderi Silk Saree" value="Royal Emerald Chanderi Silk Saree" required style="width: 100%; padding: 10px 12px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.95rem;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                  <label for="studio-category" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Department *</label>
                  <select id="studio-category" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
                    <option value="women" selected>Women's Couture</option>
                    <option value="men">Men's Regalia</option>
                    <option value="kids">Children's Festive</option>
                  </select>
                </div>

                <div>
                  <label for="studio-subcategory" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Subcategory *</label>
                  <select id="studio-subcategory" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
                    <option value="saree" selected>Handloom Saree</option>
                    <option value="lehenga">Royal Lehenga</option>
                    <option value="salwar-suit">Anarkali / Suit</option>
                    <option value="sherwani">Sherwani / Bandhgala</option>
                    <option value="kurta-set">Kurta Churidar Set</option>
                    <option value="nehru-jacket">Nehru / Bandi Jacket</option>
                    <option value="dhoti-set">Dhoti Kurta Set</option>
                  </select>
                </div>

                <div>
                  <label for="studio-occasion" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Occasion *</label>
                  <select id="studio-occasion" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
                    <option value="Bridal & Wedding">Bridal & Wedding</option>
                    <option value="Festive Celebration" selected>Festive Celebration</option>
                    <option value="Cocktail & Evening">Cocktail & Evening</option>
                    <option value="Traditional Rituals">Traditional Rituals</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="studio-material" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Fabric & Craftsmanship Provenance *</label>
                <input type="text" id="studio-material" value="Pure Handloom Chanderi Silk with Certified Gold Zari Border" placeholder="e.g. 100% Pure Mulberry Silk & Silver Zari" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
              </div>
            </div>

            <!-- Section 2: Valuation & Inventory -->
            <div class="studio-section-card">
              <h3 class="studio-section-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 1 0-5H15M9.5 14.5H15a2.5 2.5 0 0 1 0 5H9.5"></path></svg>
                2. Pricing Valuation & Initial Stock
              </h3>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; align-items: start; margin-bottom: 1rem;">
                <div>
                  <label for="studio-price" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Retail Price (₹ INR) *</label>
                  <input type="number" id="studio-price" value="24500" min="500" step="100" required style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.95rem; font-weight: 600; color: #641E2B;">
                </div>

                <div>
                  <label for="studio-compare-price" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">MRP / Compare Price (₹)</label>
                  <input type="number" id="studio-compare-price" value="29500" min="500" step="100" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.95rem;">
                </div>

                <div>
                  <label for="studio-stock" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Initial Stock Units *</label>
                  <input type="number" id="studio-stock" value="6" min="1" max="99" required style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.95rem; font-weight: 600;">
                </div>
              </div>

              <!-- Live Discount Pill -->
              <div id="studio-discount-preview" style="font-size: 0.8rem; color: #2E7D32; font-weight: 600; background: #E8F5E9; padding: 6px 12px; border-radius: 4px; display: inline-flex; align-items: center; gap: 6px;">
                🎉 Patron Savings: ₹5,000 (17% off)
              </div>
            </div>

            <!-- Section 3: Aesthetics, Sizes & Imagery -->
            <div class="studio-section-card">
              <h3 class="studio-section-card__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                3. Sizing Matrix, Color & Visual Assets
              </h3>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                  <label for="studio-color-name" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Color Name & Swatch</label>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" id="studio-color-name" value="Emerald Green" style="flex: 1; padding: 9px 12px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
                    <input type="color" id="studio-color-hex" value="#1A5336" style="width: 44px; height: 42px; border: 1px solid #E4D8C7; border-radius: 4px; padding: 2px; cursor: pointer;">
                  </div>
                </div>

                <div>
                  <label for="studio-img-url" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Portrait Image URL *</label>
                  <input type="url" id="studio-img-url" value="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80" required style="width: 100%; padding: 9px 12px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.9rem;">
                </div>
              </div>

              <!-- Quick Presets -->
              <div style="margin-bottom: 1.25rem;">
                <span style="font-size: 0.75rem; color: #6B635B; font-weight: 600; text-transform: uppercase;">1-Click Image Presets:</span>
                <div class="preset-buttons-row">
                  <button type="button" class="preset-btn" data-url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80">Crimson Saree</button>
                  <button type="button" class="preset-btn" data-url="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=900&q=80">Bridal Lehenga</button>
                  <button type="button" class="preset-btn" data-url="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80">Royal Sherwani</button>
                  <button type="button" class="preset-btn" data-url="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80">Kids Festive</button>
                </div>
              </div>

              <!-- Size selector toggle chips -->
              <div style="margin-bottom: 1.25rem;">
                <label style="font-weight: 600; display: block; margin-bottom: 4px; font-size: 0.85rem;">Available Sizes (Click to toggle availability)</label>
                <div class="studio-size-chips" id="studio-size-chips">
                  <button type="button" class="size-chip-btn is-selected" data-size="Free Size (Unstitched Blouse)">Free Size</button>
                  <button type="button" class="size-chip-btn" data-size="XS">XS</button>
                  <button type="button" class="size-chip-btn is-selected" data-size="S">S</button>
                  <button type="button" class="size-chip-btn is-selected" data-size="M">M</button>
                  <button type="button" class="size-chip-btn is-selected" data-size="L">L</button>
                  <button type="button" class="size-chip-btn" data-size="XL">XL</button>
                  <button type="button" class="size-chip-btn" data-size="XXL">XXL</button>
                  <button type="button" class="size-chip-btn" data-size="Custom Tailored">Custom</button>
                </div>
              </div>

              <!-- Description & Merchandising Flags -->
              <div style="margin-bottom: 1.25rem;">
                <label for="studio-desc" style="font-weight: 600; display: block; margin-bottom: 5px; font-size: 0.85rem;">Editorial Craftsmanship Narrative</label>
                <textarea id="studio-desc" rows="3" style="width: 100%; padding: 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-family: inherit; font-size: 0.875rem;">Handcrafted by master artisans celebrating traditional Indian weaving techniques with pure silk and gold zari accents.</textarea>
              </div>

              <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; padding-top: 0.5rem; border-top: 1px solid #E4D8C7;">
                <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                  <input type="checkbox" id="studio-flag-featured" checked>
                  <span>Featured on Homepage</span>
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                  <input type="checkbox" id="studio-flag-new" checked>
                  <span>Mark as New Arrival</span>
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                  <input type="checkbox" id="studio-flag-bestseller">
                  <span>Mark as Bestseller</span>
                </label>
              </div>

            </div>

            <!-- Sticky Studio Publish Action Bar -->
            <div style="display: flex; gap: 1rem; align-items: center; background: #FAF6F0; border: 1px solid #C5A15B; padding: 1.25rem; border-radius: 6px;">
              <button type="submit" class="btn btn--primary" id="studio-publish-btn" style="padding: 12px 28px; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                ✨ Publish Ensemble to Live Website
              </button>
              <button type="reset" class="btn btn--outline" id="studio-reset-btn" style="cursor: pointer;">Reset</button>
            </div>

          </form>
        </div>

        <!-- Right: Live Storefront Card Preview Column -->
        <div class="studio-preview-col">
          <div class="preview-card-wrap">
            <div class="preview-header">
              <h4>Live Storefront Preview</h4>
              <span style="font-size: 0.75rem; color: #C5A15B; font-weight: 600; text-transform: uppercase;">Exact Replica</span>
            </div>

            <!-- Live Card Representation -->
            <div class="preview-card" id="studio-live-card">
              <div class="preview-img-container">
                <img id="preview-card-img" src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80" alt="Ensemble Preview" onerror="this.src='assets/images/products/fallback-women.svg'">
                <span class="preview-tag" id="preview-card-badge" style="position: absolute; top: 8px; left: 8px; background-color: #641E2B; color: #FFF; font-size: 0.7rem; padding: 2px 8px; border-radius: 2px; font-weight: 600;">NEW ARRIVAL</span>
              </div>
              <div class="preview-details">
                <div class="preview-cat" id="preview-card-cat" style="font-size: 0.75rem; text-transform: uppercase; color: #6B635B; margin-bottom: 2px;">WOMEN • SAREE</div>
                <div class="preview-name" id="preview-card-name">Royal Emerald Chanderi Silk Saree</div>
                <div class="preview-pricing" style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
                  <span class="preview-price" id="preview-card-price" style="font-weight: 700; color: #641E2B; font-size: 1.1rem;">₹24,500</span>
                  <span class="preview-mrp" id="preview-card-mrp" style="font-size: 0.85rem; text-decoration: line-through; color: #6B635B;">₹29,500</span>
                  <span class="preview-discount" id="preview-card-discount" style="font-size: 0.75rem; color: #2E7D32; font-weight: 600;">17% off</span>
                </div>
                <div style="font-size: 0.75rem; color: #2E7D32; margin-top: 6px; font-weight: 500;" id="preview-card-stock">
                  ● 6 units ready for bespoke dispatch
                </div>
              </div>
            </div>

            <div style="margin-top: 1rem; font-size: 0.75rem; color: #6B635B; line-height: 1.4;">
              💡 <em>This preview automatically updates in real-time as you type or adjust details.</em>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- =========================================================================
         TAB 4: DATA & CODEBASE SYNCHRONIZATION
         ========================================================================= -->
    <section class="tab-pane" id="pane-data" role="tabpanel" aria-labelledby="tab-data">
      <div class="studio-section-card" style="max-width: 800px; margin: 0 auto;">
        <h3 class="studio-section-card__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Catalogue & Codebase Synchronization
        </h3>
        <p style="font-size: 0.875rem; color: #6B635B; margin-bottom: 1.5rem; line-height: 1.5;">Export your live inventory, modified stock counts, and custom pieces to permanently commit them to your repository or create automated backups.</p>

        <div style="display: grid; gap: 1.5rem;">
          <div style="background: #FAF6F0; border: 1px solid #E4D8C7; border-radius: 4px; padding: 1.25rem;">
            <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: #641E2B; margin-bottom: 0.5rem;">Export Complete JavaScript Source Code</h4>
            <p style="font-size: 0.85rem; color: #6B635B; margin-bottom: 1rem;">Generate the updated ES Module code representing all current items and stock states for <code>js/modules/product-data.js</code>.</p>
            <button type="button" class="btn btn--primary" id="copy-js-export-btn" style="cursor: pointer;">Copy Full JS Code to Clipboard</button>
            <button type="button" class="btn btn--outline" id="download-json-btn" style="margin-left: 0.5rem; cursor: pointer;">Download JSON Backup</button>
          </div>

          <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 4px; padding: 1.25rem;">
            <h4 style="font-family: 'Cormorant Garamond', serif; font-size: 1.25rem; color: #9E1F2D; margin-bottom: 0.5rem;">Factory Defaults Reset</h4>
            <p style="font-size: 0.85rem; color: #6B635B; margin-bottom: 1rem;">Purges locally created custom items and stock count overrides, restoring the original artisan ensembles.</p>
            <button type="button" class="btn" id="reset-catalogue-btn" style="background-color: #9E1F2D; color: #FFFFFF; border: none; padding: 9px 18px; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">Reset Catalogue to Default Seeds</button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- =========================================================================
       LUXURY INVOICE & PACKING SLIP MODAL
       ========================================================================= -->
  <dialog id="order-details-modal" class="modal-dialog" aria-labelledby="order-modal-title" style="max-width: 680px; width: 92%; border: 1px solid #C5A15B; border-radius: 8px; padding: 0; box-shadow: 0 20px 50px rgba(0,0,0,0.3); background: #FFFFFF;">
    <div style="padding: 1.25rem 2rem; background-color: #641E2B; color: #FFFFFF; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h2 id="order-modal-title" style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin: 0; color: #FFFFFF;">Atelier Packing Slip & Invoice</h2>
        <span id="order-modal-id" style="font-size: 0.8rem; color: #DFC48A; font-family: monospace;"></span>
      </div>
      <button type="button" class="modal-close-btn" id="order-modal-close" aria-label="Close dialog" style="background: none; border: none; color: #FFFFFF; font-size: 1.75rem; cursor: pointer; line-height: 1;">&times;</button>
    </div>

    <div style="padding: 2rem; max-height: 72vh; overflow-y: auto;" id="order-modal-body">
      <!-- Populated dynamically via JS -->
    </div>

    <div style="padding: 1rem 2rem; background: #FAF6F0; border-top: 1px solid #E4D8C7; display: flex; justify-content: space-between; align-items: center;">
      <button type="button" class="btn btn--outline" id="print-invoice-btn" style="font-size: 0.85rem; cursor: pointer;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="margin-right: 4px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print Slip
      </button>
      <a href="#" id="modal-track-link" class="btn btn--primary" target="_blank" rel="noopener" style="font-size: 0.85rem;">Track in Courier Simulator ↗</a>
    </div>
  </dialog>

  <!-- Toast Notification Container -->
  <div id="toast-container" class="toast-container" role="region" aria-label="Notifications" style="position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 8px;"></div>

  <!-- Universal Standalone Script Engine (Runs on BOTH http:// and file://) -->
  <script>
    // Embedded Seed Products
    const INITIAL_PRODUCTS = ${JSON.stringify(seedProducts, null, 2)};
    const DEFAULT_DEMO_ORDERS = ${JSON.stringify(seedOrders, null, 2)};

    // Storage Keys
    const KEY_CUSTOM_PRODS = "vastraa_custom_products";
    const KEY_STOCK_OVERRIDES = "vastraa_stock_overrides";
    const KEY_ORDERS = "vastraa_orders_v1";
    const AUTH_KEY = "vastraa_admin_authenticated";

    // 1. Storage Helpers
    function getStoredCustomProducts() {
      try {
        const raw = localStorage.getItem(KEY_CUSTOM_PRODS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function getStockOverrides() {
      try {
        const raw = localStorage.getItem(KEY_STOCK_OVERRIDES);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    }

    function getOrders() {
      try {
        const raw = localStorage.getItem(KEY_ORDERS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      localStorage.setItem(KEY_ORDERS, JSON.stringify(DEFAULT_DEMO_ORDERS));
      return DEFAULT_DEMO_ORDERS;
    }

    function saveOrders(orders) {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent("vastraa:orders-updated"));
    }

    // Dynamic Master Catalog
    let PRODUCTS = [];

    function reloadProducts() {
      const custom = getStoredCustomProducts();
      const overrides = getStockOverrides();
      PRODUCTS = [...custom, ...INITIAL_PRODUCTS.map(p => ({ ...p }))];

      // Apply overrides
      for (const p of PRODUCTS) {
        if (overrides[p.id]) {
          if (typeof overrides[p.id].stockQuantity === "number") {
            p.stockQuantity = overrides[p.id].stockQuantity;
          }
          if (overrides[p.id].availability) {
            p.availability = overrides[p.id].availability;
          }
        }
      }
    }

    reloadProducts();

    // Price Formatter
    function formatPrice(paise) {
      if (typeof paise !== "number" || isNaN(paise)) return "₹0";
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(Math.round(paise / 100));
    }

    // Toast Helper
    function showToast(message, type = "info") {
      const container = document.getElementById("toast-container");
      if (!container) return;
      const el = document.createElement("div");
      el.className = "toast toast--" + type;
      el.style.cssText = "background: #292521; color: #FFF; padding: 12px 18px; border-radius: 6px; border-left: 4px solid #C5A15B; box-shadow: 0 4px 14px rgba(0,0,0,0.25); font-size: 0.875rem; animation: fadeIn 0.2s;";
      if (type === "success") el.style.borderLeftColor = "#2E7D32";
      if (type === "error") el.style.borderLeftColor = "#C62828";
      el.textContent = message;
      container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transition = "opacity 0.3s";
        setTimeout(() => el.remove(), 300);
      }, 3500);
    }

    // 2. Authentication Gate
    const loginGate = document.getElementById("login-gate");
    const loginForm = document.getElementById("login-gate-form");
    const passInput = document.getElementById("admin-passcode");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("admin-logout-btn");
    const quickDemoBtn = document.getElementById("quick-demo-login-btn");

    function checkAuth() {
      // Auto-unlock if already authorized in session
      const isAuth = sessionStorage.getItem(AUTH_KEY) === "true";
      if (!isAuth) {
        loginGate.style.display = "flex";
      } else {
        loginGate.style.display = "none";
        renderAllDashboard();
      }
    }

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = passInput.value.trim();
      if (code === "vastraa2026" || code === "admin") {
        sessionStorage.setItem(AUTH_KEY, "true");
        loginGate.style.display = "none";
        showToast("✨ Authenticated to Atelier Executive Suite", "success");
        renderAllDashboard();
      } else {
        loginError.style.display = "block";
      }
    });

    quickDemoBtn?.addEventListener("click", () => {
      sessionStorage.setItem(AUTH_KEY, "true");
      loginGate.style.display = "none";
      showToast("✨ 1-Click Demo Login Granted", "success");
      renderAllDashboard();
    });

    logoutBtn?.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_KEY);
      loginGate.style.display = "flex";
      showToast("Administrative console session locked", "info");
    });

    // 3. Tab Switching
    const tabButtons = document.querySelectorAll(".admin-page__tabs .tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("aria-controls");
        tabButtons.forEach(b => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        tabPanes.forEach(p => p.classList.remove("is-active"));

        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        const activePane = document.getElementById(targetId);
        if (activePane) activePane.classList.add("is-active");
      });
    });

    // 4. KPI Calculations
    function updateKPIs() {
      reloadProducts();
      const totalProds = PRODUCTS.length;
      const womenCount = PRODUCTS.filter(p => p.category === "women").length;
      const menCount = PRODUCTS.filter(p => p.category === "men").length;
      const kidsCount = PRODUCTS.filter(p => p.category === "kids").length;

      let totalValuationPaise = 0;
      let totalUnits = 0;
      let lowStockCount = 0;

      for (const p of PRODUCTS) {
        const qty = p.stockQuantity ?? 5;
        totalUnits += qty;
        totalValuationPaise += p.pricePaise * qty;
        if (qty < 3) lowStockCount++;
      }

      const orders = getOrders();
      const grossRevPaise = orders.reduce((sum, o) => sum + (o.summary?.totalPaise || 0), 0);

      document.getElementById("kpi-total-products").textContent = String(totalProds);
      document.getElementById("kpi-products-breakdown").textContent = \`\${womenCount} Women • \${menCount} Men • \${kidsCount} Kids\`;
      document.getElementById("badge-tab-inventory").textContent = String(totalProds);

      document.getElementById("kpi-stock-valuation").textContent = formatPrice(totalValuationPaise);
      document.getElementById("kpi-units-count").textContent = \`\${totalUnits} Handcrafted Pieces on Hand\`;

      document.getElementById("kpi-low-stock").textContent = String(lowStockCount);
      document.getElementById("kpi-stock-health-sub").textContent = lowStockCount > 0 ? \`\${lowStockCount} items need replenishment\` : "All ensembles well-stocked";

      document.getElementById("kpi-total-orders").textContent = String(orders.length);
      document.getElementById("kpi-total-revenue").textContent = \`Gross: \${formatPrice(grossRevPaise)}\`;
      document.getElementById("badge-tab-orders").textContent = String(orders.length);
    }

    // 5. Inventory Rendering & Stock Updates
    let currentInventoryFilter = "all";
    const inventorySearchInput = document.getElementById("inventory-search");

    function renderInventoryTable() {
      const tbody = document.getElementById("inventory-tbody");
      if (!tbody) return;

      const q = (inventorySearchInput?.value || "").toLowerCase().trim();

      const filtered = PRODUCTS.filter(p => {
        if (q) {
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.id.toLowerCase().includes(q);
          const matchFab = (p.material || "").toLowerCase().includes(q);
          const matchOcc = (p.occasion || "").toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchFab && !matchOcc) return false;
        }

        const qty = p.stockQuantity ?? 5;
        if (currentInventoryFilter === "low-stock") return qty > 0 && qty < 3;
        if (currentInventoryFilter === "out-of-stock") return qty === 0;
        if (currentInventoryFilter === "women") return p.category === "women";
        if (currentInventoryFilter === "men") return p.category === "men";
        if (currentInventoryFilter === "kids") return p.category === "kids";
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2.5rem; color: #6B635B;">No ensembles match your filter criteria.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(p => {
        const isCustom = p.id.startsWith("vas-custom-");
        const qty = p.stockQuantity ?? 5;
        let badgeStyle = "background: #E8F5E9; color: #2E7D32; border: 1px solid #A5D6A7;";
        let badgeLabel = "In Stock";
        let fillClass = "stock-bar-fill--healthy";
        let fillWidth = Math.min(100, (qty / 10) * 100);

        if (qty === 0) {
          badgeStyle = "background: #FFEBEE; color: #C62828; border: 1px solid #EF9A9A;";
          badgeLabel = "Out of Stock";
          fillClass = "stock-bar-fill--out";
          fillWidth = 0;
        } else if (qty < 3) {
          badgeStyle = "background: #FFF3E0; color: #E65100; border: 1px solid #FFCC80;";
          badgeLabel = "Low (" + qty + ")";
          fillClass = "stock-bar-fill--low";
          fillWidth = 25;
        }

        const thumb = p.image || "assets/images/products/fallback-women.svg";

        return \`
          <tr data-product-id="\${p.id}">
            <td>
              <img src="\${thumb}" alt="\${p.name}" class="product-thumb" loading="lazy" onerror="this.src='assets/images/products/fallback-women.svg'">
            </td>
            <td>
              <div class="product-meta">
                <span class="product-meta__title">
                  \${p.name}
                  \${isCustom ? '<span style="color: #C5A15B; font-size: 0.75rem; font-weight: 700;">(Atelier Custom)</span>' : ''}
                </span>
                <span class="product-meta__sku">\${p.id} • \${p.material ? p.material.slice(0, 35) + '...' : ''}</span>
              </div>
            </td>
            <td style="text-transform: capitalize; font-size: 0.85rem;">
              <span style="font-weight: 600;">\${p.category}</span><br>
              <span style="font-size: 0.75rem; color: #6B635B;">\${p.subcategory || 'Ensemble'}</span>
            </td>
            <td style="font-weight: 700; color: #641E2B; font-size: 0.95rem;">\${formatPrice(p.pricePaise)}</td>
            <td>
              <div class="stock-meter-cell">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600;">
                  <span>\${qty} units</span>
                  <span>\${qty >= 3 ? 'Healthy' : (qty > 0 ? 'Low' : 'Empty')}</span>
                </div>
                <div class="stock-bar-bg">
                  <div class="stock-bar-fill \${fillClass}" style="width: \${fillWidth}%;"></div>
                </div>
              </div>
            </td>
            <td>
              <div class="stock-control">
                <button type="button" class="btn-qty-minus" aria-label="Decrease stock">-</button>
                <input type="number" class="input-stock-qty" value="\${qty}" min="0" max="999">
                <button type="button" class="btn-qty-plus" aria-label="Increase stock">+</button>
                <button type="button" class="action-btn action-btn--primary btn-save-stock" title="Save Stock">Save</button>
              </div>
            </td>
            <td>
              <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; \${badgeStyle}">\${badgeLabel}</span>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <a href="product.html?slug=\${p.slug}" class="action-btn" target="_blank" rel="noopener" title="View on Live Storefront">View ↗</a>
              \${isCustom ? \`<button type="button" class="action-btn action-btn--danger btn-del-product" title="Delete Custom Item">Delete</button>\` : ''}
            </td>
          </tr>
        \`;
      }).join("");

      // Bind events to row buttons
      tbody.querySelectorAll("tr").forEach(row => {
        const prodId = row.dataset.productId;
        const input = row.querySelector(".input-stock-qty");
        const minusBtn = row.querySelector(".btn-qty-minus");
        const plusBtn = row.querySelector(".btn-qty-plus");
        const saveBtn = row.querySelector(".btn-save-stock");
        const delBtn = row.querySelector(".btn-del-product");

        minusBtn?.addEventListener("click", () => {
          let val = parseInt(input.value, 10) || 0;
          if (val > 0) input.value = val - 1;
        });

        plusBtn?.addEventListener("click", () => {
          let val = parseInt(input.value, 10) || 0;
          input.value = val + 1;
        });

        saveBtn?.addEventListener("click", () => {
          const newQty = parseInt(input.value, 10) || 0;
          const status = newQty > 0 ? "in_stock" : "out_of_stock";
          const overrides = getStockOverrides();
          overrides[prodId] = { stockQuantity: newQty, availability: status };
          localStorage.setItem(KEY_STOCK_OVERRIDES, JSON.stringify(overrides));
          showToast(\`Saved stock for \${prodId}: \${newQty} units\`, "success");
          updateKPIs();
          renderInventoryTable();
        });

        delBtn?.addEventListener("click", () => {
          if (confirm(\`Remove this custom ensemble permanently from the catalogue?\`)) {
            const list = getStoredCustomProducts().filter(p => p.id !== prodId);
            localStorage.setItem(KEY_CUSTOM_PRODS, JSON.stringify(list));
            showToast("Custom ensemble removed.", "info");
            updateKPIs();
            renderInventoryTable();
          }
        });
      });
    }

    // Filter pills
    document.querySelectorAll("#inventory-filters .filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#inventory-filters .filter-pill").forEach(p => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        currentInventoryFilter = pill.dataset.filter;
        renderInventoryTable();
      });
    });

    inventorySearchInput?.addEventListener("input", renderInventoryTable);

    // Quick restock all
    document.getElementById("btn-restock-all")?.addEventListener("click", () => {
      const overrides = getStockOverrides();
      let count = 0;
      for (const p of PRODUCTS) {
        const qty = p.stockQuantity ?? 5;
        if (qty < 3) {
          overrides[p.id] = { stockQuantity: 10, availability: "in_stock" };
          count++;
        }
      }
      localStorage.setItem(KEY_STOCK_OVERRIDES, JSON.stringify(overrides));
      showToast(\`⚡ Restocked \${count} low-stock ensembles to 10 units each!\`, "success");
      updateKPIs();
      renderInventoryTable();
    });

    // 6. Orders Management & Pipeline
    let currentOrderFilter = "all";
    const ordersSearchInput = document.getElementById("orders-search");

    function renderOrdersTable() {
      const tbody = document.getElementById("orders-tbody");
      if (!tbody) return;

      const orders = getOrders();
      const q = (ordersSearchInput?.value || "").toLowerCase().trim();

      const filtered = orders.filter(o => {
        if (q) {
          const matchId = o.orderId.toLowerCase().includes(q);
          const matchName = (o.customer?.fullName || "").toLowerCase().includes(q);
          const matchPhone = (o.customer?.phone || "").toLowerCase().includes(q);
          const matchCity = (o.customer?.city || "").toLowerCase().includes(q);
          if (!matchId && !matchName && !matchPhone && !matchCity) return false;
        }

        if (currentOrderFilter === "all") return true;
        return o.status === currentOrderFilter;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: #6B635B;">No customer orders found.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(o => {
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Today";
        const totalStr = o.summary?.formattedTotal || formatPrice(o.summary?.totalPaise || 0);
        const itemsCount = (o.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
        const firstItem = o.items?.[0]?.name || "Heritage Ensemble";

        return \`
          <tr data-order-id="\${o.orderId}">
            <td>
              <strong style="color: #641E2B; font-family: monospace; font-size: 0.95rem;">\${o.orderId}</strong>
            </td>
            <td style="font-size: 0.85rem; color: #6B635B;">\${dateStr}</td>
            <td>
              <div style="font-weight: 600; color: #292521;">\${o.customer?.fullName || 'Patron'}</div>
              <div style="font-size: 0.775rem; color: #6B635B;">\${o.customer?.city || ''}, \${o.customer?.state || 'India'} • \${o.customer?.phone || ''}</div>
            </td>
            <td>
              <div style="font-size: 0.85rem;">\${firstItem}</div>
              <div style="font-size: 0.75rem; color: #6B635B;">\${itemsCount} item(s) total</div>
            </td>
            <td style="font-weight: 700; color: #641E2B; font-size: 1rem;">\${totalStr}</td>
            <td>
              <select class="order-status-select" data-order-id="\${o.orderId}" style="padding: 6px 10px; border: 1px solid #E4D8C7; border-radius: 4px; font-size: 0.825rem; font-weight: 600; background: #FFFFFF; color: #292521; cursor: pointer;">
                <option value="confirmed" \${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="quality_checked" \${o.status === 'quality_checked' ? 'selected' : ''}>Quality Checked</option>
                <option value="dispatched" \${o.status === 'dispatched' ? 'selected' : ''}>Dispatched & In Transit</option>
                <option value="delivered" \${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button type="button" class="action-btn btn-view-invoice" data-order-id="\${o.orderId}" title="View Packing Slip">Slip / Invoice</button>
            </td>
          </tr>
        \`;
      }).join("");

      // Bind status changes
      tbody.querySelectorAll(".order-status-select").forEach(sel => {
        sel.addEventListener("change", (e) => {
          const ordId = sel.dataset.orderId;
          const newStatus = e.target.value;
          const allOrders = getOrders();
          const target = allOrders.find(o => o.orderId === ordId);
          if (target) {
            target.status = newStatus;
            target.statusText = newStatus === "confirmed" ? "Order Confirmed" : (newStatus === "quality_checked" ? "Quality Checked & Packaged" : (newStatus === "dispatched" ? "Dispatched & In Transit" : "Delivered"));
            saveOrders(allOrders);
            showToast(\`Updated order \${ordId} status to '\${target.statusText}'\`, "success");
            updateKPIs();
          }
        });
      });

      // Bind modal views
      tbody.querySelectorAll(".btn-view-invoice").forEach(btn => {
        btn.addEventListener("click", () => {
          const ordId = btn.dataset.orderId;
          openOrderModal(ordId);
        });
      });
    }

    // Filter pills for orders
    document.querySelectorAll("#orders-filters .filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#orders-filters .filter-pill").forEach(p => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        currentOrderFilter = pill.dataset.status;
        renderOrdersTable();
      });
    });

    ordersSearchInput?.addEventListener("input", renderOrdersTable);

    // Create Demo Order Helper
    function createSimulatedOrder() {
      const allOrders = getOrders();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const newId = \`VAS-2026-\${randNum}\`;

      const demoCusts = [
        { name: "Pooja Hegde", city: "Mumbai", phone: "+91 98200 11223", state: "Maharashtra" },
        { name: "Devika Chauhan", city: "Udaipur", phone: "+91 97840 55667", state: "Rajasthan" },
        { name: "Siddharth Malhotra", city: "New Delhi", phone: "+91 99100 88990", state: "Delhi" },
        { name: "Kavita Ramaswamy", city: "Chennai", phone: "+91 94440 22334", state: "Tamil Nadu" }
      ];
      const cust = demoCusts[Math.floor(Math.random() * demoCusts.length)];
      const prod = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

      const newOrder = {
        orderId: newId,
        customer: {
          fullName: cust.name,
          email: cust.name.toLowerCase().replace(/\\s+/g, ".") + "@example.com",
          phone: cust.phone,
          address: "Royal Heritage Enclave, Sector 4",
          city: cust.city,
          state: cust.state,
          postalCode: "400050"
        },
        items: [
          {
            productId: prod.id,
            name: prod.name,
            size: prod.availableSizes?.[0] || "M",
            color: prod.availableColors?.[0]?.name || "Crimson",
            quantity: 1,
            pricePaise: prod.pricePaise
          }
        ],
        summary: {
          subtotalPaise: prod.pricePaise,
          discountPaise: 0,
          shippingPaise: 0,
          totalPaise: prod.pricePaise,
          formattedTotal: formatPrice(prod.pricePaise)
        },
        paymentMethod: "Prepaid UPI",
        status: "confirmed",
        statusText: "Order Confirmed",
        timeline: [
          { step: "Order Confirmed", date: "Just now", completed: true },
          { step: "Quality Checked", date: "Scheduled", completed: false },
          { step: "Dispatched", date: "Scheduled", completed: false },
          { step: "Delivered", date: "Pending", completed: false }
        ],
        estimatedDelivery: "3 Business Days",
        trackingNumber: "BD-" + Math.floor(10000000 + Math.random() * 90000000) + "IN",
        createdAt: new Date().toISOString()
      };

      allOrders.unshift(newOrder);
      saveOrders(allOrders);
      showToast(\`🎉 New Simulated Order \${newId} generated for \${cust.name}!\`, "success");
      updateKPIs();
      renderOrdersTable();

      // Switch to orders tab
      document.getElementById("tab-orders")?.click();
    }

    document.getElementById("btn-quick-create-demo-order")?.addEventListener("click", createSimulatedOrder);
    document.getElementById("btn-create-order-toolbar")?.addEventListener("click", createSimulatedOrder);

    // Modal packing slip
    const orderModal = document.getElementById("order-details-modal");
    const orderModalClose = document.getElementById("order-modal-close");
    const printInvoiceBtn = document.getElementById("print-invoice-btn");

    function openOrderModal(orderId) {
      const orders = getOrders();
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return;

      document.getElementById("order-modal-id").textContent = order.orderId;
      const modalBody = document.getElementById("order-modal-body");
      const trackLink = document.getElementById("modal-track-link");

      if (trackLink) {
        trackLink.href = \`track-order.html?orderId=\${order.orderId}\`;
      }

      const itemsHtml = (order.items || []).map(item => \`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #EFE7DC;">
          <div>
            <strong style="color: #292521;">\${item.name}</strong>
            <div style="font-size: 0.8rem; color: #6B635B;">Size: \${item.size || 'M'} • Color: \${item.color || 'Standard'} • Qty: \${item.quantity || 1}</div>
          </div>
          <span style="font-weight: 700; color: #641E2B;">\${formatPrice((item.pricePaise || 0) * (item.quantity || 1))}</span>
        </div>
      \`).join("");

      modalBody.innerHTML = \`
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #6B635B; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Dispatch Destination</h4>
          <div style="background: #FAF6F0; border: 1px solid #E4D8C7; border-radius: 4px; padding: 1rem; font-size: 0.9rem;">
            <strong>\${order.customer?.fullName}</strong><br>
            \${order.customer?.address}<br>
            \${order.customer?.city}, \${order.customer?.state} - \${order.customer?.postalCode}<br>
            Phone: \${order.customer?.phone} • Email: \${order.customer?.email}
          </div>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #6B635B; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Curated Ensembles</h4>
          <div style="background: #FFFFFF; border: 1px solid #E4D8C7; border-radius: 4px; padding: 0.5rem 1rem;">
            \${itemsHtml}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; padding: 1rem 0; color: #641E2B;">
          <span>Invoice Grand Total</span>
          <span>\${order.summary?.formattedTotal || formatPrice(order.summary?.totalPaise || 0)}</span>
        </div>
      \`;

      orderModal?.showModal();
    }

    orderModalClose?.addEventListener("click", () => orderModal.close());
    printInvoiceBtn?.addEventListener("click", () => window.print());

    // 7. Atelier Product Studio Live Updates
    const studioForm = document.getElementById("studio-product-form");
    const studioNameInput = document.getElementById("studio-name");
    const studioCatSelect = document.getElementById("studio-category");
    const studioSubcatSelect = document.getElementById("studio-subcategory");
    const studioPriceInput = document.getElementById("studio-price");
    const studioComparePriceInput = document.getElementById("studio-compare-price");
    const studioStockInput = document.getElementById("studio-stock");
    const studioImgUrlInput = document.getElementById("studio-img-url");
    const studioFlagNew = document.getElementById("studio-flag-new");

    const previewCardName = document.getElementById("preview-card-name");
    const previewCardCat = document.getElementById("preview-card-cat");
    const previewCardPrice = document.getElementById("preview-card-price");
    const previewCardMrp = document.getElementById("preview-card-mrp");
    const previewCardDiscount = document.getElementById("preview-card-discount");
    const previewCardImg = document.getElementById("preview-card-img");
    const previewCardStock = document.getElementById("preview-card-stock");

    function updateStudioLivePreview() {
      const name = studioNameInput?.value.trim() || "Handcrafted Heritage Ensemble";
      const cat = (studioCatSelect?.value || "women").toUpperCase();
      const subcat = (studioSubcatSelect?.value || "saree").toUpperCase();
      const priceRupees = parseFloat(studioPriceInput?.value) || 0;
      const comparePriceRupees = parseFloat(studioComparePriceInput?.value) || 0;
      const stock = parseInt(studioStockInput?.value, 10) || 5;
      const imgUrl = studioImgUrlInput?.value.trim() || "assets/images/products/fallback-women.svg";

      if (previewCardName) previewCardName.textContent = name;
      if (previewCardCat) previewCardCat.textContent = \`\${cat} • \${subcat}\`;
      if (previewCardPrice) previewCardPrice.textContent = formatPrice(priceRupees * 100);

      if (comparePriceRupees > priceRupees) {
        if (previewCardMrp) {
          previewCardMrp.style.display = "inline";
          previewCardMrp.textContent = formatPrice(comparePriceRupees * 100);
        }
        if (previewCardDiscount) {
          const discount = Math.round(((comparePriceRupees - priceRupees) / comparePriceRupees) * 100);
          previewCardDiscount.style.display = "inline";
          previewCardDiscount.textContent = \`\${discount}% off\`;
        }
      } else {
        if (previewCardMrp) previewCardMrp.style.display = "none";
        if (previewCardDiscount) previewCardDiscount.style.display = "none";
      }

      if (previewCardImg && imgUrl) {
        previewCardImg.src = imgUrl;
      }
      if (previewCardStock) {
        previewCardStock.textContent = \`● \${stock} units ready for bespoke dispatch\`;
      }
    }

    [studioNameInput, studioCatSelect, studioSubcatSelect, studioPriceInput, studioComparePriceInput, studioStockInput, studioImgUrlInput].forEach(inp => {
      inp?.addEventListener("input", updateStudioLivePreview);
      inp?.addEventListener("change", updateStudioLivePreview);
    });

    // Preset buttons
    document.querySelectorAll(".preset-buttons-row .preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        studioImgUrlInput.value = btn.dataset.url;
        updateStudioLivePreview();
      });
    });

    // Size chips toggle
    document.querySelectorAll("#studio-size-chips .size-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("is-selected");
      });
    });

    // Studio Publish Submission
    studioForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = studioNameInput.value.trim();
      const category = studioCatSelect.value;
      const subcategory = studioSubcatSelect.value;
      const occasion = document.getElementById("studio-occasion").value;
      const priceRupees = parseFloat(studioPriceInput.value) || 0;
      const comparePriceRupees = parseFloat(studioComparePriceInput.value) || 0;
      const stock = parseInt(studioStockInput.value, 10) || 5;
      const colorName = document.getElementById("studio-color-name").value.trim();
      const colorHex = document.getElementById("studio-color-hex").value;
      const material = document.getElementById("studio-material").value.trim();
      const imageUrl = studioImgUrlInput.value.trim();
      const desc = document.getElementById("studio-desc").value.trim();
      const isFeatured = document.getElementById("studio-flag-featured").checked;
      const isNew = studioFlagNew.checked;
      const isBestseller = document.getElementById("studio-flag-bestseller").checked;

      if (!name || priceRupees <= 0 || !imageUrl) {
        showToast("Please provide ensemble title, price, and image URL", "error");
        return;
      }

      const selectedSizes = Array.from(document.querySelectorAll("#studio-size-chips .size-chip-btn.is-selected")).map(b => b.dataset.size);
      if (selectedSizes.length === 0) selectedSizes.push("Free Size (Unstitched Blouse)");

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const uniqueId = \`vas-custom-\${Date.now().toString().slice(-6)}\`;

      const newProduct = {
        id: uniqueId,
        slug: slug,
        name: name,
        category: category,
        subcategory: subcategory,
        description: desc,
        pricePaise: Math.round(priceRupees * 100),
        compareAtPricePaise: comparePriceRupees > 0 ? Math.round(comparePriceRupees * 100) : null,
        currency: "INR",
        image: imageUrl,
        gallery: [imageUrl],
        fallbackImage: category === "women" ? "assets/images/products/fallback-women.svg" : (category === "men" ? "assets/images/products/fallback-men.svg" : "assets/images/products/fallback-kids.svg"),
        availableSizes: selectedSizes,
        availableColors: [{ name: colorName, hex: colorHex }],
        availability: stock > 0 ? "in_stock" : "out_of_stock",
        stockQuantity: stock,
        material: material,
        careInstructions: "Strictly dry clean only. Store wrapped in pure unbleached muslin in a cedar trunk.",
        occasion: occasion,
        featured: isFeatured,
        newArrival: isNew,
        bestseller: isBestseller,
        createdAt: new Date().toISOString()
      };

      const customList = getStoredCustomProducts();
      customList.unshift(newProduct);
      localStorage.setItem(KEY_CUSTOM_PRODS, JSON.stringify(customList));

      showToast(\`✨ Successfully published '\${name}' to live store!\`, "success");
      updateKPIs();
      renderInventoryTable();

      // Switch to Inventory Matrix tab
      document.getElementById("tab-inventory")?.click();
    });

    // 8. Codebase & Data Synchronization
    document.getElementById("copy-js-export-btn")?.addEventListener("click", () => {
      const code = \`export const PRODUCTS = \${JSON.stringify(PRODUCTS, null, 2)};\`;
      navigator.clipboard.writeText(code).then(() => {
        showToast("Complete JavaScript catalogue code copied to clipboard!", "success");
      }).catch(() => {
        showToast("Please copy manually from browser console", "info");
        console.log(code);
      });
    });

    document.getElementById("download-json-btn")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(PRODUCTS, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", \`vastraa-catalogue-\${Date.now()}.json\`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Catalogue JSON downloaded successfully", "success");
    });

    document.getElementById("reset-catalogue-btn")?.addEventListener("click", () => {
      if (confirm("Restore catalogue to initial pristine seed? Any custom created pieces and stock count overrides will be reset.")) {
        localStorage.removeItem(KEY_CUSTOM_PRODS);
        localStorage.removeItem(KEY_STOCK_OVERRIDES);
        reloadProducts();
        showToast("Catalogue restored to factory defaults", "info");
        updateKPIs();
        renderInventoryTable();
      }
    });

    // 9. Bootstrap Dashboard
    function renderAllDashboard() {
      updateKPIs();
      renderInventoryTable();
      renderOrdersTable();
      updateStudioLivePreview();
    }

    // Auto-mount
    window.checkAuth = checkAuth;
    window.renderAllDashboard = renderAllDashboard;
    window.PRODUCTS = PRODUCTS;
    checkAuth();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT_DIR, "admin.html"), htmlContent, "utf8");
console.log("Successfully generated standalone admin.html with embedded CSS and universal execution engine!");
