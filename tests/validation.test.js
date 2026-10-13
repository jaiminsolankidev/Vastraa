/**
 * Vastraa - Form Validation Unit Tests
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { VALIDATION_RULES } from "../js/modules/validation.js";

describe("Validation Rules Engine", () => {
  test("Required field rule checks non-empty strings", () => {
    assert.strictEqual(VALIDATION_RULES.required(""), false);
    assert.strictEqual(VALIDATION_RULES.required("   "), false);
    assert.strictEqual(VALIDATION_RULES.required(null), false);
    assert.strictEqual(VALIDATION_RULES.required(undefined), false);
    assert.strictEqual(VALIDATION_RULES.required("Ananya Sharma"), true);
  });

  test("Email rule checks standard email format", () => {
    assert.strictEqual(VALIDATION_RULES.email("invalid-email"), false);
    assert.strictEqual(VALIDATION_RULES.email("test@domain"), false);
    assert.strictEqual(VALIDATION_RULES.email("user@example.com"), true);
    assert.strictEqual(VALIDATION_RULES.email("ananya.sharma@vastraa.co.in"), true);
  });

  test("Phone rule validates 10-digit Indian phone numbers with/without +91", () => {
    assert.strictEqual(VALIDATION_RULES.phone("123"), false);
    assert.strictEqual(VALIDATION_RULES.phone("1234567890"), false); // starts with 1
    assert.strictEqual(VALIDATION_RULES.phone("9876543210"), true); // starts with 9
    assert.strictEqual(VALIDATION_RULES.phone("+91 98765 43210"), true);
    assert.strictEqual(VALIDATION_RULES.phone("8123456789"), true);
  });

  test("PIN code rule validates 6-digit Indian postal code", () => {
    assert.strictEqual(VALIDATION_RULES.pinCode("012345"), false); // starts with 0
    assert.strictEqual(VALIDATION_RULES.pinCode("56000"), false); // 5 digits
    assert.strictEqual(VALIDATION_RULES.pinCode("5600010"), false); // 7 digits
    assert.strictEqual(VALIDATION_RULES.pinCode("560001"), true);
    assert.strictEqual(VALIDATION_RULES.pinCode("110001"), true);
  });
});
