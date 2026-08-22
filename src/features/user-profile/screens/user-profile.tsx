import { useMemo } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  useFriendsList,
  useFriendsListIncomingRequests,
} from "@/api/hooks/use-friends";
import { useDeadbeatLeaderboard } from "@/api/hooks/use-deadbeat";
import { useSplitsOwedByMe, useSplitsOwedToMe } from "@/api/hooks/use-payments";
import { useUserById } from "@/api/hooks/use-users";
import GoBackButton from "@/components/GoBackButton";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import EmptyState from "@/components/shared/EmptyState";
import { resolveFriendshipStatus } from "@/features/friends/lib/friendship-status";
import { hapticPress } from "@/lib/haptics";
import { useSession } from "@/lib/auth-client";

import { Button } from "heroui-native/button";

import { ProfileBalanceCard } from "../components/profile-balance-card";
import { ProfileFriendActions } from "../components/profile-friend-actions";
import { ProfileHero } from "../components/profile-hero";
import { ProfileRankStats } from "../components/profile-rank-stats";
import { ProfileSharedSplits } from "../components/profile-shared-splits";
import { ProfileSkeleton } from "../components/profile-skeleton";
import {
  collectSharedSplitRows,
  deriveCounterpartyBalance,
  findUserRankEntries,
  formatMemberSince,
} from "../lib/profile-data";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: session } = useSession();

  const currentUserId = session?.user.id;
  const isSelf = Boolean(currentUserId && userId === currentUserId);

  const userQuery = useUserById(userId ?? "");
  const leaderboardQuery = useDeadbeatLeaderboard();
  const owedByMeQuery = useSplitsOwedByMe();
  const owedToMeQuery = useSplitsOwedToMe();
  const friendsQuery = useFriendsList();
  const incomingQuery = useFriendsListIncomingRequests();

  const user = userQuery.data?.data;
  const name = user?.name?.trim() || "Unknown";

  const balance = useMemo(
    () =>
      deriveCounterpartyBalance({
        userId: userId ?? "",
        owedByMe: owedByMeQuery.data ?? [],
        owedToMe: owedToMeQuery.data ?? [],
      }),
    [userId, owedByMeQuery.data, owedToMeQuery.data],
  );

  const rankEntries = useMemo(
    () => findUserRankEntries(leaderboardQuery.data, userId ?? ""),
    [leaderboardQuery.data, userId],
  );

  const sharedRows = useMemo(
    () =>
      collectSharedSplitRows({
        userId: userId ?? "",
        owedByMe: owedByMeQuery.data ?? [],
        owedToMe: owedToMeQuery.data ?? [],
      }),
    [userId, owedByMeQuery.data, owedToMeQuery.data],
  );

  const friendship = useMemo(
    () =>
      resolveFriendshipStatus({
        userId: userId ?? "",
        currentUserId,
        friendships: friendsQuery.data?.data ?? [],
        incomingRequests: incomingQuery.data?.data ?? [],
      }),
    [userId, currentUserId, friendsQuery.data, incomingQuery.data],
  );

  const memberSince = formatMemberSince(user?.createdAt);
  const isLoading = !isSelf && userQuery.isPending;

  const balancesLoading =
    owedByMeQuery.isLoading ||
    owedToMeQuery.isLoading ||
    leaderboardQuery.isLoading;

  if (!userId) {
    return (
      <View className="flex-1 bg-background">
        <MeshBackground />
        <CollapsingLargeHeader title="Profile" leading={<GoBackButton />}>
          <View className="px-4 pb-8">
            <EmptyState
              title="Profile not found"
              description="This profile link looks broken. Head back and try again."
            />
          </View>
        </CollapsingLargeHeader>
      </View>
    );
  }

  const isError = !isSelf && userQuery.isError;

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title={isSelf ? "You" : name}
        leading={<GoBackButton />}
      >
        <View className="gap-6 px-4 pb-8">
          {isLoading ? <ProfileSkeleton /> : null}

          {!isLoading && isError ? (
            <EmptyState
              title="Couldn't load this profile"
              description={
                userQuery.error instanceof Error
                  ? userQuery.error.message
                  : "Check your connection and try again."
              }
              actionLabel="Try again"
              onAction={() => {
                hapticPress();
                void userQuery.refetch();
              }}
            />
          ) : null}

          {!isLoading &&
          !isError &&
          !isSelf &&
          userQuery.isSuccess &&
          !user ? (
            <EmptyState
              title="Nobody home"
              description="We couldn't find this person. They may have deleted their account."
            />
          ) : null}

          {!isLoading && !isError && (user || isSelf) ? (
            <>
              <ProfileHero
                name={isSelf ? (session?.user.name ?? "You") : name}
                email={isSelf ? session?.user.email : user?.email}
                image={isSelf ? session?.user.image : user?.image}
                memberSince={memberSince}
                isSelf={isSelf}
                shameEntry={rankEntries.shame}
                fameEntry={rankEntries.fame}
              />

              {!isSelf ? (
                <ProfileFriendActions
                  userId={userId}
                  name={name}
                  status={friendship.status}
                  friendshipId={friendship.friendshipId}
                />
              ) : null}

              {isSelf ? (
                <Button
                  variant="secondary"
                  size="md"
                  className="rounded-full self-center px-8"
                  onPress={() => {
                    hapticPress();
                    router.push("/(screens)/settings/account");
                  }}
                >
                  <Button.Label>Edit profile</Button.Label>
                </Button>
              ) : null}

              {balancesLoading ? (
                <View className="h-[76px] rounded-3xl bg-surface" />
              ) : (
                <ProfileBalanceCard balance={balance} />
              )}

              <ProfileRankStats
                shameEntry={rankEntries.shame}
                fameEntry={rankEntries.fame}
              />

              <ProfileSharedSplits rows={sharedRows} />
            </>
          ) : null}
        </View>
      </CollapsingLargeHeader>
    </View>
  );
}
