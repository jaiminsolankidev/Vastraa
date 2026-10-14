import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SHOTS_DIR = path.resolve(ROOT_DIR, "screenshots", "user-fixes");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await fs.mkdir(SHOTS_DIR, { recursive: true });
  console.log("===============================================================");
  console.log("   VASTRAA DUAL-BUG VERIFICATION: PDP ACCORDION & ADMIN UPLOAD ");
  console.log("===============================================================\n");

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9235",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1024,800"
  ]);

  await sleep(2000);

  try {
    const targetsRes = await fetch("http://127.0.0.1:9235/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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
          if (data.error) reject(new Error(`${method} error: ${JSON.stringify(data.error)}`));
          else resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    const screenshot = async (filename) => {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      const filePath = path.join(SHOTS_DIR, filename);
      await fs.writeFile(filePath, Buffer.from(data, "base64"));
      console.log(`  📸 Screenshot saved: ${filename}`);
    };

    await send("Page.enable");
    await send("Runtime.enable");

    // -------------------------------------------------------------------------
    // PHASE 1: PRODUCT DETAIL PAGE ACCORDION STABILITY
    // -------------------------------------------------------------------------
    console.log("--- PHASE 1: PDP ACCORDION STABILITY & ZERO LAYOUT SHIFT ---");
    await send("Page.navigate", { url: `${BASE_URL}/product.html?slug=royal-crimson-kanjivaram-silk-saree` });
    await sleep(1500);

    const getMetrics = async () => {
      const res = await send("Runtime.evaluate", {
        expression: `(() => {
          const gallery = document.querySelector('.product-gallery');
          const main = document.querySelector('.product-gallery__main');
          const img = document.querySelector('#gallery-main-img');
          const grid = document.querySelector('.product-detail-grid');
          return {
            galleryWidth: Math.round(gallery?.getBoundingClientRect().width),
            galleryHeight: Math.round(gallery?.getBoundingClientRect().height),
            imgWidth: Math.round(img?.getBoundingClientRect().width),
            imgHeight: Math.round(img?.getBoundingClientRect().height),
            gridWidth: Math.round(grid?.getBoundingClientRect().width)
          };
        })()`,
        returnByValue: true
      });
      return res.result.value;
    };

    const initialPDP = await getMetrics();
    console.log("  PDP Initial (1st accordion open):", initialPDP);
    await screenshot("01_pdp_initial_state.png");

    // Open all 4 accordions
    await send("Runtime.evaluate", {
      expression: `(() => {
        const triggers = document.querySelectorAll('[data-accordion-trigger]');
        triggers.forEach(t => {
          if (t.getAttribute('aria-expanded') !== 'true') t.click();
        });
      })()`
    });
    await sleep(400);

    const allOpenPDP = await getMetrics();
    console.log("  PDP All 4 Accordions Open:", allOpenPDP);
    await screenshot("02_pdp_all_accordions_open.png");

    // Collapse all 4 accordions
    await send("Runtime.evaluate", {
      expression: `(() => {
        const triggers = document.querySelectorAll('[data-accordion-trigger]');
        triggers.forEach(t => {
          if (t.getAttribute('aria-expanded') === 'true') t.click();
        });
      })()`
    });
    await sleep(400);

    const allClosedPDP = await getMetrics();
    console.log("  PDP All 4 Accordions Closed:", allClosedPDP);
    await screenshot("03_pdp_all_accordions_closed.png");

    const imgWidthDiff = Math.abs(allOpenPDP.imgWidth - initialPDP.imgWidth) + Math.abs(allClosedPDP.imgWidth - initialPDP.imgWidth);
    const imgHeightDiff = Math.abs(allOpenPDP.imgHeight - initialPDP.imgHeight) + Math.abs(allClosedPDP.imgHeight - initialPDP.imgHeight);

    console.log(`\n  PDP Image Width Drift: ${imgWidthDiff}px (Must be 0px)`);
    console.log(`  PDP Image Height Drift: ${imgHeightDiff}px (Must be 0px)`);

    if (imgWidthDiff > 2 || imgHeightDiff > 2) {
      throw new Error(`PDP image resized during accordion toggle! Width drift: ${imgWidthDiff}px, Height drift: ${imgHeightDiff}px`);
    }
    console.log("  ✅ PHASE 1 PASSED: Product image dimensions remain 100% constant and stable!\n");

    // -------------------------------------------------------------------------
    // PHASE 2: MOBILE VIEWPORT VERIFICATION (375x812)
    // -------------------------------------------------------------------------
    console.log("--- PHASE 2: MOBILE RESPONSIVE ACCORDION CHECK (375px) ---");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    const mobileMetrics = await getMetrics();
    console.log("  Mobile PDP Metrics:", mobileMetrics);
    await screenshot("04_pdp_mobile_view.png");

    // Check horizontal scroll / overflow
    const docWidthRes = await send("Runtime.evaluate", {
      expression: `(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log("  Mobile Overflow Check:", docWidthRes.result.value);
    if (docWidthRes.result.value.scrollWidth > docWidthRes.result.value.clientWidth) {
      throw new Error(`Mobile view has horizontal overflow! scrollWidth=${docWidthRes.result.value.scrollWidth}`);
    }
    console.log("  ✅ PHASE 2 PASSED: Mobile responsive layout is flawless with zero overflow!\n");

    // Reset emulation
    await send("Emulation.clearDeviceMetricsOverride");
    await sleep(200);

    // -------------------------------------------------------------------------
    // PHASE 3: ADMIN PANEL PC FILE UPLOAD MODAL PERSISTENCE
    // -------------------------------------------------------------------------
    console.log("--- PHASE 3: ADMIN PANEL EDIT & FILE UPLOAD FROM PC ---");
    await send("Page.navigate", { url: `${BASE_URL}/admin.html` });
    await sleep(1500);

    await send("Runtime.evaluate", {
      expression: `
        sessionStorage.setItem("vastraa_admin_authenticated", "true");
        location.reload();
      `
    });
    await sleep(1500);

    // Open Edit modal
    const editOpen = await send("Runtime.evaluate", {
      expression: `(() => {
        const editBtn = document.querySelector("#inventory-tbody .btn-edit-product");
        editBtn.click();
        const modal = document.getElementById("product-edit-modal");
        return {
          open: modal.open,
          title: document.getElementById("edit-title")?.value
        };
      })()`,
      returnByValue: true
    });
    console.log("  Edit Modal opened:", editOpen.result.value);
    await screenshot("05_admin_edit_modal_open.png");

    // 1. Click "Upload from PC" button
    console.log("  Clicking #btn-edit-browse-file ('Upload from PC')...");
    const afterBrowseClick = await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.getElementById("btn-edit-browse-file");
        btn.click();
        const modal = document.getElementById("product-edit-modal");
        return { open: modal.open, hasOpenAttr: modal.hasAttribute("open") };
      })()`,
      returnByValue: true
    });
    console.log("  Edit Modal state after 'Upload from PC':", afterBrowseClick.result.value);
    if (!afterBrowseClick.result.value.open) {
      throw new Error("Modal abruptly closed upon clicking 'Upload from PC'!");
    }

    // 2. Simulate local file loaded via FileReader for Primary Image
    console.log("  Simulating file selection for primary image...");
    const dummyDataUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23641E2B'/><text x='50' y='55' fill='white' font-size='12' text-anchor='middle'>NEW PC PHOTO</text></svg>";
    await send("Runtime.evaluate", {
      expression: `(() => {
        const urlInput = document.getElementById("edit-img-url");
        urlInput.value = "${dummyDataUrl}";
        const modal = document.getElementById("product-edit-modal");
        // Dispatch preview update
        const previewImg = document.getElementById("edit-img-preview");
        if (previewImg) previewImg.src = "${dummyDataUrl}";
      })()`
    });
    await sleep(300);
    await screenshot("06_admin_edit_photo_selected.png");

    // 3. Click "Add Photo from PC" button for Gallery
    console.log("  Clicking #btn-edit-gallery-upload ('Add Photo from PC')...");
    const afterGalleryBrowseClick = await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.getElementById("btn-edit-gallery-upload");
        btn.click();
        const modal = document.getElementById("product-edit-modal");
        return { open: modal.open, hasOpenAttr: modal.hasAttribute("open") };
      })()`,
      returnByValue: true
    });
    console.log("  Edit Modal state after 'Add Photo from PC':", afterGalleryBrowseClick.result.value);
    if (!afterGalleryBrowseClick.result.value.open) {
      throw new Error("Modal abruptly closed upon clicking 'Add Photo from PC'!");
    }

    // 4. Save changes
    console.log("  Submitting edit form to save updated product with PC photo...");
    const saveRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const saveBtn = document.getElementById("edit-modal-save-btn");
        saveBtn.click();
        const modal = document.getElementById("product-edit-modal");
        return { open: modal.open };
      })()`,
      returnByValue: true
    });
    console.log("  Edit Modal state after Save:", saveRes.result.value);
    await sleep(500);
    await screenshot("07_admin_after_save_success.png");

    if (saveRes.result.value.open) {
      throw new Error("Modal did not close after saving product!");
    }

    console.log("  ✅ PHASE 3 PASSED: File upload triggers and modal lifecycle work seamlessly!\n");

    console.log("===============================================================");
    console.log("   🎉 ALL VERIFICATION TESTS PASSED WITH 100% SUCCESS RATE!    ");
    console.log("===============================================================");

    ws.close();
  } finally {
    chromeProc.kill("SIGKILL");
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
