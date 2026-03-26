/**
 * Price Calculation Utilities
 * Provides reusable methods for calculating and verifying order totals
 * Tax rate is fixed at 8%
 */

const TAX_RATE = 0.08; // 8% tax

export interface PriceDetails {
  price: string;
}

export interface PriceWithTax extends PriceDetails {
  price: string;
  tax: string;
  total: string;
}

export interface CalculatedTotals {
  subtotal: string;
  tax: string;
  total: string;
}

/**
 * Parse price string (e.g., "$29.99") to number
 */
export function parsePrice(priceString: string): number {
  return parseFloat(priceString.replace('$', ''));
}

/**
 * Format number to price string (e.g., 29.99 -> "$29.99")
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate tax from price amount (8% tax)
 */
export function calculateTax(priceAmount: number): number {
  return priceAmount * TAX_RATE;
}

/**
 * Calculate total from price amount (price + tax)
 */
export function calculateTotal(priceAmount: number): number {
  return priceAmount + calculateTax(priceAmount);
}

/**
 * Build complete price object with tax and total calculated from price
 *
 * @param priceString - Price string (e.g., "$49.99")
 * @returns Object with price, tax, and total
 *
 * @example
 * const priceWithTax = buildPriceWithTax('$49.99');
 * // Returns: { price: '$49.99', tax: '$4.00', total: '$53.99' }
 */
export function buildPriceWithTax(priceString: string): PriceWithTax {
  const priceAmount = parsePrice(priceString);
  const taxAmount = calculateTax(priceAmount);
  const totalAmount = calculateTotal(priceAmount);

  return {
    price: priceString,
    tax: formatPrice(taxAmount),
    total: formatPrice(totalAmount),
  };
}

/**
 * Calculate combined totals for multiple products
 *
 * @param products - Array of products with price field
 * @returns Object with calculated subtotal, tax, and total
 *
 * @example
 * const product1 = { price: '$49.99' };
 * const product2 = { price: '$15.99' };
 * const totals = calculateExpectedTotals([product1, product2]);
 * // Returns: { subtotal: '$65.98', tax: '$5.28', total: '$71.26' }
 */
export function calculateExpectedTotals(products: PriceDetails[]): CalculatedTotals {
  const subtotalAmount = products.reduce((sum, product) => sum + parsePrice(product.price), 0);
  const taxAmount = calculateTax(subtotalAmount);
  const totalAmount = calculateTotal(subtotalAmount);

  return {
    subtotal: formatPrice(subtotalAmount),
    tax: formatPrice(taxAmount),
    total: formatPrice(totalAmount),
  };
}

/**
 * Verify price calculation matches expected values
 * Useful for assertions in tests
 *
 * @param products - Array of products with price field
 * @param actual - Actual values returned from the page/API
 * @returns Object indicating if all values match { subtotal, tax, total }
 *
 * @example
 * const matches = verifyPriceCalculation([product1, product2], {
 *   subtotal: '$65.98',
 *   tax: '$5.28',
 *   total: '$71.26'
 * });
 * // Returns: { subtotal: true, tax: true, total: true }
 */
export function verifyPriceCalculation(
  products: PriceDetails[],
  actual: Partial<CalculatedTotals>,
): Record<keyof CalculatedTotals, boolean> {
  const expected = calculateExpectedTotals(products);

  return {
    subtotal: actual.subtotal === expected.subtotal,
    tax: actual.tax === expected.tax,
    total: actual.total === expected.total,
  };
}
