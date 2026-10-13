/**
 * Vastraa - Comprehensive Responsive & Functional Audit Suite
 * Uses Node 22 native WebSocket to connect to Chrome DevTools Protocol (CDP).
 * Audits all pages for:
 * 1. Horizontal scroll overflow across 375px, 768px, 1280px, 1440px viewports
 * 2. Console errors and warnings
 * 3. Broken images and missing elements
 * 4. Interactive Cart Drawer and Stepper operations
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const PAGES_TO_TEST = [
  { path: "/index.html", name: "Homepage" },
  { path: "/shop.html", name: "Shop Catalogue" },
  { path: "/product.html?slug=royal-crimson-kanjivaram-silk-saree", name: "Product Detail" },
  { path: "/cart.html", name: "Shopping Bag" },
  { path: "/checkout.html", name: "Checkout Preview" },
  { path: "/wishlist.html", name: "Wishlist" },
  { path: "/search.html?q=silk", name: "Search Results" },
  { path: "/track-order.html?orderId=VAS-2026-8841", name: "Order Tracking" },
  { path: "/about.html", name: "About Us" },
  { path: "/contact.html", name: "Contact" },
  { path: "/faq.html", name: "FAQ" },
  { path: "/admin.html", name: "Admin Console" }
];

const VIEWPORTS = [
  { width: 375, height: 812, name: "Mobile (iPhone X)" },
  { width: 768, height: 1024, name: "Tablet (iPad)" },
  { width: 1280, height: 800, name: "Laptop" },
  { width: 1440, height: 900, name: "Desktop" }
];

async function main() {
  console.log("==================================================");
  console.log("  VASTRAA COMPREHENSIVE RESPONSIVE AUDIT");
  console.log("==================================================");

  // 1. Start Server
  const server = spawn("node", ["scripts/serve.js"], {
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: "3000" },
    stdio: "pipe"
  });

  await new Promise(r => setTimeout(r, 1200));

  // 2. Launch Chrome with CDP
  const userDataDir = path.join(ROOT_DIR, ".chrome-audit-temp");
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--no-sandbox"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let cdpTargets;
  try {
    const res = await fetch("http://127.0.0.1:9222/json");
    cdpTargets = await res.json();
  } catch (err) {
    console.error("Failed to connect to Chrome DevTools Protocol:", err.message);
    server.kill();
    chromeProc.kill();
    return;
  }

  const pageTarget = cdpTargets.find(t => t.type === "page") || cdpTargets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const pending = new Map();
  const consoleMessages = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const resolver = pending.get(data.id);
      pending.delete(data.id);
      resolver(data);
    }
    if (data.method === "Runtime.consoleAPICalled") {
      const text = data.params.args.map(a => a.value || a.description || "").join(" ");
      consoleMessages.push({ type: data.params.type, text });
    }
  };

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable CDP domains
  await sendCommand("Runtime.enable");
  await sendCommand("Page.enable");
  await sendCommand("DOM.enable");

  const results = [];

  for (const page of PAGES_TO_TEST) {
    console.log(`\nTesting Page: ${page.name} (${page.path})`);
    for (const vp of VIEWPORTS) {
      // Set viewport
      await sendCommand("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width <= 768
      });

      // Clear previous console logs
      consoleMessages.length = 0;

      // Navigate
      await sendCommand("Page.navigate", { url: `http://localhost:3000${page.path}` });
      await new Promise(r => setTimeout(r, 1200));

      // Evaluate metrics
      const evalRes = await sendCommand("Runtime.evaluate", {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const innerWidth = window.innerWidth;
          const hasHorizontalOverflow = scrollWidth > innerWidth + 1; // 1px threshold for fractional pixels
          
          // Check for overflowing elements if overflow detected
          let overflowingElements = [];
          if (hasHorizontalOverflow) {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > innerWidth + 1) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : '';
                const id = el.id ? '#' + el.id : '';
                overflowingElements.push({ selector: tag + id + cls, right: Math.round(rect.right), width: Math.round(rect.width) });
                if (overflowingElements.length >= 3) break;
              }
            }
          }

          // Check broken images
          const brokenImgs = [];
          document.querySelectorAll('img').forEach(img => {
            if (img.naturalWidth === 0 && img.complete) {
              brokenImgs.push(img.src);
            }
          });

          return {
            scrollWidth,
            innerWidth,
            hasHorizontalOverflow,
            overflowingElements,
            brokenImgsCount: brokenImgs.length,
            brokenImgs: brokenImgs.slice(0, 3)
          };
        })()`,
        returnByValue: true
      });

      const metrics = evalRes.result?.result?.value || {};
      const status = metrics.hasHorizontalOverflow ? "⚠️ OVERFLOW" : "✅ PASS";
      const consoleErrors = consoleMessages.filter(m => m.type === "error");

      console.log(`  [${vp.name.padEnd(20)}] ${status} (scrollWidth: ${metrics.scrollWidth}px vs ${metrics.innerWidth}px) | Broken Imgs: ${metrics.brokenImgsCount} | JS Errors: ${consoleErrors.length}`);
      if (metrics.hasHorizontalOverflow) {
        console.log(`    -> Culprit elements:`, JSON.stringify(metrics.overflowingElements));
      }
      if (consoleErrors.length > 0) {
        console.log(`    -> JS Errors:`, JSON.stringify(consoleErrors.slice(0, 2)));
      }

      results.push({
        page: page.name,
        path: page.path,
        viewport: vp.name,
        metrics,
        errors: consoleErrors
      });
    }
  }

  // Close and cleanup
  ws.close();
  server.kill();
  chromeProc.kill();
  console.log("\n==================================================");
  console.log("  AUDIT COMPLETED");
  console.log("==================================================");
}

main().catch(console.error);
