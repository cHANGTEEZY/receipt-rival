import type { PaymentSplit } from "@/api/splits";

export type CurrencyTotal = {
  currency: string;
  amountCents: number;
};

function sumPendingByCurrency(splits: PaymentSplit[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const split of splits) {
    if (split.status !== "pending") continue;
    const currency = split.currency || "USD";
    totals.set(currency, (totals.get(currency) ?? 0) + split.amountCents);
  }

  return totals;
}

export function primaryPendingTotal(
  splits: PaymentSplit[] | undefined,
): CurrencyTotal {
  const totals = sumPendingByCurrency(splits ?? []);
  let primary: CurrencyTotal = { currency: "USD", amountCents: 0 };

  for (const [currency, amountCents] of totals) {
    if (amountCents > primary.amountCents) {
      primary = { currency, amountCents };
    }
  }

  return primary;
}
