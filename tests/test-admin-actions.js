import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testActions() {
  const server = spawn("node", ["scripts/serve.js"], { env: { ...process.env, PORT: "3000" } });
  await new Promise(r => setTimeout(r, 1200));

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox"
  ]);
  await new Promise(r => setTimeout(r, 1500));

  const targets = await (await fetch("http://127.0.0.1:9222/json")).json();
  const pageTarget = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === curId) {
        ws.removeEventListener("message", handler);
        res(data);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id: curId, method: m, params }));
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: "http://localhost:3000/admin.html" });
  await new Promise(r => setTimeout(r, 1500));

  // Run comprehensive action test in browser context
  const testRes = await send("Runtime.evaluate", {
    expression: `(() => {
      sessionStorage.setItem('vastraa_admin_authenticated', 'true');
      window.checkAuth();

      const initialProductCount = window.PRODUCTS.length;
      
      // 1. Add Custom Piece via Studio
      document.getElementById('studio-name').value = 'Kashmiri Tilla Velvet Cape';
      document.getElementById('studio-category').value = 'women';
      document.getElementById('studio-subcategory').value = 'lehenga';
      document.getElementById('studio-price').value = '45000';
      document.getElementById('studio-stock').value = '7';
      document.getElementById('studio-img-url').value = 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=900&q=80';
      
      const submitEvent = new Event('submit', { cancelable: true });
      document.getElementById('studio-product-form').dispatchEvent(submitEvent);

      const afterAddCount = window.PRODUCTS.length;

      // 2. Adjust Stock for vas-w-001
      const stockInput = document.querySelector('tr[data-product-id=\"vas-w-001\"] .input-stock-qty');
      const saveBtn = document.querySelector('tr[data-product-id=\"vas-w-001\"] .btn-save-stock');
      if (stockInput && saveBtn) {
        stockInput.value = '15';
        saveBtn.click();
      }

      // 3. Create simulated customer order
      const initialOrders = parseInt(document.getElementById('kpi-total-orders').textContent, 10);
      document.getElementById('btn-quick-create-demo-order').click();
      const afterOrders = parseInt(document.getElementById('kpi-total-orders').textContent, 10);

      return {
        initialProductCount,
        afterAddCount,
        addedSuccessfully: afterAddCount === initialProductCount + 1,
        initialOrders,
        afterOrders,
        orderAddedSuccessfully: afterOrders === initialOrders + 1,
        kpiTotalProductsText: document.getElementById('kpi-total-products').textContent,
        kpiValuationText: document.getElementById('kpi-stock-valuation').textContent
      };
    })()`,
    returnByValue: true
  });

  console.log("Admin Actions Test Result:", testRes.result?.result?.value);

  ws.close();
  chromeProc.kill();
  server.kill();
}

testActions().catch(console.error);
