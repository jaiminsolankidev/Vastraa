import { spawn } from "node:child_process";
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

async function debugAdmin() {
  console.log("=== DEBUGGING ADMIN STOCK EDIT & SLIP/INVOICE BUTTON ===");

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9224",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,960",
    "--disable-dev-shm-usage"
  ]);

  await sleep(1500);

  let ws;
  try {
    const targetsRes = await fetch("http://127.0.0.1:9224/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];

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

    // Listen to console API messages
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        console.log(`[Browser Console ${data.params.type}]:`, ...data.params.args.map(a => a.value || a.description));
      }
      if (data.method === "Runtime.exceptionThrown") {
        console.error(`[Browser Unhandled Exception]:`, data.params.exceptionDetails);
      }
    });

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

    await send("Page.navigate", { url: `${BASE_URL}/admin.html` });
    await sleep(1000);

    // Login
    await evaluate(`document.getElementById('quick-demo-login-btn')?.click()`);
    await sleep(500);

    // TEST 1: INLINE STOCK EDITING
    console.log("\n--- TEST 1: INLINE STOCK EDITING ---");
    const initialRow = await evaluate(`(() => {
      const row = document.querySelector('#inventory-tbody tr');
      const input = row.querySelector('.input-stock-qty');
      const prodId = row.dataset.productId;
      return { prodId, val: input.value };
    })()`);
    console.log("Initial row state:", initialRow);

    // Click plus button twice
    console.log("Clicking + button twice...");
    await evaluate(`(() => {
      const row = document.querySelector('#inventory-tbody tr');
      const plus = row.querySelector('.btn-qty-plus');
      plus.click();
      plus.click();
    })()`);
    const afterPlusVal = await evaluate(`document.querySelector('#inventory-tbody tr .input-stock-qty').value`);
    console.log("Value after clicking + twice:", afterPlusVal);

    // Click Save button
    console.log("Clicking Save button...");
    const saveResult = await evaluate(`(() => {
      try {
        const row = document.querySelector('#inventory-tbody tr');
        const save = row.querySelector('.btn-save-stock');
        save.click();
        const stored = JSON.parse(localStorage.getItem('vastraa_stock_overrides') || '{}');
        const prod = PRODUCTS.find(p => p.id === row.dataset.productId);
        return { success: true, stored, prodStock: prod?.stockQuantity };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack };
      }
    })()`);
    console.log("Save stock result:", saveResult);

    // TEST 2: ORDER SLIP/INVOICE BUTTON
    console.log("\n--- TEST 2: ORDER SLIP/INVOICE BUTTON ---");
    // Switch to Orders Tab
    await evaluate(`document.getElementById('tab-orders').click()`);
    await sleep(400);

    const ordersCount = await evaluate(`document.querySelectorAll('#orders-tbody tr').length`);
    console.log("Orders rendered in table:", ordersCount);

    const firstInvoiceBtn = await evaluate(`(() => {
      const btn = document.querySelector('.btn-view-invoice');
      return btn ? { orderId: btn.dataset.orderId, text: btn.textContent } : null;
    })()`);
    console.log("First invoice button found:", firstInvoiceBtn);

    console.log("Clicking Slip / Invoice button on first order...");
    const clickInvoiceResult = await evaluate(`(() => {
      try {
        const btn = document.querySelector('.btn-view-invoice');
        if (!btn) return { error: "No button found" };
        btn.click();
        const modal = document.getElementById('order-details-modal');
        return {
          modalFound: !!modal,
          isOpen: modal ? modal.open : false,
          modalId: document.getElementById('order-modal-id')?.textContent,
          modalBodyLength: document.getElementById('order-modal-body')?.innerHTML?.length
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`);
    console.log("Invoice modal click result:", clickInvoiceResult);

    // TEST 3: WHAT HAPPENS IF SOMEONE MANUALLY TYPES INTO STOCK INPUT?
    console.log("\n--- TEST 3: MANUAL TYPING IN STOCK INPUT & SAVING ---");
    await evaluate(`document.getElementById('tab-inventory').click()`);
    await sleep(300);

    const manualInputResult = await evaluate(`(() => {
      try {
        const row = document.querySelector('#inventory-tbody tr');
        const input = row.querySelector('.input-stock-qty');
        input.value = "15";
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
        const save = row.querySelector('.btn-save-stock');
        save.click();
        const stored = JSON.parse(localStorage.getItem('vastraa_stock_overrides') || '{}');
        const reloadedVal = document.querySelector('#inventory-tbody tr .input-stock-qty').value;
        return { stored, reloadedVal };
      } catch (err) {
        return { error: err.message };
      }
    })()`);
    console.log("Manual input & save result:", manualInputResult);

  } finally {
    if (ws) ws.close();
    chromeProc.kill("SIGTERM");
  }
}

debugAdmin().catch(console.error);
