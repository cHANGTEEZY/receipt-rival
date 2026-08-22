import { allocateEqualCents, formatMoney, splitQuantityEvenly } from "@/utils/money";

import {
  createEmptySplitItem,
  type ItemAllocationForm,
  type SplitItemForm,
} from "../data/split-form";

export const REMAINDER_ITEM_NAME = "Others";
export const REMAINDER_CATEGORY_EVERYONE_ELSE = "remainder:everyone-else";
export const REMAINDER_CATEGORY_EVERYONE = "remainder:everyone";

export type RemainderShare = "everyone-else" | "everyone";

export function isFilledSplitItem(item: SplitItemForm): boolean {
  return Boolean(item.name.trim() || item.unitPriceCents > 0);
}

export function isRemainderItem(item: SplitItemForm): boolean {
  return item.category.startsWith("remainder");
}

export function itemLineTotalCents(item: SplitItemForm): number {
  return Math.round(item.quantity * item.unitPriceCents);
}

export function sumFilledItemsCents(
  items: SplitItemForm[],
  options?: { excludeRemainder?: boolean },
): number {
  return items.reduce((sum, item) => {
    if (!isFilledSplitItem(item)) return sum;
    if (options?.excludeRemainder && isRemainderItem(item)) return sum;
    return sum + itemLineTotalCents(item);
  }, 0);
}

/** Bill leftover after named lines, ignoring any Others bucket. */
export function remainingAfterLinesCents(
  totalAmountCents: number,
  items: SplitItemForm[],
): number {
  return totalAmountCents - sumFilledItemsCents(items, { excludeRemainder: true });
}

export function itemsTotalMismatchMessage(
  totalAmountCents: number,
  items: SplitItemForm[],
  currency = "USD",
): string {
  const remaining = totalAmountCents - sumFilledItemsCents(items);
  if (remaining > 0) {
    return `${formatMoney(remaining, currency)} still left to itemize. Add another line or put the rest on others.`;
  }
  if (remaining < 0) {
    return `Items are ${formatMoney(-remaining, currency)} over the bill total.`;
  }
  return "Item totals must exactly match the bill total.";
}

export function remainderShareOf(item: SplitItemForm): RemainderShare {
  return item.category === REMAINDER_CATEGORY_EVERYONE
    ? "everyone"
    : "everyone-else";
}

export function remainderCategory(share: RemainderShare): string {
  return share === "everyone"
    ? REMAINDER_CATEGORY_EVERYONE
    : REMAINDER_CATEGORY_EVERYONE_ELSE;
}

export function createRemainderItem(
  unitPriceCents: number,
  share: RemainderShare = "everyone-else",
): SplitItemForm {
  return {
    ...createEmptySplitItem(),
    name: REMAINDER_ITEM_NAME,
    quantity: 1,
    unitPriceCents,
    category: remainderCategory(share),
  };
}

/** Keep an existing Others bucket in sync with leftover named lines. */
export function syncRemainderItem(
  items: SplitItemForm[],
  totalAmountCents: number,
): SplitItemForm[] {
  const existing = items.find(isRemainderItem);
  if (!existing) return items;

  const leftover = remainingAfterLinesCents(totalAmountCents, items);
  const withoutRemainder = items.filter((item) => !isRemainderItem(item));

  if (leftover <= 0) return withoutRemainder;

  return [
    ...withoutRemainder,
    {
      ...existing,
      name: REMAINDER_ITEM_NAME,
      quantity: 1,
      unitPriceCents: leftover,
    },
  ];
}

export function putRemainingOnOthers(
  items: SplitItemForm[],
  totalAmountCents: number,
  share: RemainderShare = "everyone-else",
): SplitItemForm[] {
  const leftover = remainingAfterLinesCents(totalAmountCents, items);
  const withoutRemainder = items.filter((item) => !isRemainderItem(item));

  if (leftover <= 0) return withoutRemainder;

  const existing = items.find(isRemainderItem);
  const remainder = existing
    ? {
        ...existing,
        name: REMAINDER_ITEM_NAME,
        quantity: 1,
        unitPriceCents: leftover,
        category: remainderCategory(share),
      }
    : createRemainderItem(leftover, share);

  return [...withoutRemainder, remainder];
}

export function setRemainderShare(
  items: SplitItemForm[],
  share: RemainderShare,
): SplitItemForm[] {
  return items.map((item) =>
    isRemainderItem(item)
      ? { ...item, category: remainderCategory(share) }
      : item,
  );
}

export function remainderAssigneeIds(
  friendIds: string[],
  currentUserId: string | undefined,
  share: RemainderShare,
): string[] {
  if (share === "everyone-else" && currentUserId) {
    const others = friendIds.filter((id) => id !== currentUserId);
    if (others.length > 0) return others;
  }
  return friendIds;
}

/** Split a lump so allocated quantities sum to `quantity` and cents stay even. */
export function splitItemQuantityByCents(
  quantity: number,
  unitPriceCents: number,
  count: number,
): number[] {
  if (count <= 0) return [];

  const totalCents = Math.round(quantity * unitPriceCents);
  if (totalCents <= 0 || unitPriceCents <= 0) {
    return Array.from({ length: count }, () => 0);
  }

  return allocateEqualCents(totalCents, count).map(
    (shareCents) => shareCents / unitPriceCents,
  );
}

export function remainderAllocations(
  item: SplitItemForm,
  friendIds: string[],
  currentUserId: string | undefined,
): ItemAllocationForm[] {
  const assigneeIds = remainderAssigneeIds(
    friendIds,
    currentUserId,
    remainderShareOf(item),
  );
  const quantities = splitItemQuantityByCents(
    item.quantity,
    item.unitPriceCents,
    assigneeIds.length,
  );

  return friendIds.map((userId) => {
    const index = assigneeIds.indexOf(userId);
    return { userId, quantity: index >= 0 ? (quantities[index] ?? 0) : 0 };
  });
}

export function assignedQuantity(
  allocations: ItemAllocationForm[] | undefined,
): number {
  return (allocations ?? []).reduce(
    (sum, allocation) => sum + allocation.quantity,
    0,
  );
}

export function unassignedAmountCents(
  item: SplitItemForm,
  allocations: ItemAllocationForm[] | undefined,
): number {
  const remainingQuantity = item.quantity - assignedQuantity(allocations);
  return Math.round(remainingQuantity * item.unitPriceCents);
}

export function addRemainingQuantityTo(
  item: SplitItemForm,
  allocations: ItemAllocationForm[],
  friendIds: string[],
  targetIds: string[],
  options?: { byCents?: boolean },
): ItemAllocationForm[] {
  const remainingQty = item.quantity - assignedQuantity(allocations);
  const currentFor = (userId: string) =>
    allocations.find((allocation) => allocation.userId === userId)?.quantity ??
    0;

  if (remainingQty <= 0.001 || targetIds.length === 0) {
    return friendIds.map((userId) => ({
      userId,
      quantity: currentFor(userId),
    }));
  }

  const extras = options?.byCents
    ? splitItemQuantityByCents(
        remainingQty,
        item.unitPriceCents,
        targetIds.length,
      )
    : splitQuantityEvenly(remainingQty, targetIds.length);

  return friendIds.map((userId) => {
    const extraIndex = targetIds.indexOf(userId);
    return {
      userId,
      quantity: currentFor(userId) + (extras[extraIndex] ?? 0),
    };
  });
}
