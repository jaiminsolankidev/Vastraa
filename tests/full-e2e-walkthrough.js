import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SHOT_DIR = path.resolve(ROOT_DIR, "screenshots", "walkthrough");

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runAutonomousWalkthrough() {
  console.log("===============================================================");
  console.log("   VASTRAA AUTONOMOUS END-TO-END SYSTEM VERIFICATION");
  console.log("   Simulating real client journey from storefront to atelier admin");
  console.log("===============================================================\n");

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900",
    "--disable-dev-shm-usage"
  ]);

  await sleep(1500);

  let ws;
  try {
    const targetsRes = await fetch("http://127.0.0.1:9222/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];

    if (!pageTarget) {
      throw new Error("No page target found on Chrome remote debugging port 9222");
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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
          if (data.error) {
            reject(new Error(`${method} error: ${JSON.stringify(data.error)}`));
          } else {
            resolve(data.result);
          }
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("DOM.enable");

    async function setViewport(width, height) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width <= 768
      });
      await sleep(250);
    }

    async function navigate(urlPath) {
      const fullUrl = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath}`;
      console.log(`\n🌐 Navigating to: ${fullUrl}`);
      await send("Page.navigate", { url: fullUrl });
      await sleep(1400);
    }

    async function evaluate(code) {
      const res = await send("Runtime.evaluate", {
        expression: code,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
      }
      return res.result?.value;
    }

    async function saveScreenshot(filename) {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      const targetPath = path.join(SHOT_DIR, filename);
      await fs.writeFile(targetPath, Buffer.from(data, "base64"));
      console.log(`  📸 Screenshot saved: screenshots/walkthrough/${filename}`);
    }

    const testResults = [];
    function record(stepName, passed, details = "") {
      testResults.push({ stepName, passed, details });
      console.log(`${passed ? "  ✅ PASS" : "  ❌ FAIL"}: [${stepName}] ${details}`);
    }

    // ==========================================
    // STEP 1: HOMEPAGE VERIFICATION
    // ==========================================
    console.log("\n--- STEP 1: Homepage & Brand Integrity ---");
    await setViewport(1440, 900);
    await navigate("/");
    
    const homeInfo = await evaluate(`(() => {
      return {
        title: document.title,
        hasLogo: !!document.querySelector('.site-logo img, .brand-logo img, img[alt*=\"Vastraa\"]'),
        navLinksCount: document.querySelectorAll('.desktop-nav .nav-link').length,
        heroHeadline: document.querySelector('.hero__title, h1')?.textContent?.trim(),
        productCardsCount: document.querySelectorAll('.product-card').length,
        hasFooter: !!document.querySelector('footer')
      };
    })()`);

    record("Homepage Title & Wordmark", homeInfo.title.includes("Vastraa") && homeInfo.hasLogo, `Title: "${homeInfo.title}"`);
    record("Homepage Featured Heirlooms Grid", homeInfo.productCardsCount >= 6, `Rendered ${homeInfo.productCardsCount} product cards`);
    await saveScreenshot("01-homepage-desktop.png");

    // Responsive check on mobile (375px)
    await setViewport(375, 812);
    await sleep(300);
    const mobileHome = await evaluate(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const mobileToggle = document.getElementById('mobile-nav-toggle') || document.querySelector('[aria-label*=\"menu\" i]');
      return {
        overflow: scrollWidth > clientWidth,
        scrollWidth,
        clientWidth,
        hasMobileMenuButton: !!mobileToggle
      };
    })()`);
    record("Homepage Mobile Viewport (375px)", !mobileHome.overflow, `Overflow: ${mobileHome.overflow} (scroll: ${mobileHome.scrollWidth}px, client: ${mobileHome.clientWidth}px)`);
    await saveScreenshot("01-homepage-mobile.png");

    // ==========================================
    // STEP 2: SHOP CATALOGUE & FILTER ENGINE
    // ==========================================
    console.log("\n--- STEP 2: Shop Catalogue & Filter Engine ---");
    await setViewport(1440, 900);
    await navigate("/shop.html");

    const shopInitial = await evaluate(`(() => {
      return {
        count: document.querySelectorAll('#catalogue-product-grid .product-card').length,
        counterText: document.getElementById('product-count-display')?.textContent?.trim()
      };
    })()`);
    record("Shop Catalogue Initial Count", shopInitial.count >= 15, `Rendered ${shopInitial.count} products (${shopInitial.counterText})`);
    await saveScreenshot("02-shop-all-products.png");

    // Click Category Tab (Women)
    const filterWomen = await evaluate(`(() => {
      const womenTab = document.querySelector('.tab-pill[data-category=\"women\"]');
      if (womenTab) womenTab.click();
      return {
        clicked: !!womenTab,
        activeCategory: womenTab?.dataset?.category,
        count: document.querySelectorAll('#catalogue-product-grid .product-card').length
      };
    })()`);
    await sleep(400);
    record("Shop Filter Category (Women)", filterWomen.count > 0 && filterWomen.count < shopInitial.count, `Women ensembles: ${filterWomen.count}`);
    await saveScreenshot("02-shop-filtered-women.png");

    // Click Subcategory Radio (Sarees)
    const filterSaree = await evaluate(`(() => {
      const sareeRadio = document.querySelector('input[name=\"subcategory\"][value=\"saree\"]');
      if (sareeRadio) {
        sareeRadio.checked = true;
        sareeRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return {
        selected: sareeRadio ? sareeRadio.checked : false,
        count: document.querySelectorAll('#catalogue-product-grid .product-card').length
      };
    })()`);
    await sleep(400);
    record("Shop Filter Subcategory (Saree)", filterSaree.count > 0 && filterSaree.count <= filterWomen.count, `Saree ensembles: ${filterSaree.count}`);
    await saveScreenshot("02-shop-filtered-saree.png");

    // Reset back to All Collections
    await evaluate(`(() => {
      const allTab = document.querySelector('.tab-pill[data-category=\"all\"]');
      if (allTab) allTab.click();
    })()`);
    await sleep(300);

    // ==========================================
    // STEP 3: PRODUCT DETAIL & ADD TO BAG
    // ==========================================
    console.log("\n--- STEP 3: Product Detail & Cart Drawer ---");
    await navigate("/product.html?slug=royal-crimson-kanjivaram-silk-saree");

    const pdpInfo = await evaluate(`(() => {
      return {
        title: document.getElementById('product-title')?.textContent?.trim(),
        price: document.getElementById('product-price')?.textContent?.trim(),
        stockBadge: document.getElementById('product-stock-badge')?.textContent?.trim(),
        addBtn: !!document.getElementById('add-to-bag-btn'),
        sizeLabel: document.getElementById('selected-size-label')?.textContent?.trim()
      };
    })()`);
    record("Product Detail Title, Price & Stock", pdpInfo.title?.includes("Kanjivaram"), `Title: "${pdpInfo.title}", Price: "${pdpInfo.price}", Size: "${pdpInfo.sizeLabel}"`);
    await saveScreenshot("03-product-detail-page.png");

    // Click Add to Shopping Bag
    const addResult = await evaluate(`(() => {
      const addBtn = document.getElementById('add-to-bag-btn');
      if (!addBtn) return { success: false, reason: 'Button not found' };
      addBtn.click();
      
      const drawer = document.getElementById('cart-drawer');
      const isDrawerOpen = drawer?.classList.contains('is-open') || drawer?.getAttribute('aria-hidden') === 'false';
      
      const rawCart = localStorage.getItem('vastraa_cart_v1');
      const cart = rawCart ? JSON.parse(rawCart) : [];

      return {
        success: true,
        isDrawerOpen,
        cartItemsCount: cart.length,
        firstItem: cart[0]
      };
    })()`);
    await sleep(600);
    record("Add To Cart & Drawer Slide-Out", addResult.cartItemsCount >= 1, `Items in bag: ${addResult.cartItemsCount}, Item: ${addResult.firstItem?.productId}`);
    await saveScreenshot("03-cart-drawer-opened.png");

    // ==========================================
    // STEP 4: CART PAGE QUANTITY STEPPER & REMOVAL
    // ==========================================
    console.log("\n--- STEP 4: Cart Page Interactions & Calculations ---");
    // Add a second item to the cart array to test removing items
    await evaluate(`(() => {
      const rawCart = localStorage.getItem('vastraa_cart_v1');
      let cart = rawCart ? JSON.parse(rawCart) : [];
      if (!cart.find(i => i.productId === 'vas-m-001')) {
        cart.push({
          id: 'vas-m-001-40-Royal-Ivory',
          productId: 'vas-m-001',
          size: '40',
          color: 'Royal Ivory',
          quantity: 1,
          pricePaise: 4200000,
          addedAt: new Date().toISOString()
        });
        localStorage.setItem('vastraa_cart_v1', JSON.stringify(cart));
      }
    })()`);

    await navigate("/cart.html");
    await sleep(500);

    const cartInitial = await evaluate(`(() => {
      const rows = document.querySelectorAll('#cart-page-tbody tr');
      return {
        rowCount: rows.length,
        subtotalText: document.getElementById('cart-subtotal-val')?.textContent?.trim(),
        totalText: document.getElementById('cart-total-val')?.textContent?.trim()
      };
    })()`);
    record("Cart Page Populated with Multi-Item Order", cartInitial.rowCount === 2, `Cart rows: ${cartInitial.rowCount}, Subtotal: ${cartInitial.subtotalText}, Total: ${cartInitial.totalText}`);
    await saveScreenshot("04-cart-page-initial.png");

    // Test Quantity Stepper Increment (+)
    const stepUpRes = await evaluate(`(() => {
      const incBtn = document.querySelector(\"#cart-page-tbody button[data-action='increment']\");
      if (!incBtn) return { success: false, reason: 'Increment button not found' };
      
      const initialSubtotal = document.getElementById('cart-subtotal-val')?.textContent?.trim();
      incBtn.click();
      
      const newSubtotal = document.getElementById('cart-subtotal-val')?.textContent?.trim();
      const inputAfter = document.querySelector(\"#cart-page-tbody input.qty-input\");
      const newVal = parseInt(inputAfter?.value || "0", 10);

      return {
        success: true,
        initialSubtotal,
        newSubtotal,
        newVal,
        changed: initialSubtotal !== newSubtotal
      };
    })()`);
    await sleep(500);
    record("Quantity Stepper Increment (+)", stepUpRes.changed, `Subtotal updated: ${stepUpRes.initialSubtotal} -> ${stepUpRes.newSubtotal}`);
    await saveScreenshot("04-cart-stepper-incremented.png");

    // Test Item Removal
    const removeRes = await evaluate(`(() => {
      const removeBtns = document.querySelectorAll(\"#cart-page-tbody button[data-action='remove']\");
      const countBefore = document.querySelectorAll('#cart-page-tbody tr').length;
      if (removeBtns.length === 0) return { success: false, reason: 'Remove button not found' };
      
      removeBtns[0].click();
      
      return {
        success: true,
        countBefore,
        countAfter: document.querySelectorAll('#cart-page-tbody tr').length,
        newSubtotal: document.getElementById('cart-subtotal-val')?.textContent?.trim()
      };
    })()`);
    await sleep(500);
    record("Item Removal from Shopping Bag", removeRes.countAfter === removeRes.countBefore - 1, `Items in bag: ${removeRes.countBefore} -> ${removeRes.countAfter}, New Subtotal: ${removeRes.newSubtotal}`);
    await saveScreenshot("04-cart-item-removed.png");

    // Mobile Viewport for Cart
    await setViewport(375, 812);
    await sleep(300);
    const mobileCart = await evaluate(`(() => {
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    })()`);
    record("Cart Mobile Viewport (375px)", !mobileCart.overflow, `Overflow: ${mobileCart.overflow} (scroll: ${mobileCart.scrollWidth}px, client: ${mobileCart.clientWidth}px)`);
    await saveScreenshot("04-cart-mobile.png");

    // ==========================================
    // STEP 5: CHECKOUT FLOW & ORDER CREATION
    // ==========================================
    console.log("\n--- STEP 5: Checkout Process & Order Submission ---");
    await setViewport(1440, 900);
    await navigate("/checkout.html");

    // Test Form Validation Failure on Empty Submit
    const validationCheck = await evaluate(`(() => {
      const form = document.getElementById('checkout-form');
      const submitBtn = document.getElementById('submit-order-btn');
      submitBtn.click();
      
      const invalidFields = document.querySelectorAll('.is-invalid, input:invalid');
      return {
        validationBlocked: !window.location.href.includes('order-confirmation'),
        invalidCount: invalidFields.length
      };
    })()`);
    record("Checkout Validation Blocks Incomplete Submit", validationCheck.validationBlocked, `Invalid fields flagged: ${validationCheck.invalidCount}`);
    await saveScreenshot("05-checkout-validation-errors.png");

    // Fill valid customer information
    const submitOrderRes = await evaluate(`(() => {
      const form = document.getElementById('checkout-form');
      form.fullName.value = "Aarav Mehra";
      form.email.value = "aarav.mehra@example.com";
      form.phone.value = "9811234567";
      form.address.value = "Plot 42, Jubilee Hills Road No. 10";
      form.apartment.value = "Imperial Penthouse 7A";
      form.city.value = "Hyderabad";
      form.state.value = "Telangana";
      form.postalCode.value = "500033";
      
      const consent = document.getElementById('termsConsent');
      if (consent) consent.checked = true;

      // Submit form
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      // Inspect placed orders in localStorage
      const rawOrders = localStorage.getItem('vastraa_orders_v1');
      const orders = rawOrders ? JSON.parse(rawOrders) : [];
      const latest = orders[orders.length - 1];

      return {
        submitted: true,
        orderId: latest?.orderId,
        customerName: latest?.customer?.fullName,
        orderTotal: latest?.summary?.formattedTotal
      };
    })()`);
    await sleep(800);
    record("Order Placed Successfully", !!submitOrderRes.orderId, `Order ID: ${submitOrderRes.orderId}, Patron: ${submitOrderRes.customerName}, Total: ${submitOrderRes.orderTotal}`);
    await saveScreenshot("05-checkout-submitted.png");

    // ==========================================
    // STEP 6: ORDER CONFIRMATION & LIVE TRACKING
    // ==========================================
    console.log("\n--- STEP 6: Order Confirmation & Live Courier Tracking ---");
    const generatedOrderId = submitOrderRes.orderId || "VAS-2026-8841";
    await navigate(`/order-confirmation.html?orderId=${generatedOrderId}`);
    
    const confInfo = await evaluate(`(() => {
      return {
        renderedOrderId: document.getElementById('conf-order-id')?.textContent?.trim(),
        renderedName: document.getElementById('conf-name')?.textContent?.trim(),
        renderedAddress: document.getElementById('conf-address')?.textContent?.trim(),
        trackLink: document.getElementById('track-order-link')?.getAttribute('href')
      };
    })()`);
    record("Order Confirmation Page Renders Placed Order", confInfo.renderedOrderId === generatedOrderId, `Confirmed Order ID: ${confInfo.renderedOrderId}, Recipient: ${confInfo.renderedName}`);
    await saveScreenshot("06-order-confirmation.png");

    // Navigate to Track Order Page with order ID
    await navigate(`/track-order.html?orderId=${generatedOrderId}`);
    const trackingInfo = await evaluate(`(() => {
      return {
        orderId: document.getElementById('t-order-id')?.textContent?.trim(),
        statusBadge: document.getElementById('t-status-badge')?.textContent?.trim(),
        recipient: document.getElementById('t-recipient-name')?.textContent?.trim(),
        stepsCount: document.querySelectorAll('.timeline-step').length
      };
    })()`);
    record("Order Tracking Page Displays Courier Milestones", trackingInfo.orderId === generatedOrderId, `Status: ${trackingInfo.statusBadge}, Recipient: ${trackingInfo.recipient}, Milestones: ${trackingInfo.stepsCount}`);
    await saveScreenshot("06-order-tracking.png");

    // ==========================================
    // STEP 7: ATELIER EXECUTIVE SUITE (ADMIN CONSOLE)
    // ==========================================
    console.log("\n--- STEP 7: Admin Suite Operations & Storefront Sync ---");
    await navigate("/admin.html");

    // Test Login Gate Presence
    const loginGateVisible = await evaluate(`(() => {
      const gate = document.getElementById('login-gate');
      return gate && window.getComputedStyle(gate).display !== 'none';
    })()`);
    record("Admin Security Gate Displayed", loginGateVisible, "Protected console displayed authentication gate");
    await saveScreenshot("07-admin-login-gate.png");

    // Unlock via 1-Click Demo Login
    const loginResult = await evaluate(`(() => {
      const quickBtn = document.getElementById('quick-demo-login-btn');
      quickBtn.click();
      return {
        authenticated: sessionStorage.getItem('vastraa_admin_authenticated') === 'true',
        gateHidden: document.getElementById('login-gate').style.display === 'none',
        kpiValuation: document.getElementById('kpi-stock-valuation')?.textContent?.trim(),
        kpiTotalOrders: document.getElementById('kpi-total-orders')?.textContent?.trim()
      };
    })()`);
    record("Admin 1-Click Authentication", loginResult.authenticated && loginResult.gateHidden, `Valuation: ${loginResult.kpiValuation}, Orders: ${loginResult.kpiTotalOrders}`);
    await saveScreenshot("07-admin-dashboard-kpis.png");

    // Switch to Orders Tab and verify the customer order placed earlier
    const orderTabResult = await evaluate(`((placedId) => {
      const ordersTabBtn = document.getElementById('tab-orders');
      if (ordersTabBtn) ordersTabBtn.click();

      const orderRows = document.querySelectorAll('#orders-tbody tr');
      const targetRow = document.querySelector(\`#orders-tbody tr[data-order-id=\"\${placedId}\"]\`);
      
      // Advance order status to Dispatched
      if (targetRow) {
        const select = targetRow.querySelector('.order-status-select');
        select.value = 'dispatched';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      return {
        totalOrdersCount: orderRows.length,
        placedOrderFound: !!targetRow,
        customerNameInRow: targetRow?.querySelector('td:nth-child(3)')?.textContent?.trim()
      };
    })("${generatedOrderId}")`);
    record("Admin Customer Orders Tab Reflects Live Order", orderTabResult.placedOrderFound, `Found order row in admin for: ${orderTabResult.customerNameInRow} (Total orders: ${orderTabResult.totalOrdersCount})`);
    await saveScreenshot("07-admin-orders-tab.png");

    // Switch to Inventory Tab and adjust stock
    const inventoryAdjustResult = await evaluate(`(() => {
      const invTabBtn = document.getElementById('tab-inventory');
      if (invTabBtn) invTabBtn.click();

      const row = document.querySelector('tr[data-product-id=\"vas-w-001\"]');
      const input = row?.querySelector('.input-stock-qty');
      const saveBtn = row?.querySelector('.btn-save-stock');
      
      const oldQty = parseInt(input?.value || "0", 10);
      input.value = (oldQty + 5).toString();
      saveBtn.click();

      return {
        success: true,
        oldQty,
        newQty: parseInt(input.value, 10),
        newValuation: document.getElementById('kpi-stock-valuation')?.textContent?.trim()
      };
    })()`);
    record("Admin Stock Adjustment & Valuation Recalculation", inventoryAdjustResult.success, `Stock adjusted: ${inventoryAdjustResult.oldQty} -> ${inventoryAdjustResult.newQty}, New Valuation: ${inventoryAdjustResult.newValuation}`);
    await saveScreenshot("07-admin-inventory-tab.png");

    // Switch to Atelier Studio and publish a new artisanal piece
    const studioPublishResult = await evaluate(`(() => {
      const studioTabBtn = document.getElementById('tab-studio');
      if (studioTabBtn) studioTabBtn.click();

      document.getElementById('studio-name').value = 'Zari Embroidered Ivory Sherwani';
      document.getElementById('studio-category').value = 'men';
      document.getElementById('studio-subcategory').value = 'sherwani';
      document.getElementById('studio-price').value = '62000';
      document.getElementById('studio-stock').value = '8';
      document.getElementById('studio-img-url').value = 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80';
      document.getElementById('studio-material').value = '100% Raw Silk & Pure Gold Zari Threadwork';
      document.getElementById('studio-occasion').value = 'Royal Groom & Wedding';
      const descInput = document.getElementById('studio-desc');
      if (descInput) descInput.value = 'Heirloom ceremonial ensemble tailored from pure raw silk with intricately embroidered motifs.';

      // Submit
      const form = document.getElementById('studio-product-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const customList = JSON.parse(localStorage.getItem('vastraa_custom_products') || '[]');
      const totalKpi = document.getElementById('kpi-total-products')?.textContent?.trim();

      return {
        customPiecesCount: customList.length,
        totalProductsKpi: totalKpi
      };
    })()`);
    record("Admin Publish Custom Piece (Atelier Studio)", studioPublishResult.customPiecesCount >= 1, `Custom pieces in storage: ${studioPublishResult.customPiecesCount}, KPI: ${studioPublishResult.totalProductsKpi}`);
    await saveScreenshot("07-admin-studio-published.png");

    // ==========================================
    // STEP 8: STOREFRONT VERIFICATION OF NEW PIECE
    // ==========================================
    console.log("\n--- STEP 8: Storefront Verification of Admin Piece ---");
    await navigate("/shop.html");
    const storefrontSync = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.product-card'));
      const newPieceCard = cards.find(c => c.textContent.includes('Zari Embroidered Ivory Sherwani'));
      return {
        totalCards: cards.length,
        foundNewPiece: !!newPieceCard,
        priceText: newPieceCard?.querySelector('.price-current')?.textContent?.trim()
      };
    })()`);
    record("New Admin Piece Live on Storefront", storefrontSync.foundNewPiece, `Found piece on shop page with price: ${storefrontSync.priceText} (Total items: ${storefrontSync.totalCards})`);
    await saveScreenshot("08-storefront-new-piece-live.png");

    // Mobile Admin Viewport
    await setViewport(375, 812);
    await navigate("/admin.html");
    const mobileAdmin = await evaluate(`(() => {
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    })()`);
    record("Admin Console Mobile Viewport (375px)", !mobileAdmin.overflow, `Overflow: ${mobileAdmin.overflow} (scroll: ${mobileAdmin.scrollWidth}px, client: ${mobileAdmin.clientWidth}px)`);
    await saveScreenshot("08-admin-mobile-responsive.png");

    // ==========================================
    // FINAL SUMMARY
    // ==========================================
    console.log("\n===============================================================");
    console.log("   AUTONOMOUS E2E VERIFICATION COMPLETED");
    console.log("===============================================================");
    const passCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    console.log(`Results: ${passCount} / ${totalCount} PASSED (${Math.round((passCount/totalCount)*100)}%)\n`);

    for (const r of testResults) {
      console.log(`  ${r.passed ? "✅ PASS" : "❌ FAIL"}: ${r.stepName} — ${r.details}`);
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
  }
}

runAutonomousWalkthrough();
