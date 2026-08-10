import { api } from "@/lib/api-client";
import { normalizeAxiosError } from "@/utils/errors";

import { ENDPOINTS } from "./endpoints";

export type Payment = {
  id: string;
  createdBy: string;
  title: string;
  description: string | null;
  currency: string;
  totalAmountCents: number;
  taxAmountCents: number;
  tipAmountCents: number;
  discountAmountCents: number;
  splitMethod: "equal" | "percentage" | "itemized" | "custom";
  status: "draft" | "finalized" | "completed" | "cancelled";
  dueAt: string | null;
  locationName: string | null;
  receiptImageUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PaymentItem = {
  id: string;
  paymentId: string;
  name: string;
  description: string | null;
  quantity: string;
  unitPriceCents: number;
  totalPriceCents: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentParticipant = {
  id: string;
  paymentId: string;
  userId: string;
  addedBy: string;
  isOwner: boolean;
  isActive: boolean;
  nicknameAtTime: string | null;
  joinedAt: string;
  removedAt: string | null;
  createdAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
};

export type CreatePaymentInput = {
  title: string;
  description?: string;
  currency?: string;
  totalAmountCents?: number;
  taxAmountCents?: number;
  tipAmountCents?: number;
  discountAmountCents?: number;
  splitMethod?: Payment["splitMethod"];
  dueAt?: string;
  locationName?: string;
  metadata?: Record<string, unknown>;
};

export type CreatePaymentItemInput = {
  name: string;
  description?: string;
  quantity?: number;
  unitPriceCents: number;
  category?: string;
};

async function unwrap<T>(request: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  try {
    const response = await request;
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

export const paymentsApi = {
  create: (input: CreatePaymentInput) =>
    unwrap(api.post<ApiSuccess<Payment>>(ENDPOINTS.payments.create, input)),

  list: () =>
    unwrap(api.get<ApiSuccess<Payment[]>>(ENDPOINTS.me.payments)),

  getById: (paymentId: string) =>
    unwrap(api.get<ApiSuccess<Payment>>(ENDPOINTS.payments.detail(paymentId))),

  finalize: (paymentId: string) =>
    unwrap(
      api.post<ApiSuccess<Payment>>(ENDPOINTS.payments.finalize(paymentId)),
    ),

  listItems: (paymentId: string) =>
    unwrap(
      api.get<ApiSuccess<PaymentItem[]>>(ENDPOINTS.payments.items(paymentId)),
    ),

  addItem: (paymentId: string, input: CreatePaymentItemInput) =>
    unwrap(
      api.post<ApiSuccess<PaymentItem>>(
        ENDPOINTS.payments.items(paymentId),
        input,
      ),
    ),

  listParticipants: (paymentId: string) =>
    unwrap(
      api.get<ApiSuccess<PaymentParticipant[]>>(
        ENDPOINTS.payments.participants(paymentId),
      ),
    ),

  addParticipant: (paymentId: string, userId: string) =>
    unwrap(
      api.post<ApiSuccess<PaymentParticipant>>(
        ENDPOINTS.payments.participants(paymentId),
        { userId },
      ),
    ),
};
