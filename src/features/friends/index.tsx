import { Mailbox01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";
import { router } from "expo-router";

import {
  useFriendsList,
  useFriendsListIncomingRequests,
} from "@/api/hooks/use-friends";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import SplitFab from "@/components/SplitFab";
import { hapticSelection } from "@/lib/haptics";
import { SwipeMenuButton } from "@/features/swipe-menu";

import { Chip } from "heroui-native/chip";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";

import { AddFriendHeaderButton } from "./components/add-friend-header-button";
import EmptyFriendComponent from "./components/EmptyFriendComponent";
import { FriendListEmpty } from "./components/FriendListEmpty";
import { FriendListItem } from "./components/FriendListItem";
import { FriendListSkeleton } from "./components/FriendListSkeleton";
import { getAcceptedFriends } from "./lib/friendship-status";

type FriendsTab = "friends" | "requests";

function TabTriggerLabel({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: typeof UserGroupIcon;
  badge?: number;
}) {
  const muted = useCSSVariable("--color-muted");
  const iconColor = typeof muted === "string" ? muted : "#8a8a8f";

  return (
    <View className="flex-row items-center gap-1.5">
      <HugeiconsIcon
        icon={icon}
        size={16}
        color={iconColor}
        strokeWidth={1.75}
      />
      <Tabs.Label>{label}</Tabs.Label>
      {badge && badge > 0 ? (
        <Chip size="sm" variant="soft" color="accent">
          <Chip.Label>{badge > 9 ? "9+" : String(badge)}</Chip.Label>
        </Chip>
      ) : null}
    </View>
  );
}

export default function Friends() {
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");

  const friendsQuery = useFriendsList();
  const incomingQuery = useFriendsListIncomingRequests();

  const acceptedFriends = useMemo(
    () => getAcceptedFriends(friendsQuery.data?.data ?? []),
    [friendsQuery.data?.data],
  );
  const incomingRequests = incomingQuery.data?.data ?? [];

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title="Friends"
        leading={<SwipeMenuButton />}
        trailing={<AddFriendHeaderButton />}
      >
        <View className="gap-4 px-4 pb-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FriendsTab)}
            variant="secondary"
          >
            <Tabs.List>
              <Tabs.ScrollView scrollAlign="center">
                <Tabs.Indicator />
                <Tabs.Trigger value="friends">
                  <TabTriggerLabel
                    label="Friends"
                    icon={UserGroupIcon}
                    badge={acceptedFriends.length}
                  />
                </Tabs.Trigger>
                <Tabs.Separator betweenValues={["friends", "requests"]} />
                <Tabs.Trigger value="requests">
                  <TabTriggerLabel
                    label="Requests"
                    icon={Mailbox01Icon}
                    badge={incomingRequests.length}
                  />
                </Tabs.Trigger>
              </Tabs.ScrollView>
            </Tabs.List>

            <Tabs.Content value="friends" className="mt-4 gap-2">
              {friendsQuery.isLoading ? (
                <FriendListSkeleton count={5} />
              ) : null}

              {!friendsQuery.isLoading && friendsQuery.isError ? (
                <Typography type="body-sm" className="text-danger">
                  Couldn’t load your friends
                  {friendsQuery.isFetching ? " — retrying…" : "."}
                </Typography>
              ) : null}

              {!friendsQuery.isLoading &&
              !friendsQuery.isError &&
              acceptedFriends.length === 0 ? (
                <EmptyFriendComponent />
              ) : null}

              {!friendsQuery.isLoading &&
              !friendsQuery.isError &&
              acceptedFriends.length > 0 ? (
                <View className="gap-2">
                  {acceptedFriends.map((friend) => (
                    <FriendListItem
                      key={friend.id}
                      name={friend.name}
                      userId={friend.id}
                      subtitle="Friend"
                      image={friend.image}
                      swipeStatus="friends"
                      onPress={() => {
                        hapticSelection();
                        router.push(`/(screens)/user/${friend.id}`);
                      }}
                      trailing={
                        <Chip size="sm" variant="soft" color="success">
                          <Chip.Label>Friends</Chip.Label>
                        </Chip>
                      }
                    />
                  ))}
                </View>
              ) : null}
            </Tabs.Content>

            <Tabs.Content value="requests" className="mt-4 gap-2">
              {incomingQuery.isLoading ? (
                <FriendListSkeleton count={4} />
              ) : null}

              {!incomingQuery.isLoading && incomingQuery.isError ? (
                <Typography type="body-sm" className="text-danger">
                  Couldn’t load requests
                  {incomingQuery.isFetching ? " — retrying…" : "."}
                </Typography>
              ) : null}

              {!incomingQuery.isLoading &&
              !incomingQuery.isError &&
              incomingRequests.length === 0 ? (
                <FriendListEmpty
                  title="No incoming requests"
                  description="When someone adds you, their request will land here."
                />
              ) : null}

              {!incomingQuery.isLoading &&
              !incomingQuery.isError &&
              incomingRequests.length > 0 ? (
                <View className="gap-2">
                  {incomingRequests.map((request) => (
                    <FriendListItem
                      key={request.id}
                      name={request.requester.name}
                      userId={request.requester.id}
                      subtitle="Swipe to accept or decline"
                      image={request.requester.image}
                      swipeStatus="pending_incoming"
                      friendshipId={request.id}
                      onPress={() => {
                        hapticSelection();
                        router.push(`/(screens)/user/${request.requester.id}`);
                      }}
                      trailing={
                        <Chip size="sm" variant="soft" color="accent">
                          <Chip.Label>Request</Chip.Label>
                        </Chip>
                      }
                    />
                  ))}
                </View>
              ) : null}
            </Tabs.Content>
          </Tabs>
        </View>
      </CollapsingLargeHeader>

      <SplitFab />
    </View>
  );
}
