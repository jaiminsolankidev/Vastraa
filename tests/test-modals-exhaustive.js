import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SHOT_DIR = path.resolve(ROOT_DIR, "screenshots", "modal-verification");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runExhaustiveTest() {
  await fs.mkdir(SHOT_DIR, { recursive: true });

  console.log("=================================================================");
  console.log("   VASTRAA ADMIN MODAL FREEZE RESOLUTION EXHAUSTIVE TEST");
  console.log("=================================================================\n");

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9229",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900"
  ]);

  await sleep(2200);

  try {
    const targetsRes = await fetch("http://127.0.0.1:9229/json");
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
      const filePath = path.join(SHOT_DIR, filename);
      await fs.writeFile(filePath, Buffer.from(data, "base64"));
      console.log(`  📸 Screenshot saved: ${filename}`);
    };

    await send("Page.enable");
    await send("Runtime.enable");

    // 1. Navigate to admin.html
    console.log("Step 1: Navigating to admin.html and authenticating...");
    await send("Page.navigate", { url: `${BASE_URL}/admin.html` });
    await sleep(1500);

    await send("Runtime.evaluate", {
      expression: `
        sessionStorage.setItem("vastraa_admin_authenticated", "true");
        location.reload();
      `
    });
    await sleep(1500);
    await screenshot("01_admin_dashboard_loaded.png");

    // 2. Click "Edit ✎" on first product
    console.log("\nStep 2: Clicking 'Edit ✎' on product row 1...");
    const editOpenRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const editBtn = document.querySelector("#inventory-tbody .btn-edit-product");
          editBtn.click();
          const modal = document.getElementById("product-edit-modal");
          const s = window.getComputedStyle(modal);
          return {
            open: modal.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            title: document.getElementById("edit-title")?.value
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Edit modal opened successfully:", editOpenRes.result.value);
    if (!editOpenRes.result.value.open || editOpenRes.result.value.visibility !== "visible" || editOpenRes.result.value.opacity !== "1") {
      throw new Error("Edit modal did not open with visible styles!");
    }
    await sleep(400);
    await screenshot("02_edit_product_modal_open.png");

    // 3. Edit title and click "Save Ensemble Changes"
    console.log("\nStep 3: Editing product title and clicking Save...");
    const editSaveRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const titleInput = document.getElementById("edit-title");
          titleInput.value = "Royal Crimson Kanjivaram Silk Saree (Certified Heirloom)";
          titleInput.dispatchEvent(new Event("input", { bubbles: true }));

          const saveBtn = document.getElementById("edit-modal-save-btn");
          saveBtn.click();

          const modal = document.getElementById("product-edit-modal");
          const s = window.getComputedStyle(modal);
          return {
            open: modal.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Edit modal after Save:", editSaveRes.result.value);
    if (editSaveRes.result.value.open || editSaveRes.result.value.display !== "none") {
      throw new Error("Edit modal did not close cleanly after save!");
    }
    await sleep(400);
    await screenshot("03_after_save_product_clean.png");

    // 4. Verify page is responsive and interactive (click stock + button)
    console.log("\nStep 4: Testing page interactivity immediately after modal close...");
    const interact1 = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const plusBtn = document.querySelector("#inventory-tbody .btn-qty-plus");
          const input = document.querySelector("#inventory-tbody .input-stock-qty");
          const prevVal = parseInt(input.value, 10);
          plusBtn.click();
          return {
            prevVal,
            newVal: parseInt(input.value, 10),
            pageClickable: !!document.elementFromPoint(100, 100)
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Inline stock + interaction:", interact1.result.value);
    if (interact1.result.value.newVal !== interact1.result.value.prevVal + 1) {
      throw new Error("Page was frozen or stock + button was blocked!");
    }

    // 5. Open edit modal again and dismiss via backdrop click
    console.log("\nStep 5: Testing dismiss via clicking on backdrop outside modal...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#inventory-tbody .btn-edit-product").click();`
    });
    await sleep(300);

    const backdropClickRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modal = document.getElementById("product-edit-modal");
          // Click on backdrop (the dialog itself)
          const evt = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: 10,
            clientY: 10
          });
          modal.dispatchEvent(evt);
          return {
            open: modal.open,
            display: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Edit modal after backdrop click:", backdropClickRes.result.value);
    if (backdropClickRes.result.value.open || backdropClickRes.result.value.display !== "none") {
      throw new Error("Backdrop click did not dismiss edit modal!");
    }

    // 6. Open edit modal again and dismiss via Escape key
    console.log("\nStep 6: Testing dismiss via Escape key...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#inventory-tbody .btn-edit-product").click();`
    });
    await sleep(300);

    const escDismissRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modal = document.getElementById("product-edit-modal");
          modal.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
          return {
            open: modal.open,
            display: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Edit modal after Escape:", escDismissRes.result.value);
    if (escDismissRes.result.value.open || escDismissRes.result.value.display !== "none") {
      throw new Error("Escape key did not dismiss edit modal!");
    }

    // 7. Switch to Orders tab
    console.log("\nStep 7: Switching to Orders tab...");
    await send("Runtime.evaluate", {
      expression: `document.getElementById("tab-orders").click();`
    });
    await sleep(400);
    await screenshot("04_orders_tab.png");

    // 8. Open Invoice Modal on Order 1
    console.log("\nStep 8: Clicking 'Slip / Invoice' on first order...");
    const invoiceOpenRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const invBtn = document.querySelector("#orders-tbody .btn-view-invoice");
          invBtn.click();
          const modal = document.getElementById("order-details-modal");
          const s = window.getComputedStyle(modal);
          return {
            open: modal.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            orderId: document.getElementById("order-modal-id")?.textContent
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Invoice modal opened successfully:", invoiceOpenRes.result.value);
    if (!invoiceOpenRes.result.value.open || invoiceOpenRes.result.value.visibility !== "visible" || invoiceOpenRes.result.value.opacity !== "1") {
      throw new Error("Invoice modal did not open with visible styles!");
    }
    await sleep(400);
    await screenshot("05_invoice_modal_open.png");

    // 9. Close invoice modal via close button
    console.log("\nStep 9: Closing invoice modal via '✕' close button...");
    const invoiceCloseRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          document.getElementById("order-modal-close").click();
          const modal = document.getElementById("order-details-modal");
          return {
            open: modal.open,
            display: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Invoice modal after close button:", invoiceCloseRes.result.value);
    if (invoiceCloseRes.result.value.open || invoiceCloseRes.result.value.display !== "none") {
      throw new Error("Invoice modal did not close cleanly via close button!");
    }

    // 10. Open invoice modal again and dismiss via backdrop click
    console.log("\nStep 10: Testing invoice dismiss via backdrop click...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#orders-tbody .btn-view-invoice").click();`
    });
    await sleep(300);

    const invoiceBackdropRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modal = document.getElementById("order-details-modal");
          const evt = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: 10,
            clientY: 10
          });
          modal.dispatchEvent(evt);
          return {
            open: modal.open,
            display: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Invoice modal after backdrop click:", invoiceBackdropRes.result.value);
    if (invoiceBackdropRes.result.value.open || invoiceBackdropRes.result.value.display !== "none") {
      throw new Error("Invoice modal did not close via backdrop click!");
    }

    // 11. Open invoice modal again and dismiss via Escape key
    console.log("\nStep 11: Testing invoice dismiss via Escape key...");
    await send("Runtime.evaluate", {
      expression: `document.querySelector("#orders-tbody .btn-view-invoice").click();`
    });
    await sleep(300);

    const invoiceEscRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modal = document.getElementById("order-details-modal");
          modal.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
          return {
            open: modal.open,
            display: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Invoice modal after Escape:", invoiceEscRes.result.value);
    if (invoiceEscRes.result.value.open || invoiceEscRes.result.value.display !== "none") {
      throw new Error("Invoice modal did not close via Escape key!");
    }

    // 12. Cross-tab navigation test (ensure no frozen state anywhere)
    console.log("\nStep 12: Testing rapid tab switching and full site interactivity...");
    const crossTabsRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const tabs = ["tab-inventory", "tab-orders", "tab-studio", "tab-analytics", "tab-inventory"];
          const history = [];
          for (const tabId of tabs) {
            document.getElementById(tabId)?.click();
            history.push(document.querySelector(".tab-btn.is-active")?.textContent?.trim()?.split("\\n")[0]);
          }
          return {
            tabHistory: history,
            elementUnderCursor: document.elementFromPoint(200, 200)?.tagName,
            editModalOpen: document.getElementById("product-edit-modal")?.open,
            orderModalOpen: document.getElementById("order-details-modal")?.open
          };
        })()
      `,
      returnByValue: true
    });
    console.log("  Tab switching result:", crossTabsRes.result.value);
    if (crossTabsRes.result.value.editModalOpen || crossTabsRes.result.value.orderModalOpen) {
      throw new Error("A modal remained unexpectedly open during tab switching!");
    }
    await sleep(300);
    await screenshot("06_final_clean_interactivity.png");

    console.log("\n=================================================================");
    console.log("   ✅ ALL 12 VERIFICATION PHASES PASSED WITH ZERO FREEZES!");
    console.log("=================================================================\n");

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

runExhaustiveTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
