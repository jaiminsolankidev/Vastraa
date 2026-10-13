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

async function runExhaustiveAudit() {
  console.log("=====================================================================");
  console.log("   VASTRAA MASTER FULL-SITE & COMPONENT EXHAUSTIVE AUDIT");
  console.log("   Testing every single component, feature, route, and responsive mode");
  console.log("=====================================================================\n");

  const chromeProc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--no-sandbox",
    "--disable-gpu",
    "--window-size=1440,900",
    "--disable-dev-shm-usage"
  ]);

  await sleep(1800);

  let ws;
  try {
    const targetsRes = await fetch("http://127.0.0.1:9225/json");
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];

    if (!pageTarget) {
      throw new Error("No Chrome page target found on port 9225");
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
      await sleep(1500);
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

    // =========================================================================
    // SECTION 1: ALL 18 HTML ROUTES INTEGRITY AUDIT
    // =========================================================================
    console.log("\n=====================================================================");
    console.log("   SECTION 1: STATIC ROUTE INTEGRITY & OVERFLOW CHECK (18 PAGES)");
    console.log("=====================================================================");

    const pages = [
      { path: "/", name: "Homepage" },
      { path: "/shop.html", name: "Shop All Collections" },
      { path: "/shop.html?category=women", name: "Shop Women" },
      { path: "/shop.html?category=men", name: "Shop Men" },
      { path: "/shop.html?category=kids", name: "Shop Kids" },
      { path: "/product.html?slug=royal-crimson-kanjivaram-silk-saree", name: "Product Detail (Kanjivaram)" },
      { path: "/cart.html", name: "Shopping Bag" },
      { path: "/checkout.html", name: "Checkout Preview" },
      { path: "/order-confirmation.html", name: "Order Confirmation" },
      { path: "/track-order.html", name: "Track Order" },
      { path: "/wishlist.html", name: "Saved Wishlist" },
      { path: "/search.html", name: "Search Catalogue" },
      { path: "/about.html", name: "Our Heritage" },
      { path: "/contact.html", name: "Contact Atelier" },
      { path: "/faq.html", name: "FAQ" },
      { path: "/shipping-policy.html", name: "Shipping Policy" },
      { path: "/returns-policy.html", name: "Returns Policy" },
      { path: "/privacy-policy.html", name: "Privacy Policy" },
      { path: "/terms.html", name: "Terms of Service" },
      { path: "/404.html", name: "404 Page" },
      { path: "/admin.html", name: "Atelier Executive Suite" }
    ];

    for (const pg of pages) {
      await setViewport(1440, 900);
      await navigate(pg.path);
      const audit = await evaluate(`(() => {
        return {
          title: document.title,
          hasH1: !!document.querySelector('h1, .hero__title, .banner-title, #order-modal-title'),
          hasHeader: !!document.querySelector('header, .site-header, .admin-page__header'),
          hasFooter: !!document.querySelector('footer, .site-footer, .admin-page__footer'),
          overflowDesktop: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          scrollWidthD: document.documentElement.scrollWidth,
          clientWidthD: document.documentElement.clientWidth
        };
      })()`);

      // Check Mobile (375px)
      await setViewport(375, 812);
      await sleep(200);
      const mobileAudit = await evaluate(`(() => {
        return {
          overflowMobile: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          scrollWidthM: document.documentElement.scrollWidth,
          clientWidthM: document.documentElement.clientWidth
        };
      })()`);

      const passed = !audit.overflowDesktop && !mobileAudit.overflowMobile && !!audit.title;
      record(
        `Route: ${pg.name}`,
        passed,
        `Title: "${audit.title.slice(0, 35)}..." | Desktop Overflow: ${audit.overflowDesktop} | Mobile Overflow: ${mobileAudit.overflowMobile}`
      );
    }

    // =========================================================================
    // SECTION 2: CART OPERATIONS & INTEGER-PAISE MATH
    // =========================================================================
    console.log("\n=====================================================================");
    console.log("   SECTION 2: CART OPERATIONS, STEPPERS, COUPONS & REMOVAL");
    console.log("=====================================================================");

    await setViewport(1440, 900);
    // Clear cart first
    await evaluate(`localStorage.removeItem('vastraa_cart_v1'); localStorage.removeItem('vastraa_promo_v1');`);

    // 1. Visit PDP and Add to Bag
    await navigate("/product.html?slug=royal-crimson-kanjivaram-silk-saree");
    const pdpAdd = await evaluate(`(() => {
      // Select size if needed
      const sizeBtn = document.querySelector('.size-choice-btn');
      if (sizeBtn) sizeBtn.click();
      
      const addBtn = document.getElementById('add-to-bag-btn');
      if (addBtn) addBtn.click();

      const rawCart = localStorage.getItem('vastraa_cart_v1');
      const cart = rawCart ? JSON.parse(rawCart) : [];
      return {
        cartLength: cart.length,
        item: cart[0]
      };
    })()`);
    await sleep(400);
    record("Add to Bag from PDP", pdpAdd.cartLength === 1, `Items in bag: ${pdpAdd.cartLength}, Product: ${pdpAdd.item?.productId}`);
    await saveScreenshot("audit-01-pdp-added.png");

    // 2. Add second item directly to test multi-item cart
    await evaluate(`(() => {
      const rawCart = localStorage.getItem('vastraa_cart_v1');
      let cart = rawCart ? JSON.parse(rawCart) : [];
      cart.push({
        id: 'vas-m-001-40-Ivory',
        productId: 'vas-m-001',
        size: '40',
        color: 'Ivory',
        quantity: 1,
        pricePaise: 4200000,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem('vastraa_cart_v1', JSON.stringify(cart));
    })()`);

    // 3. Visit Cart Page
    await navigate("/cart.html");
    const cartState1 = await evaluate(`(() => {
      const rows = document.querySelectorAll('#cart-page-tbody tr');
      const subtotal = document.getElementById('cart-subtotal-val')?.textContent?.trim();
      const total = document.getElementById('cart-total-val')?.textContent?.trim();
      return { rowCount: rows.length, subtotal, total };
    })()`);
    record("Cart Page Multi-Item Rendering", cartState1.rowCount === 2, `Rows: ${cartState1.rowCount}, Subtotal: ${cartState1.subtotal}, Total: ${cartState1.total}`);
    await saveScreenshot("audit-02-cart-multi-item.png");

    // 4. Test Quantity Stepper Increment (+)
    const incTest = await evaluate(`(() => {
      const incBtn = document.querySelector("#cart-page-tbody button[data-action='increment']");
      const subtotalBefore = document.getElementById('cart-subtotal-val')?.textContent?.trim();
      if (incBtn) incBtn.click();
      return { subtotalBefore, clicked: !!incBtn };
    })()`);
    await sleep(400);
    const incTestAfter = await evaluate(`(() => {
      return {
        subtotalAfter: document.getElementById('cart-subtotal-val')?.textContent?.trim(),
        inputVal: document.querySelector('#cart-page-tbody input.qty-input')?.value
      };
    })()`);
    record(
      "Cart Quantity Increment (+)",
      incTest.subtotalBefore !== incTestAfter.subtotalAfter && incTestAfter.inputVal === "2",
      `Subtotal changed: ${incTest.subtotalBefore} -> ${incTestAfter.subtotalAfter}, Input: ${incTestAfter.inputVal}`
    );
    await saveScreenshot("audit-03-cart-stepper-increment.png");

    // 5. Test Coupon Code VASTRAA10
    const couponTest = await evaluate(`(() => {
      const promoInput = document.getElementById('promo-input');
      const applyBtn = document.getElementById('apply-promo-btn');
      if (promoInput) promoInput.value = "VASTRAA10";
      if (applyBtn) applyBtn.click();
      return { applied: true };
    })()`);
    await sleep(400);
    const couponState = await evaluate(`(() => {
      const promoTag = document.querySelector('.promo-applied-tag');
      const discountText = document.querySelector('#promo-row-container span:nth-child(2)')?.textContent?.trim();
      const totalAfterDiscount = document.getElementById('cart-total-val')?.textContent?.trim();
      return {
        hasTag: !!promoTag,
        discountText,
        totalAfterDiscount
      };
    })()`);
    record("Privilege Promo Code VASTRAA10 Application", couponState.hasTag, `Discount Applied: ${couponState.discountText}, New Total: ${couponState.totalAfterDiscount}`);
    await saveScreenshot("audit-04-cart-promo-applied.png");

    // 6. Test Item Removal
    const removeTest = await evaluate(`(() => {
      const rmBtns = document.querySelectorAll("#cart-page-tbody button[data-action='remove']");
      const countBefore = rmBtns.length;
      if (rmBtns[0]) rmBtns[0].click();
      return { countBefore };
    })()`);
    await sleep(400);
    const removeState = await evaluate(`(() => {
      return {
        countAfter: document.querySelectorAll('#cart-page-tbody tr').length,
        subtotal: document.getElementById('cart-subtotal-val')?.textContent?.trim()
      };
    })()`);
    record("Cart Item Removal", removeState.countAfter === removeTest.countBefore - 1, `Items in bag: ${removeTest.countBefore} -> ${removeState.countAfter}, New Subtotal: ${removeState.subtotal}`);
    await saveScreenshot("audit-05-cart-item-removed.png");

    // =========================================================================
    // SECTION 3: CHECKOUT VALIDATION & DEMO ORDER CREATION
    // =========================================================================
    console.log("\n=====================================================================");
    console.log("   SECTION 3: CHECKOUT VALIDATION & DEMO ORDER FLOW");
    console.log("=====================================================================");

    await navigate("/checkout.html");
    // Test validation blocks empty submit
    const emptySubmit = await evaluate(`(() => {
      const btn = document.getElementById('submit-order-btn');
      if (btn) btn.click();
      const invalidCount = document.querySelectorAll('.is-invalid, :invalid').length;
      return {
        blocked: !window.location.href.includes('order-confirmation'),
        invalidCount
      };
    })()`);
    record("Checkout Incomplete Submit Blocked", emptySubmit.blocked, `Blocked navigation, invalid fields flagged: ${emptySubmit.invalidCount}`);

    // Fill valid patron info and submit
    const submitOrder = await evaluate(`(() => {
      const form = document.getElementById('checkout-form');
      form.fullName.value = "Meera Singhania";
      form.email.value = "meera.singhania@example.com";
      form.phone.value = "9820011223";
      form.address.value = "Villa 14, Lavelle Road";
      form.apartment.value = "The Penthouse";
      form.city.value = "Bengaluru";
      form.state.value = "Karnataka";
      form.postalCode.value = "560001";
      
      const consent = document.getElementById('termsConsent');
      if (consent) consent.checked = true;

      form.dispatchEvent(new Event('submit', { cancelable: true }));

      const orders = JSON.parse(localStorage.getItem('vastraa_orders_v1') || '[]');
      const latest = orders[orders.length - 1];
      return {
        orderId: latest?.orderId,
        patron: latest?.customer?.fullName,
        total: latest?.summary?.formattedTotal
      };
    })()`);
    await sleep(600);
    record("Demo Order Placed Successfully", !!submitOrder.orderId, `Order ID: ${submitOrder.orderId}, Patron: ${submitOrder.patron}, Total: ${submitOrder.total}`);
    await saveScreenshot("audit-06-checkout-order-placed.png");

    // Verify Order Confirmation Page
    await navigate(`/order-confirmation.html?orderId=${submitOrder.orderId}`);
    const confDetails = await evaluate(`(() => {
      return {
        orderId: document.getElementById('conf-order-id')?.textContent?.trim(),
        name: document.getElementById('conf-name')?.textContent?.trim(),
        address: document.getElementById('conf-address')?.textContent?.trim(),
        total: document.getElementById('conf-total')?.textContent?.trim()
      };
    })()`);
    record("Order Confirmation Page Receipt", confDetails.orderId === submitOrder.orderId, `Order: ${confDetails.orderId}, Recipient: ${confDetails.name}, Total: ${confDetails.total}`);
    await saveScreenshot("audit-07-order-confirmation.png");

    // Verify Track Order Milestone Progress
    await navigate(`/track-order.html?orderId=${submitOrder.orderId}`);
    const trackDetails = await evaluate(`(() => {
      return {
        orderId: document.getElementById('t-order-id')?.textContent?.trim(),
        statusBadge: document.getElementById('t-status-badge')?.textContent?.trim(),
        steps: document.querySelectorAll('.timeline-step').length
      };
    })()`);
    record("Courier Track Order Milestones", trackDetails.orderId === submitOrder.orderId, `Status: ${trackDetails.statusBadge}, Courier milestones: ${trackDetails.steps}`);
    await saveScreenshot("audit-08-track-order.png");

    // =========================================================================
    // SECTION 4: ADMIN CONSOLE DEEP AUDIT (STOCK EDITING & INVOICE MODAL)
    // =========================================================================
    console.log("\n=====================================================================");
    console.log("   SECTION 4: ATELIER ADMIN SUITE (STOCK AUTO-SAVE & INVOICE SLIP)");
    console.log("=====================================================================");

    await navigate("/admin.html");

    // Unlock Gate via 1-Click
    await evaluate(`(() => {
      const btn = document.getElementById('quick-demo-login-btn');
      if (btn) btn.click();
    })()`);
    await sleep(400);

    // Verify Orders Tab & Open Slip / Invoice Modal
    const invoiceModalTest = await evaluate(`((placedId) => {
      const tabOrders = document.getElementById('tab-orders');
      if (tabOrders) tabOrders.click();

      // Find Slip / Invoice button for placed order
      const targetRow = document.querySelector(\`#orders-tbody tr[data-order-id=\"\${placedId}\"]\`);
      const invBtn = targetRow ? targetRow.querySelector('.btn-view-invoice') : document.querySelector('.btn-view-invoice');
      
      if (invBtn) invBtn.click();

      const modal = document.getElementById('order-details-modal');
      const isOpen = modal && (modal.open || modal.hasAttribute('open') || modal.style.display !== 'none');
      const bodyHtml = document.getElementById('order-modal-body')?.innerHTML || '';
      const orderIdRendered = document.getElementById('order-modal-id')?.textContent?.trim();

      return {
        isOpen,
        orderIdRendered,
        hasBranding: bodyHtml.includes('VASTRAA ATELIER'),
        hasGSTIN: bodyHtml.includes('GSTIN'),
        bodyLength: bodyHtml.length
      };
    })("${submitOrder.orderId}")`);

    record(
      "Admin Order Slip / Invoice Modal Launch",
      invoiceModalTest.isOpen && invoiceModalTest.hasBranding && invoiceModalTest.hasGSTIN,
      `Invoice Modal Opened: ${invoiceModalTest.isOpen}, Order: ${invoiceModalTest.orderIdRendered}, Tax Branding: ${invoiceModalTest.hasBranding}`
    );
    await saveScreenshot("audit-09-admin-invoice-modal.png");

    // Close invoice modal via closeOrderModal
    await evaluate(`window.closeOrderModal();`);
    await sleep(300);

    // TEST INLINE STOCK AUTO-SAVE:
    // Switch to Inventory Matrix tab
    await evaluate(`document.getElementById('tab-inventory')?.click();`);
    await sleep(300);

    // Get current stock of vas-w-001
    const initialStock = await evaluate(`(() => {
      const row = document.querySelector('tr[data-product-id=\"vas-w-001\"]');
      const input = row?.querySelector('.input-stock-qty');
      return parseInt(input?.value || "0", 10);
    })()`);

    // Click + button twice
    const plusTest = await evaluate(`(() => {
      const row = document.querySelector('tr[data-product-id=\"vas-w-001\"]');
      const plusBtn = row?.querySelector('.btn-qty-plus');
      if (plusBtn) {
        plusBtn.click();
        plusBtn.click();
      }
      const overrides = JSON.parse(localStorage.getItem('vastraa_stock_overrides') || '{}');
      const input = row?.querySelector('.input-stock-qty');
      return {
        valInInput: parseInt(input?.value || "0", 10),
        storedQty: overrides['vas-w-001']?.stockQuantity
      };
    })()`);
    record(
      "Inline Stock Auto-Save on [+] Button Click",
      plusTest.valInInput === initialStock + 2 && plusTest.storedQty === initialStock + 2,
      `Stock adjusted: ${initialStock} -> ${plusTest.valInInput}, Stored in localStorage: ${plusTest.storedQty}`
    );
    await saveScreenshot("audit-10-admin-stock-incremented.png");

    // Click - button once
    const minusTest = await evaluate(`(() => {
      const row = document.querySelector('tr[data-product-id=\"vas-w-001\"]');
      const minusBtn = row?.querySelector('.btn-qty-minus');
      if (minusBtn) minusBtn.click();
      const overrides = JSON.parse(localStorage.getItem('vastraa_stock_overrides') || '{}');
      const input = row?.querySelector('.input-stock-qty');
      return {
        valInInput: parseInt(input?.value || "0", 10),
        storedQty: overrides['vas-w-001']?.stockQuantity
      };
    })()`);
    record(
      "Inline Stock Auto-Save on [-] Button Click",
      minusTest.valInInput === initialStock + 1 && minusTest.storedQty === initialStock + 1,
      `Stock adjusted: ${plusTest.valInInput} -> ${minusTest.valInInput}, Stored in localStorage: ${minusTest.storedQty}`
    );

    // Test Out-Of-Stock Handling on Storefront PDP:
    // Set stock to 0 via saveStockRow
    await evaluate(`window.saveStockRow("vas-w-001", "0", false);`);
    await sleep(300);

    // Visit PDP and verify "Sold Out" state
    await navigate("/product.html?slug=royal-crimson-kanjivaram-silk-saree");
    const outOfStockPDP = await evaluate(`(() => {
      const badge = document.getElementById('product-stock-badge');
      const addBtn = document.getElementById('add-to-bag-btn');
      return {
        badgeText: badge?.textContent?.trim(),
        btnText: addBtn?.textContent?.trim(),
        btnDisabled: addBtn ? addBtn.disabled : false
      };
    })()`);
    record(
      "Storefront PDP Reflects Zero Stock (Sold Out)",
      outOfStockPDP.btnDisabled && outOfStockPDP.btnText === "Sold Out",
      `Badge: "${outOfStockPDP.badgeText}", Button: "${outOfStockPDP.btnText}", Disabled: ${outOfStockPDP.btnDisabled}`
    );
    await saveScreenshot("audit-11-pdp-sold-out.png");

    // Restore stock back to 10
    await evaluate(`(() => {
      const overrides = JSON.parse(localStorage.getItem('vastraa_stock_overrides') || '{}');
      overrides['vas-w-001'] = { stockQuantity: 10, availability: 'in_stock' };
      localStorage.setItem('vastraa_stock_overrides', JSON.stringify(overrides));
      window.dispatchEvent(new CustomEvent('vastraa:stock-updated', { detail: { productId: 'vas-w-001', stockQuantity: 10, availability: 'in_stock' } }));
    })()`);
    await sleep(300);

    await navigate("/product.html?slug=royal-crimson-kanjivaram-silk-saree");
    const restoredPDP = await evaluate(`(() => {
      const badge = document.getElementById('product-stock-badge');
      const addBtn = document.getElementById('add-to-bag-btn');
      return {
        badgeText: badge?.textContent?.trim(),
        btnText: addBtn?.textContent?.trim(),
        btnDisabled: addBtn ? addBtn.disabled : false
      };
    })()`);
    record(
      "Storefront PDP Restored to In-Stock on Replenishment",
      !restoredPDP.btnDisabled && restoredPDP.btnText === "Add to Shopping Bag",
      `Badge: "${restoredPDP.badgeText}", Button: "${restoredPDP.btnText}", Disabled: ${restoredPDP.btnDisabled}`
    );
    await saveScreenshot("audit-12-pdp-restored.png");

    // =========================================================================
    // SECTION 5: FINAL AUDIT SUMMARY REPORT
    // =========================================================================
    console.log("\n=====================================================================");
    console.log("   EXHAUSTIVE AUDIT EXECUTION COMPLETED");
    console.log("=====================================================================");
    const passCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    console.log(`\nOVERALL SCORE: ${passCount} / ${totalCount} PASSED (${Math.round((passCount/totalCount)*100)}%)\n`);

    for (const r of testResults) {
      console.log(`  ${r.passed ? "✅ PASS" : "❌ FAIL"}: ${r.stepName} — ${r.details}`);
    }

    if (passCount === totalCount) {
      console.log("\n🌟 ALL SYSTEMS, FEATURES, AND VIEWPORTS FULLY VERIFIED!");
    } else {
      console.log(`\n⚠️ ${totalCount - passCount} checks failed. See details above.`);
    }

  } catch (err) {
    console.error("Audit encountered an error:", err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
  }
}

runExhaustiveAudit();
