import { api } from "@/lib/api-client";
import { normalizeAxiosError } from "@/utils/errors";

import { ENDPOINTS } from "./endpoints";

export type Settlement = {
  id: string;
  splitId: string;
  paymentId: string;
  payerUserId: string;
  receiverUserId: string;
  amountCents: number;
  currency: string;
  paymentMethod: string | null;
  note: string | null;
  status: "pending" | "confirmed" | "rejected";
  paidAt: string;
  confirmedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
};

async function unwrap<T>(request: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    const response = await request;
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

export const settlementsApi = {
  listByPayment: (paymentId: string) =>
    unwrap(
      api.get<ApiSuccess<Settlement[]>>(
        ENDPOINTS.payments.settlements.list(paymentId),
      ),
    ),

  requestCash: (paymentId: string, note?: string) =>
    unwrap(
      api.post<ApiSuccess<Settlement[]>>(
        ENDPOINTS.payments.settlements.cash(paymentId),
        note ? { note } : {},
      ),
    ),

  confirmCash: (paymentId: string, payerUserId: string) =>
    unwrap(
      api.post<ApiSuccess<Settlement[]>>(
        ENDPOINTS.payments.settlements.confirm(paymentId),
        { payerUserId },
      ),
    ),

  rejectCash: (paymentId: string, payerUserId: string) =>
    unwrap(
      api.post<ApiSuccess<Settlement[]>>(
        ENDPOINTS.payments.settlements.reject(paymentId),
        { payerUserId },
      ),
    ),
};
