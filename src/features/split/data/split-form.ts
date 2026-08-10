import * as z from "zod";

export const receiptImageSchema = z.object({
  uri: z.string().min(1),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export type ReceiptImage = z.infer<typeof receiptImageSchema>;

export const splitFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title for this split.")
    .max(150, "Title must be 150 characters or less."),
  currency: z.string().length(3, "Choose a currency."),
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or less."),
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
});

export type SplitFormSchema = z.infer<typeof splitFormSchema>;

export type SplitMethod = SplitFormSchema["splitMethod"];

export const SPLIT_METHODS: {
  value: SplitMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "equal",
    label: "Equal",
    description: "Split the total evenly between everyone.",
  },
  {
    value: "percentage",
    label: "Percentage",
    description: "Assign a percentage share to each person.",
  },
  {
    value: "itemized",
    label: "Itemized",
    description: "Split by individual line items.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Set exact amounts manually.",
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

export function getSplitFormDefaults(): SplitFormSchema {
  return {
    title: "",
    currency: "USD",
    description: "",
    discountAmountCents: 0,
    dueAt: getDefaultDueDate(),
    locationName: "",
    metadata: {},
    splitMethod: "equal",
    receiptImage: null,
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
