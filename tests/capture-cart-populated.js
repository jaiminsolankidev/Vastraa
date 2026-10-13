import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir = path.resolve(ROOT_DIR, "screenshots");

async function shot() {
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
  const send = (m, p = {}) => new Promise(res => {
    const curId = id++;
    const h = (msg) => { const d = JSON.parse(msg.data); if (d.id === curId) { ws.removeEventListener("message", h); res(d); } };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id: curId, method: m, params: p }));
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3000/cart.html" });
  await new Promise(r => setTimeout(r, 1000));

  // Seed cart with 2 items
  await send("Runtime.evaluate", {
    expression: `(() => {
      const demoCart = [
        { id: "vas-w-001-Free-Size-Crimson-Red", productId: "vas-w-001", size: "Free Size (Unstitched Blouse)", color: "Crimson Red", quantity: 2, pricePaise: 2850000 },
        { id: "vas-w-002-M-Royal-Wine", productId: "vas-w-002", size: "M", color: "Royal Wine", quantity: 1, pricePaise: 8800000 }
      ];
      localStorage.setItem("vastraa_cart_v1", JSON.stringify(demoCart));
      location.reload();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const shotCart = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(dir, "cart-with-items-desktop.png"), Buffer.from(shotCart.result.data, "base64"));
  console.log("Saved cart-with-items-desktop.png");

  // Also capture mobile cart
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const shotCartMob = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(dir, "cart-with-items-mobile.png"), Buffer.from(shotCartMob.result.data, "base64"));
  console.log("Saved cart-with-items-mobile.png");

  ws.close();
  chromeProc.kill();
  server.kill();
}

shot().catch(console.error);
