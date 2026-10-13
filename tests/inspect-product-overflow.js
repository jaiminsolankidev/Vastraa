import { spawn } from "node:child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function inspect() {
  const server = spawn("node", ["scripts/serve.js"], { env: { ...process.env, PORT: "3000" } });
  await new Promise(r => setTimeout(r, 1000));

  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox"
  ]);
  await new Promise(r => setTimeout(r, 1500));

  const res = await fetch("http://127.0.0.1:9222/json");
  const targets = await res.json();
  const page = targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

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
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:3000/product.html?slug=royal-crimson-kanjivaram-silk-saree" });
  await new Promise(r => setTimeout(r, 1500));

  const evalRes = await send("Runtime.evaluate", {
    expression: `(() => {
      const culprits = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 2) {
          culprits.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            right: Math.round(r.right),
            left: Math.round(r.left),
            width: Math.round(r.width),
            parent: el.parentElement ? el.parentElement.tagName + '.' + el.parentElement.className : null
          });
        }
      });
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth,
        culprits: culprits.slice(0, 10)
      };
    })()`,
    returnByValue: true
  });

  console.log("Inspection Result:", JSON.stringify(evalRes.result?.result?.value, null, 2));

  ws.close();
  chromeProc.kill();
  server.kill();
}

inspect().catch(console.error);
