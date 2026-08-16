import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEADBEAT_QUERY_KEYS } from "./use-deadbeat";
import { paymentsApi } from "../payments";
import { settlementsApi } from "../settlements";
import { splitsApi } from "../splits";

export const PAYMENTS_QUERY_KEYS = {
  list: ["payments"] as const,
  detail: (paymentId: string) => ["payments", paymentId] as const,
  items: (paymentId: string) => ["payments", paymentId, "items"] as const,
  participants: (paymentId: string) =>
    ["payments", paymentId, "participants"] as const,
  splits: (paymentId: string) => ["payments", paymentId, "splits"] as const,
  settlements: (paymentId: string) =>
    ["payments", paymentId, "settlements"] as const,
  owedByMe: ["splits", "owed-by-me"] as const,
  owedToMe: ["splits", "owed-to-me"] as const,
};

export function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  paymentId?: string,
) {
  queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.list });
  queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.owedByMe });
  queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.owedToMe });
  queryClient.invalidateQueries({ queryKey: DEADBEAT_QUERY_KEYS.leaderboard });

  if (paymentId) {
    queryClient.invalidateQueries({
      queryKey: PAYMENTS_QUERY_KEYS.detail(paymentId),
    });
    queryClient.invalidateQueries({
      queryKey: PAYMENTS_QUERY_KEYS.items(paymentId),
    });
    queryClient.invalidateQueries({
      queryKey: PAYMENTS_QUERY_KEYS.participants(paymentId),
    });
    queryClient.invalidateQueries({
      queryKey: PAYMENTS_QUERY_KEYS.splits(paymentId),
    });
    queryClient.invalidateQueries({
      queryKey: PAYMENTS_QUERY_KEYS.settlements(paymentId),
    });
  }
}

export const usePaymentsList = () => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.list,
    queryFn: paymentsApi.list,
  });
};

export const usePayment = (paymentId: string) => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.detail(paymentId),
    queryFn: () => paymentsApi.getById(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const usePaymentItems = (paymentId: string) => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.items(paymentId),
    queryFn: () => paymentsApi.listItems(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const usePaymentParticipants = (paymentId: string) => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.participants(paymentId),
    queryFn: () => paymentsApi.listParticipants(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const usePaymentSplits = (paymentId: string) => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.splits(paymentId),
    queryFn: () => splitsApi.listByPayment(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const usePaymentSettlements = (paymentId: string) => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.settlements(paymentId),
    queryFn: () => settlementsApi.listByPayment(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const useSplitsOwedByMe = () => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.owedByMe,
    queryFn: splitsApi.listOwedByMe,
  });
};

export const useSplitsOwedToMe = () => {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.owedToMe,
    queryFn: splitsApi.listOwedToMe,
  });
};

export function useRequestCashSettlement(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settlementsApi.requestCash(paymentId),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, paymentId);
    },
  });
}

export function useConfirmCashSettlement(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payerUserId: string) =>
      settlementsApi.confirmCash(paymentId, payerUserId),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, paymentId);
    },
  });
}

export function useRejectCashSettlement(paymentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payerUserId: string) =>
      settlementsApi.rejectCash(paymentId, payerUserId),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, paymentId);
    },
  });
}
