/**
 * Vastraa - Product Search Module
 * Tokenized multi-attribute search across title, description, material, and tags.
 */

import { PRODUCTS } from "./product-data.js";

export function searchProducts(query, dataset = PRODUCTS) {
  if (!query || typeof query !== "string") return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) return [];

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  return dataset.filter(product => {
    const searchableText = [
      product.name,
      product.category,
      product.subcategory,
      product.material,
      product.occasion,
      product.description,
      ...(product.availableColors ? product.availableColors.map(c => c.name) : [])
    ].join(" ").toLowerCase();

    // Must match all tokens
    return tokens.every(token => searchableText.includes(token));
  });
}
