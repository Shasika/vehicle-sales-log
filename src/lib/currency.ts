/**
 * Formats a number as currency in Sri Lankan Rupees (Rs.)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Alternative format that shows "Rs. X,XXX.XX" instead of "LKR X,XXX.XX"
 * @param amount - The amount to format
 * @returns Formatted currency string with Rs. prefix
 */
export function formatCurrencyWithRs(amount: number): string {
  const formatted = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `Rs. ${formatted}`;
}