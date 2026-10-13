import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const shots = [
  { file: "shop-catalogue.png", url: "http://localhost:3005/shop.html", size: "1440,900" },
  { file: "checkout-preview.png", url: "http://localhost:3005/checkout.html", size: "1440,900" }
];

const server = spawn("node", ["scripts/serve.js"], {
  cwd: ROOT_DIR,
  env: { ...process.env, PORT: "3005" },
  stdio: "ignore"
});

await new Promise(r => setTimeout(r, 1200));

for (const s of shots) {
  const out = path.join(ROOT_DIR, "screenshots", s.file);
  try {
    execSync(
      `"${CHROME}" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=${s.size} --screenshot="${out}" "${s.url}"`,
      { timeout: 8000 }
    );
    console.log("Captured:", s.file);
  } catch (e) {
    console.error("Failed", s.file, e.message);
  }
}

server.kill();
