import { useQueries } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo, type ReactNode } from "react";
import { View } from "react-native";

import {
  usePayment,
  usePaymentItems,
  usePaymentParticipants,
  usePaymentSplits,
} from "@/api/hooks/use-payments";
import { USERS_QUERY_KEYS } from "@/api/hooks/use-users";
import { usersApi } from "@/api/users";
import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import { FriendListItem } from "@/features/friends/components/FriendListItem";
import { useSession } from "@/lib/auth-client";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Chip } from "heroui-native/chip";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

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

export default function SplitDetailScreen() {
  const params = useLocalSearchParams<{ paymentId?: string | string[] }>();
  const paymentId = Array.isArray(params.paymentId)
    ? (params.paymentId[0] ?? "")
    : (params.paymentId ?? "");

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const paymentQuery = usePayment(paymentId);
  const itemsQuery = usePaymentItems(paymentId);
  const participantsQuery = usePaymentParticipants(paymentId);
  const splitsQuery = usePaymentSplits(paymentId);

  const payment = paymentQuery.data;
  const items = itemsQuery.data ?? [];
  const participants = participantsQuery.data ?? [];
  const splits = splitsQuery.data ?? [];

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const participant of participants) {
      if (participant.isActive) ids.add(participant.userId);
    }
    for (const split of splits) {
      ids.add(split.debtorUserId);
      ids.add(split.creditorUserId);
    }
    return [...ids];
  }, [participants, splits]);

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

  const resolveName = (userId: string) => {
    if (userId === currentUserId) return "You";
    return userNameById.get(userId) ?? "Someone";
  };

  const isLoading =
    paymentQuery.isLoading ||
    itemsQuery.isLoading ||
    participantsQuery.isLoading ||
    splitsQuery.isLoading;

  const isError =
    paymentQuery.isError ||
    itemsQuery.isError ||
    participantsQuery.isError ||
    splitsQuery.isError;

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
                  <View className="gap-2">
                    {splits.map((split) => {
                      const debtor = resolveName(split.debtorUserId);
                      const creditor = resolveName(split.creditorUserId);
                      const youOwe =
                        split.debtorUserId === currentUserId
                          ? `You owe ${creditor}`
                          : split.creditorUserId === currentUserId
                            ? `${debtor} owes you`
                            : `${debtor} owes ${creditor}`;

                      return (
                        <View
                          key={split.id}
                          className="flex-row items-center justify-between gap-3 rounded-3xl bg-surface px-4 py-3"
                          style={{ borderCurve: "continuous" }}
                        >
                          <View className="min-w-0 flex-1 gap-1">
                            <Typography
                              type="body-sm"
                              weight="semibold"
                              numberOfLines={2}
                            >
                              {youOwe}
                            </Typography>
                            <Typography type="body-sm" color="muted">
                              Due {formatShortDate(split.dueAt)}
                            </Typography>
                          </View>
                          <View className="items-end gap-1">
                            <Typography type="body-sm" weight="semibold">
                              {formatMoney(split.amountCents, split.currency)}
                            </Typography>
                            <Chip size="sm" variant="soft" color="default">
                              <Chip.Label>
                                {splitStatusLabel(split.status)}
                              </Chip.Label>
                            </Chip>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Section>
            </>
          ) : null}
        </View>
      </CollapsedLargeHeader>
    </View>
  );
}
