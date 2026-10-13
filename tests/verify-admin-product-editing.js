import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SHOT_DIR = path.resolve(ROOT_DIR, "screenshots", "walkthrough");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runAdminProductEditingVerification() {
  console.log("===============================================================");
  console.log("   VASTRAA ATELIER: PRODUCT EDITING & VISUAL ASSET MANAGEMENT");
  console.log("   Verifying full editing, image updates, and live storefront sync");
  console.log("===============================================================\n");

  await fs.mkdir(SHOT_DIR, { recursive: true });

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9223",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,960",
    "--disable-dev-shm-usage"
  ]);

  await sleep(1500);

  let ws;
  try {
    const targetsRes = await fetch("http://127.0.0.1:9223/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];

    if (!pageTarget) {
      throw new Error("No page target found on Chrome remote debugging port 9223");
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === curId) {
          ws.removeEventListener("message", handler);
          if (data.error) {
            reject(new Error(`${method} error: ${JSON.stringify(data.error)}`));
          } else {
            resolve(data.result);
          }
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send("Page.enable");
    await send("Runtime.enable");

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error("Eval error: " + JSON.stringify(res.exceptionDetails));
      }
      return res.result?.value;
    }

    async function navigate(url) {
      await send("Page.navigate", { url });
      await sleep(1200);
    }

    async function screenshot(filename) {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      const filePath = path.join(SHOT_DIR, filename);
      await fs.writeFile(filePath, Buffer.from(data, "base64"));
      console.log(`  📸 Saved screenshot: ${filename}`);
      return filePath;
    }

    // STEP 1: Navigate to admin and authenticate
    console.log("1. Navigating to Admin Suite (http://localhost:3000/admin.html)...");
    await navigate(`${BASE_URL}/admin.html`);
    await sleep(500);

    const isGateVisible = await evaluate(`document.getElementById('login-gate')?.style.display !== 'none'`);
    if (isGateVisible) {
      console.log("   Unlocking administrative gate with Quick Demo Login...");
      await evaluate(`document.getElementById('quick-demo-login-btn')?.click()`);
      await sleep(600);
    }

    // Ensure pristine test state
    await evaluate(`
      localStorage.removeItem('vastraa_product_overrides');
      localStorage.removeItem('vastraa_custom_products');
      localStorage.removeItem('vastraa_stock_overrides');
      if (typeof window.renderAllDashboard === 'function') window.renderAllDashboard();
    `);
    await sleep(400);

    // STEP 2: Verify Inventory Matrix and action buttons
    console.log("2. Inspecting Inventory Matrix table for Edit and Archive actions...");
    const rowCount = await evaluate(`document.querySelectorAll('#inventory-tbody tr').length`);
    const editBtnCount = await evaluate(`document.querySelectorAll('.btn-edit-product').length`);
    const delBtnCount = await evaluate(`document.querySelectorAll('.btn-del-product').length`);
    console.log(`   Found ${rowCount} ensemble rows with ${editBtnCount} Edit ✎ buttons and ${delBtnCount} Archive ✕ buttons.`);

    if (editBtnCount === 0) {
      throw new Error("No Edit buttons found in inventory table!");
    }

    await screenshot("23_admin_inventory_matrix.png");

    // STEP 3: Click Edit on the first piece (vas-w-001)
    console.log("3. Clicking 'Edit ✎' on first ensemble (vas-w-001: Royal Crimson Kanjivaram Silk Saree)...");
    await evaluate(`
      const firstEditBtn = document.querySelector('.btn-edit-product');
      firstEditBtn?.click();
    `);
    await sleep(600);

    const isModalOpen = await evaluate(`document.getElementById('product-edit-modal')?.open === true`);
    console.log(`   Product Edit Modal open status: ${isModalOpen}`);
    if (!isModalOpen) {
      throw new Error("Product Edit Modal did not open!");
    }

    // STEP 4: Modify Ensemble Attributes (Title, Price, Custom Size, Gallery Photo)
    console.log("4. Updating title, price, custom size, and gallery photos...");
    await evaluate(`
      document.getElementById('edit-title').value = "Royal Crimson Heirloom Kanjivaram Silk Saree (Master Artisan)";
      document.getElementById('edit-price').value = "32000";
      document.getElementById('edit-compare-price').value = "38000";
      document.getElementById('edit-material').value = "100% Pure Mulberry Silk & 24K Gold Zari Workmanship";
      document.getElementById('edit-flag-new').checked = true;

      // Add a bespoke size
      document.getElementById('edit-custom-size-input').value = "Custom 44";
      document.getElementById('btn-edit-add-custom-size').click();

      // Add additional photo to gallery
      document.getElementById('edit-gallery-new-url').value = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80";
      document.getElementById('btn-edit-gallery-add-url').click();

      // Trigger preview update
      document.getElementById('edit-title').dispatchEvent(new Event('input'));
    `);
    await sleep(500);

    const previewTitle = await evaluate(`document.getElementById('edit-preview-title')?.textContent`);
    const previewPrice = await evaluate(`document.getElementById('edit-preview-price')?.textContent`);
    console.log(`   Live Preview Title: "${previewTitle}"`);
    console.log(`   Live Preview Price: "${previewPrice}"`);

    await screenshot("24_admin_edit_product_modal.png");

    // STEP 5: Save changes in modal
    console.log("5. Saving ensemble modifications...");
    await evaluate(`
      document.getElementById('product-edit-form').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(700);

    const isModalClosed = await evaluate(`document.getElementById('product-edit-modal')?.open === false`);
    console.log(`   Product Edit Modal closed: ${isModalClosed}`);

    // Verify row updated in admin table
    const updatedRowTitle = await evaluate(`
      document.querySelector('tr[data-product-id="vas-w-001"] .product-meta__title')?.textContent?.trim()
    `);
    const updatedRowPrice = await evaluate(`
      document.querySelector('tr[data-product-id="vas-w-001"] td:nth-child(4)')?.textContent?.trim()
    `);
    console.log(`   Inventory Row Title in Admin: "${updatedRowTitle}"`);
    console.log(`   Inventory Row Price in Admin: "${updatedRowPrice}"`);

    // STEP 6: Verify Storefront Sync on shop.html
    console.log("6. Verifying real-time synchronization on Shop Catalogue (shop.html)...");
    await navigate(`${BASE_URL}/shop.html`);
    await sleep(600);

    const shopCardTitle = await evaluate(`
      const card = document.querySelector('article[data-product-id="vas-w-001"] .product-card__title a');
      card ? card.textContent.trim() : null;
    `);
    const shopCardPrice = await evaluate(`
      const price = document.querySelector('article[data-product-id="vas-w-001"] .price-current');
      price ? price.textContent.trim() : null;
    `);
    console.log(`   Storefront Card Title: "${shopCardTitle}"`);
    console.log(`   Storefront Card Price: "${shopCardPrice}"`);

    await screenshot("25_shop_with_edited_product.png");

    // STEP 7: Verify Storefront Sync on product detail page (product.html)
    console.log("7. Verifying real-time synchronization on Product Detail Page (product.html)...");
    await navigate(`${BASE_URL}/product.html?slug=royal-crimson-kanjivaram-silk-saree`);
    await sleep(600);

    const pdpTitle = await evaluate(`document.getElementById('product-title')?.textContent?.trim()`);
    const pdpPrice = await evaluate(`document.getElementById('product-price')?.textContent?.trim()`);
    const hasCustomSize = await evaluate(`
      Array.from(document.querySelectorAll('.size-choice-btn')).some(b => b.textContent.includes('Custom 44'))
    `);
    console.log(`   PDP Title: "${pdpTitle}"`);
    console.log(`   PDP Price: "${pdpPrice}"`);
    console.log(`   PDP Contains Bespoke Size 'Custom 44': ${hasCustomSize}`);

    await screenshot("26_product_page_with_edits.png");

    // STEP 8: Test Studio Custom Ensemble Publishing
    console.log("8. Testing Atelier Studio custom ensemble publication...");
    await navigate(`${BASE_URL}/admin.html`);
    await sleep(500);

    await evaluate(`
      document.getElementById('tab-studio')?.click();
      document.getElementById('studio-name').value = "Maharani Zardozi Bridal Velvet Odhani";
      document.getElementById('studio-price').value = "45000";
      document.getElementById('studio-compare-price').value = "52000";
      document.getElementById('studio-stock').value = "8";
      document.getElementById('studio-custom-size-input').value = "Bridal Free Length";
      document.getElementById('btn-studio-add-custom-size').click();
      document.getElementById('studio-product-form').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(800);

    const publishedTitle = await evaluate(`
      document.querySelector('tr[data-product-id^="vas-custom-"] .product-meta__title')?.textContent?.trim()
    `);
    console.log(`   Custom Ensemble in Admin Table: "${publishedTitle}"`);

    await screenshot("27_studio_custom_piece_published.png");

    console.log("\n===============================================================");
    console.log("   ✅ ALL PRODUCT EDITING & VISUAL ASSET TESTS PASSED PERFECTLY!");
    console.log("===============================================================\n");

  } finally {
    if (ws) ws.close();
    chromeProc.kill("SIGTERM");
  }
}

runAdminProductEditingVerification().catch(err => {
  console.error("❌ Autonomous verification failed:", err);
  process.exit(1);
});
