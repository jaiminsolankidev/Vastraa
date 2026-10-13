/**
 * Vastraa - Catalogue Filter & Sorting Engine
 * Pure functional filtering and sorting operating on the product dataset.
 */

export function filterProducts(products, filters = {}) {
  return products.filter(product => {
    // 1. Category filter
    if (filters.category && filters.category !== "all") {
      if (product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // 2. Subcategory filter
    if (filters.subcategory && filters.subcategory !== "all") {
      if (product.subcategory.toLowerCase() !== filters.subcategory.toLowerCase()) {
        return false;
      }
    }

    // 3. Occasion filter
    if (filters.occasion && filters.occasion !== "all") {
      if (product.occasion.toLowerCase() !== filters.occasion.toLowerCase()) {
        return false;
      }
    }

    // 4. Size filter
    if (filters.size && filters.size !== "all") {
      const hasSize = product.availableSizes.some(s => 
        s.toLowerCase().includes(filters.size.toLowerCase())
      );
      if (!hasSize) return false;
    }

    // 5. Price Range filter (in Paise)
    if (filters.minPricePaise && product.pricePaise < filters.minPricePaise) {
      return false;
    }
    if (filters.maxPricePaise && product.pricePaise > filters.maxPricePaise) {
      return false;
    }

    // 6. Availability filter
    if (filters.inStockOnly) {
      if (product.availability !== "in_stock" || product.stockQuantity <= 0) {
        return false;
      }
    }

    return true;
  });
}

export function sortProducts(products, sortBy = "featured") {
  const list = [...products];

  switch (sortBy) {
    case "price_asc":
      return list.sort((a, b) => a.pricePaise - b.pricePaise);

    case "price_desc":
      return list.sort((a, b) => b.pricePaise - a.pricePaise);

    case "newest":
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    case "featured":
    default:
      return list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }
}
