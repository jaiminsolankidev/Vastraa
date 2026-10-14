/**
 * Vastraa - Lightweight Zero-Dependency Local Dev Server
 * Handles routing, clean URLs, query parameters, MIME types, and security headers.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".mjs": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf"
};

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = parsedUrl.pathname;

  // Clean Route Mappings
  if (pathname === "/") {
    pathname = "/index.html";
  } else if (pathname === "/shop") {
    pathname = "/shop.html";
  } else if (pathname === "/collections/women") {
    pathname = "/shop.html";
    parsedUrl.searchParams.set("category", "women");
  } else if (pathname === "/collections/men") {
    pathname = "/shop.html";
    parsedUrl.searchParams.set("category", "men");
  } else if (pathname === "/collections/kids") {
    pathname = "/shop.html";
    parsedUrl.searchParams.set("category", "kids");
  } else if (pathname.startsWith("/product/")) {
    const slug = pathname.replace("/product/", "");
    pathname = "/product.html";
    parsedUrl.searchParams.set("slug", slug);
  } else if (pathname === "/cart") {
    pathname = "/cart.html";
  } else if (pathname === "/wishlist") {
    pathname = "/wishlist.html";
  } else if (pathname === "/checkout") {
    pathname = "/checkout.html";
  } else if (pathname === "/order-confirmation") {
    pathname = "/order-confirmation.html";
  } else if (pathname === "/track-order") {
    pathname = "/track-order.html";
  } else if (pathname === "/about") {
    pathname = "/about.html";
  } else if (pathname === "/contact") {
    pathname = "/contact.html";
  } else if (pathname === "/faq") {
    pathname = "/faq.html";
  } else if (pathname === "/shipping-policy") {
    pathname = "/shipping-policy.html";
  } else if (pathname === "/returns-policy") {
    pathname = "/returns-policy.html";
  } else if (pathname === "/privacy-policy") {
    pathname = "/privacy-policy.html";
  } else if (pathname === "/terms") {
    pathname = "/terms.html";
  } else if (pathname === "/admin") {
    pathname = "/admin.html";
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(ROOT_DIR, safePath);

  // If asking for a file without extension, check if .html exists
  if (!path.extname(filePath) && fs.existsSync(filePath + ".html")) {
    filePath += ".html";
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Fallback
      const notFoundPath = path.join(ROOT_DIR, "404.html");
      fs.readFile(notFoundPath, (err404, data404) => {
        res.writeHead(404, {
          "Content-Type": "text/html; charset=UTF-8",
          "X-Content-Type-Options": "nosniff"
        });
        res.end(err404 ? "<h1>404 Not Found</h1>" : data404);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "no-cache, must-revalidate"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Vastraa Dev Server] Running at http://localhost:${PORT}`);
});
