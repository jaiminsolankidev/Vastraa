import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9228",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900"
  ]);

  await sleep(2000);

  try {
    const targetsRes = await fetch("http://127.0.0.1:9228/json");
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

    await send("Page.enable");
    await send("Runtime.enable");

    await send("Page.navigate", { url: `${BASE_URL}/admin.html` });
    await sleep(1500);

    // Login
    await send("Runtime.evaluate", {
      expression: `
        sessionStorage.setItem("vastraa_admin_authenticated", "true");
        location.reload();
      `
    });
    await sleep(1500);

    // Inspect product-edit-modal BEFORE click
    const beforeEdit = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const m = document.getElementById("product-edit-modal");
          const s = window.getComputedStyle(m);
          return {
            open: m.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
            rect: m.getBoundingClientRect()
          };
        })()
      `,
      returnByValue: true
    });
    console.log("product-edit-modal BEFORE open:", beforeEdit.result.value);

    // Click edit button
    const openEdit = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector("#inventory-tbody .btn-edit-product");
          btn.click();
          const m = document.getElementById("product-edit-modal");
          const s = window.getComputedStyle(m);
          return {
            open: m.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
            rect: m.getBoundingClientRect()
          };
        })()
      `,
      returnByValue: true
    });
    console.log("product-edit-modal AFTER open:", openEdit.result.value);

    // Now test what happens if user clicks at (50, 50) outside the modal box
    const clickOutsideEdit = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const el = document.elementFromPoint(50, 50);
          return {
            target: el ? el.tagName + '#' + el.id + '.' + el.className : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log("Element at (50, 50) while edit modal open:", clickOutsideEdit.result.value);

    // Now close edit modal via cancel
    await send("Runtime.evaluate", {
      expression: `
        document.getElementById("edit-modal-cancel-btn").click();
      `
    });
    await sleep(200);

    // Switch to orders
    await send("Runtime.evaluate", {
      expression: `
        document.getElementById("tab-orders").click();
      `
    });
    await sleep(300);

    // Inspect order-details-modal before open
    const beforeOrder = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const m = document.getElementById("order-details-modal");
          const s = window.getComputedStyle(m);
          return {
            open: m.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
            rect: m.getBoundingClientRect()
          };
        })()
      `,
      returnByValue: true
    });
    console.log("order-details-modal BEFORE open:", beforeOrder.result.value);

    // Click invoice button
    const openOrder = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector("#orders-tbody .btn-view-invoice");
          btn.click();
          const m = document.getElementById("order-details-modal");
          const s = window.getComputedStyle(m);
          return {
            open: m.open,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
            rect: m.getBoundingClientRect()
          };
        })()
      `,
      returnByValue: true
    });
    console.log("order-details-modal AFTER open:", openOrder.result.value);

    // Now test outside click on order modal at (50, 50)
    const clickOutsideOrder = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const m = document.getElementById("order-details-modal");
          // simulate click at (50, 50)
          const evt = new MouseEvent('click', { clientX: 50, clientY: 50, bubbles: true });
          m.dispatchEvent(evt);
          return {
            open: m.open,
            display: window.getComputedStyle(m).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("order-details-modal AFTER backdrop click simulation:", clickOutsideOrder.result.value);

    // Now test what happens if user presses ESC on order modal
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = document.querySelector("#orders-tbody .btn-view-invoice");
          btn.click();
        })()
      `
    });
    await sleep(200);

    const escTest = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const m = document.getElementById("order-details-modal");
          // Dispatch cancel event (native dialog ESC)
          const evt = new Event('cancel', { bubbles: true, cancelable: true });
          m.dispatchEvent(evt);
          m.close();
          return {
            open: m.open,
            styleDisplay: m.style.display,
            computedDisplay: window.getComputedStyle(m).display
          };
        })()
      `,
      returnByValue: true
    });
    console.log("order-details-modal AFTER ESC / native close:", escTest.result.value);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
