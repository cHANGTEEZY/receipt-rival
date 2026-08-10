import type { Payment } from "@/api/payments";
import type { PaymentSplit } from "@/api/splits";

export function paymentStatusLabel(status: Payment["status"]): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "finalized":
      return "Finalized";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function splitStatusLabel(status: PaymentSplit["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "settled":
      return "Settled";
    case "forgiven":
      return "Forgiven";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function splitMethodLabel(method: Payment["splitMethod"]): string {
  switch (method) {
    case "equal":
      return "Equal";
    case "itemized":
      return "Itemized";
    case "percentage":
      return "Percentage";
    case "custom":
      return "Custom";
    default:
      return method;
  }
}
