/**
 * Format a USD amount for display. Prices in Scribe are micropayments and can
 * be sub-cent, so we allow up to 4 decimals while always showing at least 2.
 */
export function formatUsd(value: string | number): string {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(num)) return "$0.00";
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return `$${formatted}`;
}

/**
 * Sum a list of USD amount strings without binary float drift. Amounts are
 * micropayments (down to ~4 dp), so we accumulate in integer micro-dollars and
 * return a plain decimal string suitable for a Decimal column.
 */
export function sumUsd(amounts: string[]): string {
  const micros = amounts.reduce((total, amount) => {
    const value = parseFloat(amount);
    if (!Number.isFinite(value)) return total;
    return total + Math.round(value * 1_000_000);
  }, 0);
  // Render with full micro precision, then trim trailing zeros but keep >= 2 dp.
  const fixed = (micros / 1_000_000).toFixed(6).replace(/0+$/, "");
  return fixed.endsWith(".") ? `${fixed}00` : fixed.replace(/(\.\d)$/, "$10");
}
