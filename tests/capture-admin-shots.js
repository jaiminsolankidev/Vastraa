import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SHOTS_DIR = path.join(ROOT_DIR, "screenshots");

async function capture() {
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
    const h = (msg) => {
      const d = JSON.parse(msg.data);
      if (d.id === curId) { ws.removeEventListener("message", h); res(d); }
    };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id: curId, method: m, params }));
  });

  await send("Page.enable");
  await send("Runtime.enable");

  // 1. Capture Admin Console Desktop (authenticated view)
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3000/admin.html" });
  await new Promise(r => setTimeout(r, 1000));
  await send("Runtime.evaluate", {
    expression: "sessionStorage.setItem('vastraa_admin_authenticated', 'true'); window.checkAuth();"
  });
  await new Promise(r => setTimeout(r, 800));
  const shotAdminDesktop = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(SHOTS_DIR, "admin-console-desktop.png"), Buffer.from(shotAdminDesktop.result.data, "base64"));
  console.log("Captured admin-console-desktop.png");

  // 2. Capture Admin Console Mobile (authenticated view)
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await new Promise(r => setTimeout(r, 600));
  const shotAdminMobile = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(SHOTS_DIR, "admin-console-mobile.png"), Buffer.from(shotAdminMobile.result.data, "base64"));
  console.log("Captured admin-console-mobile.png");

  // 3. Capture Cart Drawer Open on Mobile
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: "http://localhost:3000/product.html?slug=royal-crimson-kanjivaram-silk-saree" });
  await new Promise(r => setTimeout(r, 1200));
  await send("Runtime.evaluate", {
    expression: "document.getElementById('btn-add-to-cart')?.click();"
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotCartMobile = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(SHOTS_DIR, "cart-drawer-mobile.png"), Buffer.from(shotCartMobile.result.data, "base64"));
  console.log("Captured cart-drawer-mobile.png");

  ws.close();
  chromeProc.kill();
  server.kill();
}

capture().catch(console.error);
