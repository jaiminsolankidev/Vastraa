import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("Starting Chrome for modal freeze reproduction...");
  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900"
  ]);

  await sleep(2000);

  try {
    const targetsRes = await fetch("http://127.0.0.1:9227/json");
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

    // Listen for console and exceptions
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        console.log(`[BROWSER CONSOLE ${data.params.type}]:`, ...data.params.args.map(a => a.value || a.description));
      }
      if (data.method === "Runtime.exceptionThrown") {
        console.error(`[BROWSER EXCEPTION]:`, data.params.exceptionDetails);
      }
    });

    await send("Page.enable");
    await send("Runtime.enable");

    console.log("Navigating to admin.html...");
    await send("Page.navigate", { url: `${BASE_URL}/admin.html` });
    await sleep(1500);

    // Auto-login
    await send("Runtime.evaluate", {
      expression: `
        sessionStorage.setItem("vastraa_admin_authenticated", "true");
        location.reload();
      `
    });
    await sleep(1500);

    // Check tabs and page state
    const diag1 = await send("Runtime.evaluate", {
      expression: `
        ({
          ordersCount: document.querySelectorAll("#orders-tbody tr").length,
          productsCount: document.querySelectorAll("#inventory-tbody tr").length,
          activeTab: document.querySelector(".tab-btn.is-active")?.textContent?.trim()
        })
      `,
      returnByValue: true
    });
    console.log("Initial admin state:", diag1.result.value);

    // Click "Edit" on the first product
    console.log("Clicking Edit button on first product row...");
    const editClickRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const editBtn = document.querySelector("#inventory-tbody .btn-edit-product");
          if (!editBtn) return { error: "No edit button found" };
          editBtn.click();
          const modal = document.getElementById("product-edit-modal");
          return {
            modalOpen: modal?.open,
            modalDisplay: window.getComputedStyle(modal).display,
            modalVisible: modal?.checkVisibility ? modal.checkVisibility() : true,
            title: document.getElementById("edit-title")?.value
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Edit modal status after click:", editClickRes.result.value);

    // Now test what happens if user clicks outside modal or clicks cancel
    console.log("Checking if user can close edit modal via cancel button or close button...");
    const closeEditRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const cancelBtn = document.getElementById("edit-modal-cancel-btn");
          if (cancelBtn) cancelBtn.click();
          const modal = document.getElementById("product-edit-modal");
          return {
            modalOpen: modal?.open,
            modalDisplay: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Edit modal after cancel:", closeEditRes.result.value);

    // Switch to orders tab
    console.log("Switching to Orders tab...");
    await send("Runtime.evaluate", {
      expression: `
        document.getElementById("tab-orders")?.click();
      `
    });
    await sleep(500);

    // Click invoice button
    console.log("Clicking 'Slip / Invoice' button on first order...");
    const invoiceClickRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const invoiceBtn = document.querySelector("#orders-tbody .btn-view-invoice");
          if (!invoiceBtn) return { error: "No invoice button found" };
          invoiceBtn.click();
          const modal = document.getElementById("order-details-modal");
          return {
            modalOpen: modal?.open,
            modalDisplay: window.getComputedStyle(modal).display,
            orderId: document.getElementById("order-modal-id")?.textContent
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Invoice modal status after click:", invoiceClickRes.result.value);

    // Close invoice modal
    console.log("Closing invoice modal...");
    const closeInvoiceRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const closeBtn = document.getElementById("order-modal-close");
          if (closeBtn) closeBtn.click();
          const modal = document.getElementById("order-details-modal");
          return {
            modalOpen: modal?.open,
            modalDisplay: window.getComputedStyle(modal).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Invoice modal after close:", closeInvoiceRes.result.value);

    // Now test what happens if user clicks edit THEN invoice OR what happens on the page
    console.log("Testing sequence: Edit -> without closing or closing -> Invoice...");
    const seqRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          // Open edit modal
          document.querySelector("#inventory-tbody .btn-edit-product")?.click();
          const editModal = document.getElementById("product-edit-modal");
          const editOpen1 = editModal?.open;

          // Attempt to click invoice button while edit modal or after
          const invoiceBtn = document.querySelector("#orders-tbody .btn-view-invoice");
          invoiceBtn?.click();
          const orderModal = document.getElementById("order-details-modal");

          return {
            editOpen: editModal?.open,
            orderOpen: orderModal?.open,
            orderDisplay: orderModal ? window.getComputedStyle(orderModal).display : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Sequence result:", seqRes.result.value);

    // Now test real pointer click at document level (elementFromPoint)
    console.log("Checking elementFromPoint on page coordinates (e.g. 100, 100) to see what intercepts clicks...");
    const pointerRes = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const el = document.elementFromPoint(100, 100);
          return {
            tagName: el?.tagName,
            id: el?.id,
            className: el?.className
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Element at (100, 100):", pointerRes.result.value);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
