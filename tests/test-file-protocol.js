import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const adminFile = "file:///" + path.resolve(ROOT_DIR, "admin.html").replace(/\\/g, "/");

async function testFile() {
  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox"
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  console.log("Connecting to target:", pageTarget.title, pageTarget.url);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === curId) {
        ws.removeEventListener("message", handler);
        res(data);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.addEventListener("message", (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === "Runtime.exceptionThrown") {
      console.log("PAGE SCRIPT EXCEPTION:", JSON.stringify(data.params.exceptionDetails));
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  console.log("Navigating to file URL:", adminFile);
  await send("Page.navigate", { url: adminFile });
  await new Promise(r => setTimeout(r, 1500));

  const evalRes = await send("Runtime.evaluate", {
    expression: `(() => {
      // Simulate demo unlock
      sessionStorage.setItem('vastraa_admin_authenticated', 'true');
      checkAuth();
      return {
        kpiProducts: document.getElementById('kpi-total-products')?.textContent,
        kpiValuation: document.getElementById('kpi-stock-valuation')?.textContent,
        kpiOrders: document.getElementById('kpi-total-orders')?.textContent,
        tableRows: document.querySelectorAll('#inventory-tbody tr')?.length,
        orderRows: document.querySelectorAll('#orders-tbody tr')?.length,
        loginGateDisplay: document.getElementById('login-gate')?.style.display
      };
    })()`,
    returnByValue: true
  });

  console.log("file:/// Execution Test Result:", JSON.stringify(evalRes));
  ws.close();
  chromeProc.kill();
}

testFile().catch(console.error);
