import { paymentsApi } from "@/api/payments";
import { splitsApi } from "@/api/splits";

import type { SplitFormSchema } from "../data/split-form";
import { isFilledSplitItem, sumFilledItemsCents } from "./split-items";

export type CreateSplitResult = {
  paymentId: string;
};

export async function createSplit(
  values: SplitFormSchema,
  currentUserId: string,
): Promise<CreateSplitResult> {
  const friendIds = [...new Set(values.friendIds)];
  if (friendIds.length === 0) {
    throw new Error("Add at least one friend to split with.");
  }

  const dueAt = values.dueAt.toISOString();
  const items = values.items.filter(isFilledSplitItem);
  const hasItems = items.length > 0;

  if (values.splitMethod === "itemized" && !hasItems) {
    throw new Error("Add at least one item for an itemized split.");
  }

  if (!hasItems && values.totalAmountCents - values.discountAmountCents <= 0) {
    throw new Error("Enter a total greater than the discount.");
  }

  const itemsTotalCents = sumFilledItemsCents(items);
  if (hasItems && itemsTotalCents !== values.totalAmountCents) {
    throw new Error("Item totals must exactly match the bill total.");
  }

  // Without items the API stores total as-is (discount is only applied when
  // items recompute the total), so send the net amount to split.
  const netTotalCents = Math.max(
    0,
    values.totalAmountCents - values.discountAmountCents,
  );

  const payment = await paymentsApi.create({
    title: values.title,
    description: values.description || undefined,
    currency: values.currency,
    totalAmountCents: hasItems ? 0 : netTotalCents,
    discountAmountCents: values.discountAmountCents,
    splitMethod: values.splitMethod,
    dueAt,
    locationName: values.locationName || undefined,
    metadata: values.metadata,
  });

  for (const friendId of friendIds) {
    await paymentsApi.addParticipant(payment.id, friendId);
  }

  const createdItems = [];
  for (const item of items) {
    const created = await paymentsApi.addItem(payment.id, {
      name: item.name,
      description: item.description || undefined,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      category: item.category || undefined,
    });
    createdItems.push(created);
  }

  if (values.splitMethod === "itemized") {
    const assignments = createdItems.map((created, index) => {
      const originalItem = items[index];
      const assignment = values.itemAssignments.find(
        (a) => a.itemLocalId === originalItem?.localId,
      );
      const allocations = (assignment?.allocations ?? [])
        .filter((allocation) => allocation.quantity > 0)
        .map((allocation) => ({
          userId: allocation.userId,
          quantity: allocation.quantity,
        }));

      return {
        paymentItemId: created.id,
        allocations,
      };
    });

    await splitsApi.createItemBased(payment.id, {
      assignments,
      dueAt,
      receiptImage: values.receiptImage,
    });
  } else if (values.splitMethod === "percentage") {
    await splitsApi.createPercentage(payment.id, {
      splits: values.percentageSplits
        .filter((split) => split.percentage > 0)
        .map((split) => ({
          debtorUserId: split.userId,
          percentage: split.percentage,
        })),
      dueAt,
      receiptImage: values.receiptImage,
    });
  } else if (values.splitMethod === "custom") {
    await splitsApi.createCustom(payment.id, {
      splits: values.customSplits
        .filter((split) => split.amountCents > 0)
        .map((split) => ({
          debtorUserId: split.userId,
          amountCents: split.amountCents,
        })),
      dueAt,
      receiptImage: values.receiptImage,
    });
  } else {
    await splitsApi.createEqual(payment.id, {
      debtorUserIds: [...new Set([currentUserId, ...friendIds])],
      dueAt,
      receiptImage: values.receiptImage,
    });
  }

  await paymentsApi.finalize(payment.id);

  return { paymentId: payment.id };
}
