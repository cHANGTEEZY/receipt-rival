import { z } from "zod";

export const receiptImageSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export type ReceiptImage = z.infer<typeof receiptImageSchema>;

export const splitItemSchema = z
  .object({
    localId: z.string().min(1),
    name: z.string().max(150, "Item name must be 150 characters or less."),
    description: z
      .string()
      .max(5000, "Description must be 5000 characters or less."),
    quantity: z
      .number()
      .positive("Quantity must be greater than zero.")
      .max(1_000_000, "Quantity is too large."),
    unitPriceCents: z
      .number()
      .int()
      .min(0, "Price cannot be negative.")
      .max(1_000_000_000, "Price is too large."),
    category: z.string().max(80, "Category must be 80 characters or less."),
  })
  .superRefine((item, ctx) => {
    const isBlank = !item.name.trim() && item.unitPriceCents <= 0;
    if (isBlank) return;

    if (!item.name.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Enter an item name.",
      });
    }
  });

export type SplitItemForm = z.infer<typeof splitItemSchema>;

export const itemAllocationFormSchema = z.object({
  userId: z.string().min(1),
  quantity: z.number().min(0),
});

export type ItemAllocationForm = z.infer<typeof itemAllocationFormSchema>;

export const itemAssignmentFormSchema = z.object({
  itemLocalId: z.string().min(1),
  allocations: z.array(itemAllocationFormSchema),
});

export type ItemAssignmentForm = z.infer<typeof itemAssignmentFormSchema>;

export const percentageSplitFormSchema = z.object({
  userId: z.string().min(1),
  percentage: z.number().min(0).max(100),
});

export type PercentageSplitForm = z.infer<typeof percentageSplitFormSchema>;

export const customSplitFormSchema = z.object({
  userId: z.string().min(1),
  amountCents: z.number().min(0),
});

export type CustomSplitForm = z.infer<typeof customSplitFormSchema>;

const QUANTITY_EPSILON = 0.001;
const PERCENTAGE_EPSILON = 0.01;

export const splitFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Enter a title for this split.")
      .max(150, "Title must be 150 characters or less."),
    currency: z.string().length(3, "Choose a currency."),
    description: z
      .string()
      .max(5000, "Description must be 5000 characters or less."),
    totalAmountCents: z
      .number()
      .min(0, "Total cannot be negative.")
      .max(1_000_000_000, "Total is too large."),
    discountAmountCents: z
      .number()
      .min(0, "Discount cannot be negative.")
      .max(1_000_000_000, "Discount is too large."),
    dueAt: z.date({ error: "Enter a valid due date." }),
    locationName: z
      .string()
      .max(150, "Location must be 150 characters or less."),
    metadata: z.record(z.string(), z.string()),
    splitMethod: z.enum(["equal", "percentage", "itemized", "custom"]),
    receiptImage: receiptImageSchema.nullable(),
    friendIds: z.array(z.string().min(1)).min(1, "Add at least one friend."),
    items: z.array(splitItemSchema),
    itemAssignments: z.array(itemAssignmentFormSchema),
    percentageSplits: z.array(percentageSplitFormSchema),
    customSplits: z.array(customSplitFormSchema),
  })
  .superRefine((value, ctx) => {
    const filledItems = value.items.filter(
      (item) => item.name.trim() || item.unitPriceCents > 0,
    );
    const itemsTotalCents = filledItems.reduce(
      (sum, item) => sum + Math.round(item.quantity * item.unitPriceCents),
      0,
    );
    const effectiveTotalCents =
      filledItems.length > 0 ? itemsTotalCents : value.totalAmountCents;

    if (value.discountAmountCents > effectiveTotalCents) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmountCents"],
        message: "Discount can't exceed the total, cheapskate.",
      });
    }

    const netTotalCents = Math.max(
      0,
      effectiveTotalCents - value.discountAmountCents,
    );

    if (
      value.splitMethod === "equal" &&
      filledItems.length === 0 &&
      value.totalAmountCents <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["totalAmountCents"],
        message: "Enter a total greater than zero.",
      });
    }

    if (value.splitMethod === "itemized" && filledItems.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Add at least one item for an itemized split.",
      });
    }

    if (value.splitMethod === "itemized" && filledItems.length > 0) {
      filledItems.forEach((item) => {
        const assignment = value.itemAssignments.find(
          (a) => a.itemLocalId === item.localId,
        );
        const assignedQuantity = (assignment?.allocations ?? []).reduce(
          (sum, allocation) => sum + allocation.quantity,
          0,
        );

        if (Math.abs(assignedQuantity - item.quantity) > QUANTITY_EPSILON) {
          ctx.addIssue({
            code: "custom",
            path: ["itemAssignments"],
            message: `Assign all ${item.quantity} unit(s) of "${item.name || "that item"}" before submitting.`,
          });
        }
      });
    }

    if (value.splitMethod === "percentage") {
      if ((value.totalAmountCents ?? 0) <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["totalAmountCents"],
          message: "Enter a total greater than zero.",
        });
      }

      const totalPercentage = value.percentageSplits.reduce(
        (sum, split) => sum + split.percentage,
        0,
      );

      if (Math.abs(totalPercentage - 100) > PERCENTAGE_EPSILON) {
        ctx.addIssue({
          code: "custom",
          path: ["percentageSplits"],
          message: `Percentages must add up to 100% (currently ${totalPercentage.toFixed(1)}%).`,
        });
      }
    }

    if (value.splitMethod === "custom") {
      if ((value.totalAmountCents ?? 0) <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["totalAmountCents"],
          message: "Enter a total greater than zero.",
        });
      }

      const totalCustomCents = value.customSplits.reduce(
        (sum, split) => sum + split.amountCents,
        0,
      );

      if (totalCustomCents !== netTotalCents) {
        ctx.addIssue({
          code: "custom",
          path: ["customSplits"],
          message: `Amounts must add up to the total exactly. Assigned so far doesn't match.`,
        });
      }
    }
  });

export type SplitFormSchema = z.infer<typeof splitFormSchema>;

export type SplitMethod = SplitFormSchema["splitMethod"];

export const SPLIT_METHODS: {
  value: SplitMethod;
  label: string;
  description: string;
  available: boolean;
}[] = [
  {
    value: "equal",
    label: "Equal",
    description: "Split the total evenly between everyone.",
    available: true,
  },
  {
    value: "itemized",
    label: "Itemized",
    description: "Split based on specific items.",
    available: true,
  },
  {
    value: "percentage",
    label: "Percentage",
    description: "Assign a percentage share to each person.",
    available: true,
  },
  {
    value: "custom",
    label: "Custom",
    description: "Set exact amounts manually.",
    available: true,
  },
];

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "NPR", label: "NPR — Nepalese Rupee" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
] as const;

export function getDefaultDueDate(): Date {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 7);
  dueAt.setHours(0, 0, 0, 0);
  return dueAt;
}

export function createEmptySplitItem(): SplitItemForm {
  return {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    description: "",
    quantity: 1,
    unitPriceCents: 0,
    category: "",
  };
}

export function getSplitFormDefaults(): SplitFormSchema {
  return {
    title: "",
    currency: "USD",
    description: "",
    totalAmountCents: 0,
    discountAmountCents: 0,
    dueAt: getDefaultDueDate(),
    locationName: "",
    metadata: {},
    splitMethod: "equal",
    receiptImage: null,
    friendIds: [],
    items: [],
    itemAssignments: [],
    percentageSplits: [],
    customSplits: [],
  };
}

export function normalizeDueDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function centsToDisplay(cents: number): string {
  if (cents <= 0) return "";
  return (cents / 100).toFixed(2);
}

export function displayToCents(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return 0;

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return 0;

  return Math.round(parsed * 100);
}

export function displayToQuantity(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return 1;

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) return 1;

  return parsed;
}
