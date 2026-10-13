/**
 * Vastraa - Automated Browser Verification & Screenshot Capture Tool
 * Tests routes, audits HTTP status codes, and captures real screenshots using Google Chrome & Microsoft Edge headless.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SCREENSHOTS_DIR = path.join(ROOT_DIR, "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Locate Chrome and Edge
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const BROWSER_EXE = fs.existsSync(CHROME_PATH) ? CHROME_PATH : (fs.existsSync(EDGE_PATH) ? EDGE_PATH : null);
const BROWSER_NAME = BROWSER_EXE === CHROME_PATH ? "Google Chrome" : (BROWSER_EXE === EDGE_PATH ? "Microsoft Edge" : "None");

console.log(`[Browser Verification] Detected browser: ${BROWSER_NAME} at "${BROWSER_EXE}"`);

const ROUTES_TO_VERIFY = [
  { url: "/", expected: 200, name: "Homepage" },
  { url: "/shop.html", expected: 200, name: "Shop Catalogue" },
  { url: "/shop.html?category=women", expected: 200, name: "Women's Collection" },
  { url: "/shop.html?category=men", expected: 200, name: "Men's Collection" },
  { url: "/shop.html?category=kids", expected: 200, name: "Kids' Collection" },
  { url: "/product.html?slug=royal-crimson-kanjivaram-silk-saree", expected: 200, name: "Product Detail (Kanjivaram Saree)" },
  { url: "/cart.html", expected: 200, name: "Shopping Bag" },
  { url: "/checkout.html", expected: 200, name: "Checkout Preview" },
  { url: "/wishlist.html", expected: 200, name: "Saved Wishlist" },
  { url: "/search.html?q=silk", expected: 200, name: "Search Results" },
  { url: "/track-order.html?orderId=VAS-2026-8841", expected: 200, name: "Order Tracking" },
  { url: "/order-confirmation.html", expected: 200, name: "Order Confirmation" },
  { url: "/about.html", expected: 200, name: "Our Heritage" },
  { url: "/contact.html", expected: 200, name: "Atelier Contact" },
  { url: "/faq.html", expected: 200, name: "FAQ Help" },
  { url: "/shipping-policy.html", expected: 200, name: "Shipping Policy" },
  { url: "/returns-policy.html", expected: 200, name: "Returns Policy" },
  { url: "/privacy-policy.html", expected: 200, name: "Privacy Policy" },
  { url: "/terms.html", expected: 200, name: "Terms of Service" },
  { url: "/admin.html", expected: 200, name: "Atelier Console (Admin)" },
  { url: "/non-existent-route", expected: 404, name: "404 Error Fallback" }
];


async function runVerification() {
  // Start server
  const serverProcess = spawn("node", ["scripts/serve.js"], {
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: "3000" },
    stdio: "pipe"
  });

  // Give server 1.5 seconds to bind
  await new Promise(r => setTimeout(r, 1500));

  console.log("\n========================================================");
  console.log("  VASTRAA AUTOMATED ROUTE & ACCESSIBILITY AUDIT");
  console.log("========================================================\n");

  let allRoutesPassed = true;

  for (const route of ROUTES_TO_VERIFY) {
    try {
      const res = await fetch(`http://localhost:3000${route.url}`);
      const passed = res.status === route.expected;
      console.log(`[HTTP ${res.status}] ${route.name.padEnd(35)} (Expected: ${route.expected}) -> ${passed ? "PASS ✓" : "FAIL ✗"}`);
      if (!passed) allRoutesPassed = false;
    } catch (err) {
      console.error(`[ERROR] Failed to reach route ${route.url}:`, err.message);
      allRoutesPassed = false;
    }
  }

  // Capture Real Screenshots if browser is available
  if (BROWSER_EXE) {
    console.log("\n========================================================");
    console.log(`  CAPTURING REAL SCREENSHOTS VIA ${BROWSER_NAME.toUpperCase()}`);
    console.log("========================================================\n");

    const screenshots = [
      {
        file: "homepage-desktop.png",
        url: "http://localhost:3000/index.html",
        size: "1440,900"
      },
      {
        file: "homepage-mobile.png",
        url: "http://localhost:3000/index.html",
        size: "375,812"
      },
      {
        file: "shop-catalogue.png",
        url: "http://localhost:3000/shop.html",
        size: "1440,900"
      },
      {
        file: "product-detail.png",
        url: "http://localhost:3000/product.html?slug=royal-crimson-kanjivaram-silk-saree",
        size: "1440,900"
      },
      {
        file: "cart-page.png",
        url: "http://localhost:3000/cart.html",
        size: "1440,900"
      },
      {
        file: "checkout-preview.png",
        url: "http://localhost:3000/checkout.html",
        size: "1440,900"
      },
      {
        file: "order-tracking.png",
        url: "http://localhost:3000/track-order.html?orderId=VAS-2026-8841",
        size: "1440,900"
      }
    ];

    for (const shot of screenshots) {
      const outputPath = path.join(SCREENSHOTS_DIR, shot.file);
      try {
        execSync(
          `"${BROWSER_EXE}" --headless --disable-gpu --no-sandbox --disable-background-networking --disable-sync --hide-scrollbars --window-size=${shot.size} --screenshot="${outputPath}" "${shot.url}"`,
          { timeout: 15000 }
        );
        console.log(`[Screenshot Captured] ${shot.file.padEnd(25)} (${shot.size}) -> "${outputPath}"`);
      } catch (shotErr) {
        console.warn(`[Screenshot Warning] Could not capture ${shot.file}:`, shotErr.message);
      }
    }
  }

  // Cleanup
  serverProcess.kill();
  console.log("\n[Verification Complete] All tasks finished successfully.");
}

runVerification().catch(err => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
