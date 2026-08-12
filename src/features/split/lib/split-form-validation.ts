import type { SplitFormSchema } from "../data/split-form";

const QUANTITY_EPSILON = 0.001;
const PERCENTAGE_EPSILON = 0.01;

export type StepValidationError = {
  field: string;
  message: string;
};

export type StepId =
  | "details"
  | "friends"
  | "amounts"
  | "items"
  | "assignments"
  | "percentage"
  | "custom"
  | "review";

const HUMOROUS_TOAST_LABELS: Record<string, readonly string[]> = {
  title: ["Nameless split?", "What should we call this caper?", "Needs a title, detective."],
  friendIds: ["Flying solo?", "No accomplices?", "Can't split with thin air."],
  totalAmountCents: ["That's not free", "Zero won't cut it", "Show me the money."],
  discountAmountCents: [
    "Too cheap even for you",
    "Discount delusion detected",
    "Nice try, cheapskate.",
  ],
  items: ["Where's the receipt?", "No items, no justice", "Empty tab alert."],
  itemAssignments: [
    "Someone's eating for free",
    "Unassigned loot on the table",
    "Fair split? Not yet.",
  ],
  percentageSplits: [
    "Math is hard",
    "Your pie chart is broken",
    "Percentages don't add up to vibes.",
  ],
  customSplits: [
    "Numbers don't lie (yours do)",
    "Penny pinching mismatch",
    "The total is judging you.",
  ],
  dueAt: ["When's payday?", "Due date drama", "Time travel not supported."],
  currency: ["Pick a currency", "Money needs a symbol", "Which wallet we talking?"],
  receiptImage: ["Receipt who?", "Evidence missing", "No proof, no mercy."],
  submit: ["Plot twist", "The server said no", "Split denied."],
};

function pickHumorousLabel(field: string): string {
  const options = HUMOROUS_TOAST_LABELS[field];
  if (!options?.length) return "Not so fast";
  return options[Math.floor(Math.random() * options.length)] ?? "Not so fast";
}

export function getHumorousErrorToast(field: string, message: string) {
  return {
    label: pickHumorousLabel(field),
    description: message,
  };
}

export function getStepValidationError(
  stepId: StepId,
  values: SplitFormSchema,
): StepValidationError | null {
  switch (stepId) {
    case "details":
      if (!values.title.trim()) {
        return {
          field: "title",
          message: "Enter a title for this split.",
        };
      }
      return null;

    case "friends":
      if (values.friendIds.length === 0) {
        return {
          field: "friendIds",
          message: "Add at least one friend.",
        };
      }
      return null;

    case "amounts": {
      if (values.splitMethod === "itemized") return null;

      if (values.totalAmountCents <= 0) {
        return {
          field: "totalAmountCents",
          message: "Enter a total greater than zero.",
        };
      }
      if (values.discountAmountCents > values.totalAmountCents) {
        return {
          field: "discountAmountCents",
          message: "Discount can't exceed the total, cheapskate.",
        };
      }
      return null;
    }

    case "items": {
      if (values.splitMethod !== "itemized") return null;

      const filled = values.items.filter(
        (item) => item.name.trim() || item.unitPriceCents > 0,
      );
      if (filled.length === 0) {
        return {
          field: "items",
          message: "Add at least one item for an itemized split.",
        };
      }
      return null;
    }

    case "assignments": {
      const filledItems = values.items.filter(
        (item) => item.name.trim() || item.unitPriceCents > 0,
      );

      for (const item of filledItems) {
        const assignment = values.itemAssignments.find(
          (a) => a.itemLocalId === item.localId,
        );
        const assignedQuantity = (assignment?.allocations ?? []).reduce(
          (sum, allocation) => sum + allocation.quantity,
          0,
        );

        if (Math.abs(assignedQuantity - item.quantity) > QUANTITY_EPSILON) {
          return {
            field: "itemAssignments",
            message: `Assign all ${item.quantity} unit(s) of "${item.name || "that item"}" before continuing.`,
          };
        }
      }
      return null;
    }

    case "percentage": {
      const total = values.percentageSplits.reduce(
        (sum, split) => sum + split.percentage,
        0,
      );
      if (Math.abs(total - 100) > PERCENTAGE_EPSILON) {
        return {
          field: "percentageSplits",
          message: `Percentages must add up to 100% (currently ${total.toFixed(1)}%).`,
        };
      }
      return null;
    }

    case "custom": {
      const netTotalCents = Math.max(
        0,
        values.totalAmountCents - values.discountAmountCents,
      );
      const totalCustomCents = values.customSplits.reduce(
        (sum, split) => sum + split.amountCents,
        0,
      );
      if (totalCustomCents !== netTotalCents) {
        return {
          field: "customSplits",
          message:
            "Amounts must add up to the total exactly. Assigned so far doesn't match.",
        };
      }
      return null;
    }

    case "review":
      return null;

    default:
      return null;
  }
}
