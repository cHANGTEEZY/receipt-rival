import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { useFriendsList } from "@/api/hooks/use-friends";
import {
  usePaymentsList,
  useSplitsOwedByMe,
  useSplitsOwedToMe,
} from "@/api/hooks/use-payments";
import type { Payment } from "@/api/payments";
import type { PaymentSplit } from "@/api/splits";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import SplitFab from "@/components/SplitFab";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { SwipeMenuButton } from "@/features/swipe-menu";
import { SplitBalanceRow } from "@/features/split/components/SplitBalanceRow";
import { SplitListEmpty } from "@/features/split/components/SplitListEmpty";
import { SplitListItem } from "@/features/split/components/SplitListItem";
import { SplitListSkeleton } from "@/features/split/components/SplitListSkeleton";
import { resolveUserName } from "@/features/split/lib/resolve-user-name";
import { useSession } from "@/lib/auth-client";
import { hapticSelection } from "@/lib/haptics";

import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";

type SplitsTab = "all" | "owed" | "completed";

type OwedRow = {
  split: PaymentSplit;
  youOwe: boolean;
};

function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export default function SplitsScreen() {
  const [activeTab, setActiveTab] = useState<SplitsTab>("all");
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const paymentsQuery = usePaymentsList();
  const owedByMeQuery = useSplitsOwedByMe();
  const owedToMeQuery = useSplitsOwedToMe();
  const friendsQuery = useFriendsList();

  const payments = paymentsQuery.data ?? [];
  const paymentsById = useMemo(() => {
    const map = new Map<string, Payment>();
    for (const payment of payments) {
      map.set(payment.id, payment);
    }
    return map;
  }, [payments]);

  const friends = useMemo(
    () => getAcceptedFriends(friendsQuery.data?.data ?? []),
    [friendsQuery.data?.data],
  );

  const allPayments = useMemo(() => sortByNewest(payments), [payments]);
  const completedPayments = useMemo(
    () => sortByNewest(payments.filter((payment) => payment.status === "completed")),
    [payments],
  );

  const owedRows = useMemo<OwedRow[]>(() => {
    const byMe = (owedByMeQuery.data ?? [])
      .filter((split) => split.status === "pending")
      .map((split) => ({ split, youOwe: true }));
    const toMe = (owedToMeQuery.data ?? [])
      .filter((split) => split.status === "pending")
      .map((split) => ({ split, youOwe: false }));

    return [...byMe, ...toMe].sort(
      (a, b) =>
        new Date(b.split.createdAt).getTime() -
        new Date(a.split.createdAt).getTime(),
    );
  }, [owedByMeQuery.data, owedToMeQuery.data]);

  const isLoading =
    paymentsQuery.isLoading ||
    owedByMeQuery.isLoading ||
    owedToMeQuery.isLoading;
  const isError =
    paymentsQuery.isError || owedByMeQuery.isError || owedToMeQuery.isError;
  const isFetching =
    paymentsQuery.isFetching ||
    owedByMeQuery.isFetching ||
    owedToMeQuery.isFetching;

  const openPayment = (paymentId: string) => {
    hapticSelection();
    router.push(`/(screens)/split/${paymentId}`);
  };

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader title="Splits" leading={<SwipeMenuButton />}>
        <View className="gap-4 px-4 pb-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SplitsTab)}
            variant="secondary"
          >
            <Tabs.List>
              <Tabs.ScrollView scrollAlign="center">
                <Tabs.Indicator />
                <Tabs.Trigger value="all">
                  <Tabs.Label>All</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Separator betweenValues={["all", "owed"]} />
                <Tabs.Trigger value="owed">
                  <Tabs.Label>Owed</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Separator betweenValues={["owed", "completed"]} />
                <Tabs.Trigger value="completed">
                  <Tabs.Label>Completed</Tabs.Label>
                </Tabs.Trigger>
              </Tabs.ScrollView>
            </Tabs.List>

            <Tabs.Content value="all" className="mt-4 gap-2">
              {isLoading ? <SplitListSkeleton /> : null}
              {!isLoading && isError ? (
                <Typography type="body-sm" className="text-danger">
                  Couldn’t load your splits
                  {isFetching ? " — retrying…" : "."}
                </Typography>
              ) : null}
              {!isLoading && !isError && allPayments.length === 0 ? (
                <SplitListEmpty />
              ) : null}
              {!isLoading && !isError
                ? allPayments.map((payment) => (
                    <SplitListItem
                      key={payment.id}
                      payment={payment}
                      onPress={() => openPayment(payment.id)}
                    />
                  ))
                : null}
            </Tabs.Content>

            <Tabs.Content value="owed" className="mt-4 gap-2">
              {isLoading ? <SplitListSkeleton /> : null}
              {!isLoading && isError ? (
                <Typography type="body-sm" className="text-danger">
                  Couldn’t load balances
                  {isFetching ? " — retrying…" : "."}
                </Typography>
              ) : null}
              {!isLoading && !isError && owedRows.length === 0 ? (
                <Typography type="body-sm" color="muted" className="px-1 pt-2">
                  You’re all settled. Nothing outstanding right now.
                </Typography>
              ) : null}
              {!isLoading && !isError
                ? owedRows.map(({ split, youOwe }) => {
                    const counterpartId = youOwe
                      ? split.creditorUserId
                      : split.debtorUserId;
                    return (
                      <SplitBalanceRow
                        key={split.id}
                        split={split}
                        payment={paymentsById.get(split.paymentId)}
                        counterpartName={resolveUserName(counterpartId, {
                          currentUserId,
                          currentUserName: session?.user?.name,
                          friends,
                        })}
                        youOwe={youOwe}
                        onPress={() => openPayment(split.paymentId)}
                      />
                    );
                  })
                : null}
            </Tabs.Content>

            <Tabs.Content value="completed" className="mt-4 gap-2">
              {isLoading ? <SplitListSkeleton /> : null}
              {!isLoading && isError ? (
                <Typography type="body-sm" className="text-danger">
                  Couldn’t load completed splits
                  {isFetching ? " — retrying…" : "."}
                </Typography>
              ) : null}
              {!isLoading && !isError && completedPayments.length === 0 ? (
                <Typography type="body-sm" color="muted" className="px-1 pt-2">
                  Completed splits will show up here once everyone settles.
                </Typography>
              ) : null}
              {!isLoading && !isError
                ? completedPayments.map((payment) => (
                    <SplitListItem
                      key={payment.id}
                      payment={payment}
                      onPress={() => openPayment(payment.id)}
                    />
                  ))
                : null}
            </Tabs.Content>
          </Tabs>
        </View>
      </CollapsingLargeHeader>

      <SplitFab />
    </View>
  );
}
