import { api } from "@/lib/api-client";
import { normalizeAxiosError } from "@/utils/errors";

import { ENDPOINTS } from "./endpoints";

export type ReceiptUpload = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export type PaymentSplit = {
  id: string;
  paymentId: string;
  debtorUserId: string;
  creditorUserId: string;
  amountCents: number;
  currency: string;
  status: "pending" | "settled" | "forgiven" | "cancelled";
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemAssignment = {
  id: string;
  paymentId: string;
  paymentItemId: string;
  userId: string;
  assignedQuantity: number;
  shareAmountCents: number;
  createdAt: string;
  updatedAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  requestId: string;
};

function appendReceiptImage(formData: FormData, image: ReceiptUpload) {
  formData.append("paymentImage", {
    uri: image.uri,
    name: image.fileName ?? "receipt.jpg",
    type: image.mimeType ?? "image/jpeg",
  } as unknown as Blob);
}

async function getJson<T>(url: string): Promise<T> {
  try {
    const response = await api.get<ApiSuccess<T>>(url);
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  try {
    const response = await api.post<ApiSuccess<T>>(url, body);
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

async function postMultipart<T>(url: string, formData: FormData): Promise<T> {
  try {
    const response = await api.post<ApiSuccess<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            // Let the runtime set the multipart boundary.
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });
    return response.data.data;
  } catch (error) {
    throw normalizeAxiosError(error);
  }
}

export type CreateEqualSplitInput = {
  debtorUserIds?: string[];
  dueAt?: string;
  receiptImage?: ReceiptUpload | null;
};

export type ItemAllocationInput = {
  userId: string;
  quantity: number;
};

export type CreateItemBasedSplitInput = {
  assignments: Array<{
    paymentItemId: string;
    allocations: ItemAllocationInput[];
  }>;
  dueAt?: string;
  receiptImage?: ReceiptUpload | null;
};

export type CreatePercentageSplitInput = {
  splits: Array<{ debtorUserId: string; percentage: number }>;
  dueAt?: string;
  receiptImage?: ReceiptUpload | null;
};

export type CreateCustomSplitInput = {
  splits: Array<{ debtorUserId: string; amountCents: number }>;
  dueAt?: string;
  receiptImage?: ReceiptUpload | null;
};

export const splitsApi = {
  listByPayment: (paymentId: string) =>
    getJson<PaymentSplit[]>(ENDPOINTS.payments.splits.list(paymentId)),

  getById: (splitId: string) =>
    getJson<PaymentSplit>(ENDPOINTS.splits.detail(splitId)),

  listOwedByMe: () =>
    getJson<PaymentSplit[]>(ENDPOINTS.me.splitsOwedByMe),

  listOwedToMe: () =>
    getJson<PaymentSplit[]>(ENDPOINTS.me.splitsOwedToMe),

  createEqual: async (paymentId: string, input: CreateEqualSplitInput) => {
    const url = ENDPOINTS.payments.splits.createEqual(paymentId);

    if (!input.receiptImage) {
      return postJson<PaymentSplit[]>(url, {
        ...(input.debtorUserIds?.length
          ? { debtorUserIds: input.debtorUserIds }
          : {}),
        ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      });
    }

    const formData = new FormData();
    if (input.debtorUserIds?.length) {
      formData.append("debtorUserIds", JSON.stringify(input.debtorUserIds));
    }
    if (input.dueAt) {
      formData.append("dueAt", input.dueAt);
    }
    appendReceiptImage(formData, input.receiptImage);

    return postMultipart<PaymentSplit[]>(url, formData);
  },

  createItemBased: async (
    paymentId: string,
    input: CreateItemBasedSplitInput,
  ) => {
    const url = ENDPOINTS.payments.splits.createItemBased(paymentId);

    if (!input.receiptImage) {
      return postJson<{
        splits: PaymentSplit[];
        assignments: ItemAssignment[];
      }>(url, {
        assignments: input.assignments,
        ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      });
    }

    const formData = new FormData();
    formData.append("assignments", JSON.stringify(input.assignments));
    if (input.dueAt) {
      formData.append("dueAt", input.dueAt);
    }
    appendReceiptImage(formData, input.receiptImage);

    return postMultipart<{
      splits: PaymentSplit[];
      assignments: ItemAssignment[];
    }>(url, formData);
  },

  createPercentage: async (
    paymentId: string,
    input: CreatePercentageSplitInput,
  ) => {
    const url = ENDPOINTS.payments.splits.createPercentage(paymentId);

    if (!input.receiptImage) {
      return postJson<PaymentSplit[]>(url, {
        splits: input.splits,
        ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      });
    }

    const formData = new FormData();
    formData.append("splits", JSON.stringify(input.splits));
    if (input.dueAt) {
      formData.append("dueAt", input.dueAt);
    }
    appendReceiptImage(formData, input.receiptImage);

    return postMultipart<PaymentSplit[]>(url, formData);
  },

  createCustom: async (
    paymentId: string,
    input: CreateCustomSplitInput,
  ) => {
    const url = ENDPOINTS.payments.splits.createCustom(paymentId);

    if (!input.receiptImage) {
      return postJson<PaymentSplit[]>(url, {
        splits: input.splits,
        ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      });
    }

    const formData = new FormData();
    formData.append("splits", JSON.stringify(input.splits));
    if (input.dueAt) {
      formData.append("dueAt", input.dueAt);
    }
    appendReceiptImage(formData, input.receiptImage);

    return postMultipart<PaymentSplit[]>(url, formData);
  },
};

