/**
 * Vastraa - Filters & Sorting Engine Unit Tests
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS } from "../js/modules/product-data.js";
import { filterProducts, sortProducts } from "../js/modules/filters.js";

describe("Catalogue Filtering Engine", () => {
  test("Filters by category returns only products in that category", () => {
    const womenOnly = filterProducts(PRODUCTS, { category: "women" });
    assert.ok(womenOnly.length > 0);
    assert.ok(womenOnly.every(p => p.category === "women"));

    const menOnly = filterProducts(PRODUCTS, { category: "men" });
    assert.ok(menOnly.length > 0);
    assert.ok(menOnly.every(p => p.category === "men"));

    const kidsOnly = filterProducts(PRODUCTS, { category: "kids" });
    assert.ok(kidsOnly.length > 0);
    assert.ok(kidsOnly.every(p => p.category === "kids"));
  });

  test("Filters by subcategory (saree, lehenga, sherwani) works accurately", () => {
    const sarees = filterProducts(PRODUCTS, { subcategory: "saree" });
    assert.ok(sarees.length > 0);
    assert.ok(sarees.every(p => p.subcategory === "saree"));

    const sherwanis = filterProducts(PRODUCTS, { subcategory: "sherwani" });
    assert.ok(sherwanis.length > 0);
    assert.ok(sherwanis.every(p => p.subcategory === "sherwani"));
  });

  test("Filters by price range in paise restricts boundaries", () => {
    // Under ₹20,000 (2000000 paise)
    const budget = filterProducts(PRODUCTS, { maxPricePaise: 2000000 });
    assert.ok(budget.length > 0);
    assert.ok(budget.every(p => p.pricePaise <= 2000000));

    // Over ₹50,000 (5000000 paise)
    const luxury = filterProducts(PRODUCTS, { minPricePaise: 5000000 });
    assert.ok(luxury.length > 0);
    assert.ok(luxury.every(p => p.pricePaise >= 5000000));
  });

  test("Impossible filter combination returns empty array gracefully", () => {
    // Men category with saree subcategory (which does not exist)
    const impossible = filterProducts(PRODUCTS, { category: "men", subcategory: "saree" });
    assert.strictEqual(impossible.length, 0);
  });
});

describe("Catalogue Sorting Engine", () => {
  test("Sorting by price ascending orders from lowest to highest price", () => {
    const sorted = sortProducts(PRODUCTS, "price_asc");
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(sorted[i].pricePaise <= sorted[i + 1].pricePaise);
    }
  });

  test("Sorting by price descending orders from highest to lowest price", () => {
    const sorted = sortProducts(PRODUCTS, "price_desc");
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(sorted[i].pricePaise >= sorted[i + 1].pricePaise);
    }
  });

  test("Sorting by featured places featured items first", () => {
    const sorted = sortProducts(PRODUCTS, "featured");
    assert.strictEqual(sorted[0].featured, true);
  });
});
