const { execSync } = require("child_process");
const path = require("path");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir = path.resolve(__dirname, "..", "screenshots");

const targets = [
  { file: "shop-catalogue.png", url: "http://localhost:3000/shop.html", size: "1440,900" },
  { file: "checkout-preview.png", url: "http://localhost:3000/checkout.html", size: "1440,900" }
];

for (const t of targets) {
  const dest = path.join(dir, t.file);
  try {
    console.log(`Capturing ${t.file}...`);
    execSync(
      `"${chrome}" --headless --disable-gpu --no-sandbox --disable-background-networking --disable-sync --hide-scrollbars --window-size=${t.size} --screenshot="${dest}" "${t.url}"`,
      { timeout: 30000, stdio: "inherit" }
    );
    console.log(`Captured ${t.file} successfully!`);
  } catch (e) {
    console.error(`Error capturing ${t.file}:`, e.message);
  }
}


