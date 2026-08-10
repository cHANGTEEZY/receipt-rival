export function formatMoney(
  cents: number,
  currency = "USD",
  locale = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/** Distributes totalCents evenly, giving the first `totalCents % count` shares one extra cent. Mirrors the backend's allocateEqualCents. */
export function allocateEqualCents(totalCents: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;
  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

/** Distributes 100% evenly across `count` shares, in hundredths of a percent. */
export function allocateEvenlyPercentages(count: number): number[] {
  if (count <= 0) return [];
  const totalBasisPoints = 10_000;
  const base = Math.floor(totalBasisPoints / count);
  const remainder = totalBasisPoints % count;
  return Array.from(
    { length: count },
    (_, index) => (base + (index < remainder ? 1 : 0)) / 100,
  );
}

/** Distributes a (usually whole-number) item quantity evenly across `count` people. */
export function splitQuantityEvenly(quantity: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(quantity / count);
  const remainderUnits = Math.round(quantity - base * count);
  return Array.from({ length: count }, (_, index) =>
    base + (index < remainderUnits ? 1 : 0),
  );
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "No due date";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
