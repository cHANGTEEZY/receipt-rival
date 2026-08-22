import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { useDeadbeatLeaderboard } from "@/api/hooks/use-deadbeat";
import {
  usePaymentsList,
  useSplitsOwedByMe,
  useSplitsOwedToMe,
} from "@/api/hooks/use-payments";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import ProfileButton from "@/components/ProfileButton";
import SplitFab from "@/components/SplitFab";
import { SwipeMenuButton } from "@/features/swipe-menu";
import { SplitListItem } from "@/features/split/components/SplitListItem";
import { SplitListSkeleton } from "@/features/split/components/SplitListSkeleton";
import { useSession } from "@/lib/auth-client";
import { hapticSelection } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

import { HomeBalanceHero } from "./components/home-balance-hero";
import { HomeEmpty } from "./components/home-empty";
import { HomeAllSettled, HomeNoReceiptsHint } from "./components/home-hints";
import { HomeQuickActions } from "./components/home-quick-actions";
import {
  computeHomeStats,
  HomeStatsStrip,
} from "./components/home-stats-strip";
import { HomeTopRanks } from "./components/home-top-ranks";
import { primaryPendingTotal } from "./lib/balances";

const RECENT_LIMIT = 5;

export default function Home() {
  const { data: session } = useSession();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  const paymentsQuery = usePaymentsList();
  const owedByMeQuery = useSplitsOwedByMe();
  const owedToMeQuery = useSplitsOwedToMe();
  const deadbeatQuery = useDeadbeatLeaderboard();

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

  const youOwe = useMemo(
    () => primaryPendingTotal(owedByMeQuery.data),
    [owedByMeQuery.data],
  );
  const owedToYou = useMemo(
    () => primaryPendingTotal(owedToMeQuery.data),
    [owedToMeQuery.data],
  );

  const stats = useMemo(
    () =>
      computeHomeStats(owedByMeQuery.data ?? [], owedToMeQuery.data ?? []),
    [owedByMeQuery.data, owedToMeQuery.data],
  );

  const recentPayments = useMemo(() => {
    const list = paymentsQuery.data ?? [];
    return [...list]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, RECENT_LIMIT);
  }, [paymentsQuery.data]);

  const shameEntries = deadbeatQuery.data?.shame.entries ?? [];
  const topRanksLoading = !isError && deadbeatQuery.isLoading;

  const hasPayments = (paymentsQuery.data ?? []).length > 0;
  const hasBalances = youOwe.amountCents > 0 || owedToYou.amountCents > 0;
  const showEmpty = !isLoading && !isError && !hasPayments && !hasBalances;

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title={firstName}
        leading={<SwipeMenuButton />}
        trailing={
          <ProfileButton onPress={() => router.push("/(screens)/settings")} />
        }
      >
        <View className="gap-6 px-4 pb-8">
          {isLoading ? (
            <View className="gap-6">
              <View
                className="h-36 rounded-4xl bg-surface"
                style={{ borderCurve: "continuous" }}
              />
              <View className="flex-row gap-2">
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    className="h-[72px] flex-1 rounded-3xl bg-surface"
                    style={{ borderCurve: "continuous" }}
                  />
                ))}
              </View>
              <SplitListSkeleton count={3} />
            </View>
          ) : null}

          {!isLoading && isError ? (
            <Typography type="body-sm" className="text-danger">
              Couldn’t load your balances
              {isFetching ? " — retrying…" : "."}
            </Typography>
          ) : null}

          {!isLoading && !isError && showEmpty ? <HomeEmpty /> : null}

          {!isLoading && !isError && !showEmpty ? (
            <>
              <HomeBalanceHero
                youOwe={youOwe}
                owedToYou={owedToYou}
                shame={deadbeatQuery.data?.shame.me}
                fame={deadbeatQuery.data?.fame.me}
              />

              <HomeQuickActions />

              <HomeStatsStrip stats={stats} />

              {topRanksLoading ? (
                <View
                  className="gap-3 rounded-4xl bg-surface p-3"
                  style={{ borderCurve: "continuous" }}
                >
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      className="h-[56px] rounded-3xl bg-surface-secondary"
                      style={{ borderCurve: "continuous" }}
                    />
                  ))}
                </View>
              ) : (
                <HomeTopRanks
                  entries={shameEntries}
                  totalCount={shameEntries.length}
                />
              )}

              {hasPayments ? (
                <View className="gap-3">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View all splits"
                    className="flex-row items-center justify-between px-1"
                    onPress={() => {
                      hapticSelection();
                      router.push("/(app)/splits");
                    }}
                  >
                    <Typography type="h5" weight="semibold">
                      Splits
                    </Typography>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      color={mutedColor}
                      strokeWidth={1.75}
                    />
                  </Pressable>

                  {!hasBalances ? <HomeAllSettled /> : null}

                  <View className="gap-2">
                    {recentPayments.map((payment) => (
                      <SplitListItem
                        key={payment.id}
                        payment={payment}
                        onPress={() => {
                          hapticSelection();
                          router.push(`/(screens)/split/${payment.id}`);
                        }}
                      />
                    ))}
                  </View>
                </View>
              ) : hasBalances ? (
                <HomeNoReceiptsHint />
              ) : null}
            </>
          ) : null}
        </View>
      </CollapsingLargeHeader>

      <SplitFab />
    </View>
  );
}
