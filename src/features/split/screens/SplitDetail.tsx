import { useQueries } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { View } from "react-native";

import {
  useConfirmCashSettlement,
  usePayment,
  usePaymentItems,
  usePaymentParticipants,
  usePaymentSettlements,
  usePaymentSplits,
  useRejectCashSettlement,
  useRequestCashSettlement,
} from "@/api/hooks/use-payments";
import { USERS_QUERY_KEYS } from "@/api/hooks/use-users";
import type { Settlement } from "@/api/settlements";
import { usersApi } from "@/api/users";
import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import {
  SlideToComplete,
  type SlideToCompleteHandle,
} from "@/components/SlideToComplete";
import { FriendListItem } from "@/features/friends/components/FriendListItem";
import { useSession } from "@/lib/auth-client";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Chip } from "heroui-native/chip";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";
import { useToast } from "heroui-native/toast";

import { CashReviewCard } from "../components/cash-review-card";
import { PaymentMethodsSheet } from "../components/payment-methods-sheet";
import {
  paymentStatusLabel,
  splitMethodLabel,
  splitStatusLabel,
} from "../lib/status";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Typography type="h5" weight="semibold">
          {title}
        </Typography>
        {description ? (
          <Typography type="body-sm" color="muted">
            {description}
          </Typography>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Typography type="body-sm" color="muted">
        {label}
      </Typography>
      <Typography
        type="body-sm"
        weight="medium"
        className="max-w-[65%] text-right"
      >
        {value}
      </Typography>
    </View>
  );
}

function groupPendingCashByPayer(settlements: Settlement[]) {
  const grouped = new Map<string, Settlement[]>();
  for (const settlement of settlements) {
    if (settlement.status !== "pending" || settlement.paymentMethod !== "cash") {
      continue;
    }
    const group = grouped.get(settlement.payerUserId) ?? [];
    group.push(settlement);
    grouped.set(settlement.payerUserId, group);
  }
  return grouped;
}

export default function SplitDetailScreen() {
  const params = useLocalSearchParams<{ paymentId?: string | string[] }>();
  const paymentId = Array.isArray(params.paymentId)
    ? (params.paymentId[0] ?? "")
    : (params.paymentId ?? "");

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { toast } = useToast();

  const slideRef = useRef<SlideToCompleteHandle>(null);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [reviewingPayerId, setReviewingPayerId] = useState<string | null>(null);

  const paymentQuery = usePayment(paymentId);
  const itemsQuery = usePaymentItems(paymentId);
  const participantsQuery = usePaymentParticipants(paymentId);
  const splitsQuery = usePaymentSplits(paymentId);
  const settlementsQuery = usePaymentSettlements(paymentId);

  const requestCash = useRequestCashSettlement(paymentId);
  const confirmCash = useConfirmCashSettlement(paymentId);
  const rejectCash = useRejectCashSettlement(paymentId);

  const payment = paymentQuery.data;
  const items = itemsQuery.data ?? [];
  const participants = useMemo(
    () => participantsQuery.data ?? [],
    [participantsQuery.data],
  );
  const splits = useMemo(() => splitsQuery.data ?? [], [splitsQuery.data]);
  const settlements = useMemo(
    () => settlementsQuery.data ?? [],
    [settlementsQuery.data],
  );

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const participant of participants) {
      if (participant.isActive) ids.add(participant.userId);
    }
    for (const split of splits) {
      ids.add(split.debtorUserId);
      ids.add(split.creditorUserId);
    }
    for (const settlement of settlements) {
      ids.add(settlement.payerUserId);
      ids.add(settlement.receiverUserId);
    }
    return [...ids];
  }, [participants, settlements, splits]);

  const splitsByDebtor = useMemo(() => {
    const grouped = new Map<string, typeof splits>();
    for (const split of splits) {
      const group = grouped.get(split.debtorUserId) ?? [];
      group.push(split);
      grouped.set(split.debtorUserId, group);
    }
    return grouped;
  }, [splits]);

  const pendingCashByPayer = useMemo(
    () => groupPendingCashByPayer(settlements),
    [settlements],
  );

  const myPendingSplits = useMemo(() => {
    if (!currentUserId) return [];
    return splits.filter(
      (split) =>
        split.debtorUserId === currentUserId && split.status === "pending",
    );
  }, [currentUserId, splits]);

  const myPendingTotalCents = myPendingSplits.reduce(
    (sum, split) => sum + split.amountCents,
    0,
  );

  const myPendingCashClaim = currentUserId
    ? pendingCashByPayer.get(currentUserId)
    : undefined;

  const reviewsForMe = useMemo(() => {
    if (!currentUserId) return [];
    return [...pendingCashByPayer.entries()].filter(([, rows]) =>
      rows.every((row) => row.receiverUserId === currentUserId),
    );
  }, [currentUserId, pendingCashByPayer]);

  const canSlideToPay =
    Boolean(currentUserId) &&
    payment?.status === "finalized" &&
    myPendingSplits.length > 0 &&
    !myPendingCashClaim?.length;

  const userQueries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: USERS_QUERY_KEYS.getById(userId),
      queryFn: () => usersApi.getById(userId),
      enabled: Boolean(userId),
    })),
  });

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    userQueries.forEach((query, index) => {
      const userId = userIds[index];
      const name = query.data?.data?.name;
      if (userId && name) map.set(userId, name);
    });
    return map;
  }, [userIds, userQueries]);

  function resolveName(userId: string) {
    if (userId === currentUserId) return "You";
    return userNameById.get(userId) ?? "Someone";
  }

  const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong";

  const isLoading =
    paymentQuery.isLoading ||
    itemsQuery.isLoading ||
    participantsQuery.isLoading ||
    splitsQuery.isLoading ||
    settlementsQuery.isLoading;

  const isError =
    paymentQuery.isError ||
    itemsQuery.isError ||
    participantsQuery.isError ||
    splitsQuery.isError ||
    settlementsQuery.isError;

  const handleMethodsOpenChange = (open: boolean) => {
    setMethodsOpen(open);
    if (!open) {
      slideRef.current?.reset();
    }
  };

  const handleSelectCash = async () => {
    try {
      await requestCash.mutateAsync();
      hapticSuccess();
      setMethodsOpen(false);
      slideRef.current?.reset();
      toast.show({
        variant: "success",
        label: "Cash claim sent",
        description: "Waiting for the owner to confirm they received it.",
      });
    } catch (error) {
      hapticError();
      toast.show({
        variant: "danger",
        label: "Couldn’t send cash claim",
        description: errorMessage(error),
      });
    }
  };

  const handleConfirm = async (payerUserId: string) => {
    setReviewingPayerId(payerUserId);
    try {
      await confirmCash.mutateAsync(payerUserId);
      hapticSuccess();
      toast.show({
        variant: "success",
        label: "Marked as paid",
        description: "That balance is settled.",
      });
    } catch (error) {
      hapticError();
      toast.show({
        variant: "danger",
        label: "Couldn’t confirm",
        description: errorMessage(error),
      });
    } finally {
      setReviewingPayerId(null);
    }
  };

  const handleReject = async (payerUserId: string) => {
    setReviewingPayerId(payerUserId);
    try {
      await rejectCash.mutateAsync(payerUserId);
      hapticSuccess();
      toast.show({
        variant: "warning",
        label: "Cash claim rejected",
        description: "They still owe this balance.",
      });
    } catch (error) {
      hapticError();
      toast.show({
        variant: "danger",
        label: "Couldn’t reject",
        description: errorMessage(error),
      });
    } finally {
      setReviewingPayerId(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <CollapsedLargeHeader
        title={payment?.title ?? "Split detail"}
        leading={<GoBackButton />}
      >
        <View className="gap-8 px-4 pb-10 pt-2">
          {isLoading ? (
            <View className="items-center py-16">
              <Spinner size="lg" />
            </View>
          ) : null}

          {isError && !payment ? (
            <Typography type="body-sm" className="text-danger">
              Couldn’t load this split. Try again in a moment.
            </Typography>
          ) : null}

          {payment ? (
            <>
              <Section title="Overview">
                <View
                  className="gap-3 rounded-3xl bg-surface px-4 py-4"
                  style={{ borderCurve: "continuous" }}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Typography type="h4" weight="semibold">
                      {formatMoney(payment.totalAmountCents, payment.currency)}
                    </Typography>
                    <Chip size="sm" variant="soft" color="accent">
                      <Chip.Label>
                        {paymentStatusLabel(payment.status)}
                      </Chip.Label>
                    </Chip>
                  </View>

                  <MetaRow
                    label="Method"
                    value={splitMethodLabel(payment.splitMethod)}
                  />
                  <MetaRow label="Due" value={formatShortDate(payment.dueAt)} />
                  {payment.locationName ? (
                    <MetaRow label="Location" value={payment.locationName} />
                  ) : null}
                  {payment.description ? (
                    <MetaRow label="Notes" value={payment.description} />
                  ) : null}
                  {payment.discountAmountCents > 0 ? (
                    <MetaRow
                      label="Discount"
                      value={formatMoney(
                        payment.discountAmountCents,
                        payment.currency,
                      )}
                    />
                  ) : null}
                </View>
              </Section>

              {payment.receiptImageUrl ? (
                <Section title="Receipt">
                  <View
                    className="overflow-hidden rounded-3xl bg-surface"
                    style={{ borderCurve: "continuous" }}
                  >
                    <Image
                      source={{ uri: payment.receiptImageUrl }}
                      style={{ width: "100%", height: 240 }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                </Section>
              ) : null}

              <Section
                title="People"
                description="Everyone included in this split."
              >
                <View className="gap-2">
                  {participants
                    .filter((participant) => participant.isActive)
                    .map((participant) => (
                      <FriendListItem
                        key={participant.id}
                        name={resolveName(participant.userId)}
                        subtitle={
                          participant.isOwner
                            ? "Paid the bill"
                            : "Sharing this split"
                        }
                        trailing={
                          participant.isOwner ? (
                            <Chip size="sm" variant="soft" color="accent">
                              <Chip.Label>Owner</Chip.Label>
                            </Chip>
                          ) : null
                        }
                      />
                    ))}
                </View>
              </Section>

              {items.length > 0 ? (
                <Section title="Items" description="Line items on this receipt.">
                  <View className="gap-2">
                    {items.map((item) => (
                      <View
                        key={item.id}
                        className="flex-row items-center justify-between gap-3 rounded-3xl bg-surface px-4 py-3"
                        style={{ borderCurve: "continuous" }}
                      >
                        <View className="min-w-0 flex-1 gap-0.5">
                          <Typography
                            type="body-sm"
                            weight="semibold"
                            numberOfLines={1}
                          >
                            {item.name}
                          </Typography>
                          <Typography type="body-sm" color="muted">
                            Qty {item.quantity}
                          </Typography>
                        </View>
                        <Typography type="body-sm" weight="medium">
                          {formatMoney(item.totalPriceCents, payment.currency)}
                        </Typography>
                      </View>
                    ))}
                  </View>
                </Section>
              ) : null}

              <Section
                title="Balances"
                description="Who owes whom for this split."
              >
                {splits.length === 0 ? (
                  <Typography type="body-sm" color="muted">
                    No balances yet.
                  </Typography>
                ) : (
                  <View className="gap-4">
                    {Array.from(splitsByDebtor.entries()).map(
                      ([debtorId, debtorSplits]) => {
                        const debtorName = resolveName(debtorId);
                        const totalOwed = debtorSplits.reduce(
                          (sum, s) => sum + s.amountCents,
                          0,
                        );
                        const waitingOnCash =
                          debtorId === currentUserId &&
                          Boolean(myPendingCashClaim?.length);

                        return (
                          <View
                            key={debtorId}
                            className="gap-3 rounded-3xl bg-surface px-4 py-4"
                            style={{ borderCurve: "continuous" }}
                          >
                            <View className="flex-row items-center justify-between border-b border-border pb-3">
                              <Typography type="body" weight="semibold">
                                {debtorId === currentUserId
                                  ? "You owe"
                                  : `${debtorName} owes`}
                              </Typography>
                              <Typography type="body" weight="bold">
                                {formatMoney(
                                  totalOwed,
                                  debtorSplits[0]?.currency ?? payment.currency,
                                )}
                              </Typography>
                            </View>

                            <View className="gap-3">
                              {debtorSplits.map((split) => {
                                const creditorName = resolveName(
                                  split.creditorUserId,
                                );
                                const toText =
                                  split.creditorUserId === currentUserId
                                    ? "to You"
                                    : `to ${creditorName}`;

                                return (
                                  <View
                                    key={split.id}
                                    className="flex-row items-center justify-between"
                                  >
                                    <View className="flex-1">
                                      <Typography
                                        type="body-sm"
                                        weight="medium"
                                      >
                                        {toText}
                                      </Typography>
                                      <Typography type="body-xs" color="muted">
                                        Due {formatShortDate(split.dueAt)}
                                      </Typography>
                                    </View>
                                    <View className="flex-row items-end gap-1">
                                      <Chip
                                        size="sm"
                                        variant="soft"
                                        color={
                                          split.status === "settled"
                                            ? "success"
                                            : "default"
                                        }
                                      >
                                        <Chip.Label>
                                          {splitStatusLabel(split.status)}
                                        </Chip.Label>
                                      </Chip>
                                      <Typography
                                        type="body-sm"
                                        weight="medium"
                                      >
                                        {formatMoney(
                                          split.amountCents,
                                          split.currency,
                                        )}
                                      </Typography>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>

                            {waitingOnCash ? (
                              <View className="rounded-2xl bg-warning/10 px-3 py-3">
                                <Typography type="body-sm" weight="medium">
                                  Waiting for owner confirmation
                                </Typography>
                                <Typography type="body-xs" color="muted">
                                  You claimed this was paid in cash. It stays
                                  unpaid until they confirm.
                                </Typography>
                              </View>
                            ) : null}
                          </View>
                        );
                      },
                    )}
                  </View>
                )}
              </Section>

              {reviewsForMe.length > 0 ? (
                <Section
                  title="Cash to review"
                  description="Someone says they already paid you in cash."
                >
                  <View className="gap-3">
                    {reviewsForMe.map(([payerUserId, rows]) => (
                      <CashReviewCard
                        key={payerUserId}
                        payerName={resolveName(payerUserId)}
                        settlements={rows}
                        currency={rows[0]?.currency ?? payment.currency}
                        isConfirming={
                          reviewingPayerId === payerUserId &&
                          confirmCash.isPending
                        }
                        isRejecting={
                          reviewingPayerId === payerUserId &&
                          rejectCash.isPending
                        }
                        onConfirm={() => {
                          void handleConfirm(payerUserId);
                        }}
                        onReject={() => {
                          void handleReject(payerUserId);
                        }}
                      />
                    ))}
                  </View>
                </Section>
              ) : null}

              {canSlideToPay ? (
                <Section
                  title="Settle up"
                  description="Slide to choose how you paid your share."
                >
                  <SlideToComplete
                    ref={slideRef}
                    label={`Slide to pay ${formatMoney(myPendingTotalCents, payment.currency)}`}
                    completedLabel="Choose a method"
                    resetDelayMs={null}
                    onSlideComplete={() => {
                      setMethodsOpen(true);
                    }}
                  />
                </Section>
              ) : null}
            </>
          ) : null}
        </View>
      </CollapsedLargeHeader>

      {payment ? (
        <PaymentMethodsSheet
          isOpen={methodsOpen}
          onOpenChange={handleMethodsOpenChange}
          amountCents={myPendingTotalCents}
          currency={payment.currency}
          isSubmittingCash={requestCash.isPending}
          onSelectCash={handleSelectCash}
        />
      ) : null}
    </View>
  );
}
