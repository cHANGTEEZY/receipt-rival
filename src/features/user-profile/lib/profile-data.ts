import type {
  DeadbeatLeaderboard,
  DeadbeatLeaderboardEntry,
} from "@/api/deadbeat";
import type { PaymentSplit } from "@/api/splits";

import type { CurrencyTotal } from "@/features/home/lib/balances";

export type CounterpartyBalance = {
  /** This user owes the current user. */
  theyOweYou: CurrencyTotal;
  /** The current user owes this user. */
  youOweThem: CurrencyTotal;
};

function sumPendingByCurrency(
  splits: PaymentSplit[],
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const split of splits) {
    if (split.status !== "pending") continue;
    const currency = split.currency || "USD";
    totals.set(currency, (totals.get(currency) ?? 0) + split.amountCents);
  }

  return totals;
}

/** Picks the currency with the largest pending total (mirrors home balances). */
function primaryTotal(splits: PaymentSplit[]): CurrencyTotal {
  const totals = sumPendingByCurrency(splits);
  let primary: CurrencyTotal = { currency: "USD", amountCents: 0 };

  for (const [currency, amountCents] of totals) {
    if (amountCents > primary.amountCents) {
      primary = { currency, amountCents };
    }
  }

  return primary;
}

/**
 * Balances between the current user and one counterparty, derived from
 * owed-by-me / owed-to-me split lists.
 */
export function deriveCounterpartyBalance({
  userId,
  owedByMe,
  owedToMe,
}: {
  userId: string;
  owedByMe: PaymentSplit[];
  owedToMe: PaymentSplit[];
}): CounterpartyBalance {
  return {
    theyOweYou: primaryTotal(
      owedToMe.filter((split) => split.debtorUserId === userId),
    ),
    youOweThem: primaryTotal(
      owedByMe.filter((split) => split.creditorUserId === userId),
    ),
  };
}

export type UserRankSummary = {
  shame?: DeadbeatLeaderboardEntry;
  fame?: DeadbeatLeaderboardEntry;
};

/** Finds a user's shame/fame leaderboard entries, if ranked. */
export function findUserRankEntries(
  leaderboard: DeadbeatLeaderboard | undefined,
  userId: string,
): UserRankSummary {
  if (!leaderboard || !userId) return {};

  return {
    shame: leaderboard.shame.entries.find((entry) => entry.user.id === userId),
    fame: leaderboard.fame.entries.find((entry) => entry.user.id === userId),
  };
}

export type SharedSplitRow = {
  key: string;
  split: PaymentSplit;
  /** "they_owe" → they owe current user; "you_owe" → current user owes them. */
  direction: "they_owe" | "you_owe";
};

/**
 * Pending + settled splits shared with this user, newest first.
 */
export function collectSharedSplitRows({
  userId,
  owedByMe,
  owedToMe,
  limit = 10,
}: {
  userId: string;
  owedByMe: PaymentSplit[];
  owedToMe: PaymentSplit[];
  limit?: number;
}): SharedSplitRow[] {
  const rows: SharedSplitRow[] = [];

  for (const split of owedToMe) {
    if (split.debtorUserId !== userId) continue;
    if (split.status === "cancelled" || split.status === "forgiven") continue;
    rows.push({ key: `they-${split.id}`, split, direction: "they_owe" });
  }

  for (const split of owedByMe) {
    if (split.creditorUserId !== userId) continue;
    if (split.status === "cancelled" || split.status === "forgiven") continue;
    rows.push({ key: `you-${split.id}`, split, direction: "you_owe" });
  }

  rows.sort(
    (a, b) =>
      new Date(b.split.createdAt).getTime() -
      new Date(a.split.createdAt).getTime(),
  );

  return rows.slice(0, limit);
}

export function formatMemberSince(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}
