import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testHttp() {
  const server = spawn("node", ["scripts/serve.js"], { env: { ...process.env, PORT: "3000" } });
  await new Promise(r => setTimeout(r, 1200));

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox"
  ]);
  await new Promise(r => setTimeout(r, 1500));

  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === "page") || targets[0];
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

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: "http://localhost:3000/admin.html" });
  await new Promise(r => setTimeout(r, 1500));

  const evalRes = await send("Runtime.evaluate", {
    expression: `(() => {
      sessionStorage.setItem('vastraa_admin_authenticated', 'true');
      window.checkAuth();
      return {
        kpiProducts: document.getElementById('kpi-total-products')?.textContent,
        kpiValuation: document.getElementById('kpi-stock-valuation')?.textContent,
        kpiOrders: document.getElementById('kpi-total-orders')?.textContent,
        tableRows: document.querySelectorAll('#inventory-tbody tr')?.length,
        orderRows: document.querySelectorAll('#orders-tbody tr')?.length
      };
    })()`,
    returnByValue: true
  });

  console.log("http://localhost:3000/admin.html Test Result:", evalRes.result?.result?.value);
  ws.close();
  chromeProc.kill();
  server.kill();
}

testHttp().catch(console.error);
