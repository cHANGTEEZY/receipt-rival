import {
  Mailbox01Icon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import {
  useFriendsList,
  useFriendsListIncomingRequests,
} from "@/api/hooks/use-friends";
import { useUsersSearch } from "@/api/hooks/use-users";
import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import Search from "@/components/Search";
import { useSession } from "@/lib/auth-client";

import { Chip } from "heroui-native/chip";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";

import { FriendListEmpty } from "../components/FriendListEmpty";
import { FriendListItem } from "../components/FriendListItem";
import { FriendListSkeleton } from "../components/FriendListSkeleton";
import { FriendshipActionButton } from "../components/FriendshipActionButton";
import {
  getAcceptedFriends,
  resolveSearchUserFriendshipStatus,
} from "../lib/friendship-status";

type FriendsTab = "search" | "friends" | "incoming";

function TabTriggerLabel({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: typeof Search01Icon;
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

const AddOrFindFriends = () => {
  const [activeTab, setActiveTab] = useState<FriendsTab>("search");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const {
    data: friendsResponse,
    isLoading: isFriendsLoading,
    isError: isFriendsError,
  } = useFriendsList();

  const {
    data: incomingResponse,
    isLoading: isIncomingLoading,
    isError: isIncomingError,
  } = useFriendsListIncomingRequests();
  console.log("incomingResponse", JSON.stringify(incomingResponse, null, 2));

  const {
    data: searchResponse,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchError,
  } = useUsersSearch(debouncedQuery);
  console.log("searchResponse", JSON.stringify(searchResponse, null, 2));

  const friendships = friendsResponse?.data ?? [];
  const incomingRequests = incomingResponse?.data ?? [];
  const searchUsers = searchResponse?.data ?? [];
  const acceptedFriends = useMemo(
    () => getAcceptedFriends(friendships),
    [friendships],
  );

  const showSearchLoader =
    Boolean(debouncedQuery) && (isSearchLoading || isSearchFetching);

  return (
    <View className="flex-1 bg-background">
      <CollapsedLargeHeader title="Find Friends" leading={<GoBackButton />}>
        <View className="gap-4 px-4 pb-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FriendsTab)}
            variant="secondary"
          >
            <Tabs.List>
              <Tabs.ScrollView scrollAlign="center">
                <Tabs.Indicator />
                <Tabs.Trigger value="search">
                  <TabTriggerLabel label="Search" icon={Search01Icon} />
                </Tabs.Trigger>
                <Tabs.Separator betweenValues={["search", "friends"]} />
                <Tabs.Trigger value="friends">
                  <TabTriggerLabel
                    label="Friends"
                    icon={UserGroupIcon}
                    badge={acceptedFriends.length}
                  />
                </Tabs.Trigger>
                <Tabs.Separator betweenValues={["friends", "incoming"]} />
                <Tabs.Trigger value="incoming">
                  <TabTriggerLabel
                    label="Incoming"
                    icon={Mailbox01Icon}
                    badge={incomingRequests.length}
                  />
                </Tabs.Trigger>
              </Tabs.ScrollView>
            </Tabs.List>

            <Tabs.Content value="search" className="mt-4 gap-4">
              <Search
                placeholder="Search by name or email"
                onSearch={setDebouncedQuery}
                onClear={() => setDebouncedQuery("")}
              />

              {!debouncedQuery ? (
                <Typography type="body-sm" color="muted">
                  Start typing to find people you know.
                </Typography>
              ) : null}

              {showSearchLoader ? <FriendListSkeleton count={4} /> : null}

              {isSearchError ? (
                <FriendListEmpty
                  title="Search failed"
                  description="We couldn't load results right now. Try again in a moment."
                />
              ) : null}

              {!showSearchLoader &&
              debouncedQuery &&
              !isSearchError &&
              searchUsers.length === 0 ? (
                <FriendListEmpty
                  title="No matches"
                  description={`Nobody found for "${debouncedQuery}". Try another name or email.`}
                />
              ) : null}

              {!showSearchLoader && !isSearchError && searchUsers.length > 0 ? (
                <View className="gap-3">
                  {searchUsers.map((user) => {
                    const friendship = resolveSearchUserFriendshipStatus(
                      user,
                      currentUserId,
                    );

                    return (
                      <FriendListItem
                        key={user.id}
                        name={user.name}
                        userId={user.id}
                        subtitle={user.email}
                        image={user.image}
                        trailing={
                          <FriendshipActionButton
                            userId={user.id}
                            status={friendship.status}
                            friendshipId={friendship.friendshipId}
                          />
                        }
                      />
                    );
                  })}
                </View>
              ) : null}
            </Tabs.Content>

            <Tabs.Content value="friends" className="mt-4 gap-4">
              {isFriendsLoading ? <FriendListSkeleton count={5} /> : null}

              {isFriendsError ? (
                <FriendListEmpty
                  title="Couldn't load friends"
                  description="Pull to refresh or try again later."
                />
              ) : null}

              {!isFriendsLoading &&
              !isFriendsError &&
              acceptedFriends.length === 0 ? (
                <FriendListEmpty
                  title="No friends yet"
                  description="Search for people and send a request to build your crew."
                />
              ) : null}

              {!isFriendsLoading &&
              !isFriendsError &&
              acceptedFriends.length > 0 ? (
                <View className="gap-3">
                  {acceptedFriends.map((friend) => (
                    <FriendListItem
                      key={friend.id}
                      name={friend.name}
                      userId={friend.id}
                      subtitle="Friend"
                      image={friend.image}
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

            <Tabs.Content value="incoming" className="mt-4 gap-4">
              {isIncomingLoading ? <FriendListSkeleton count={4} /> : null}

              {isIncomingError ? (
                <FriendListEmpty
                  title="Couldn't load requests"
                  description="Something went wrong while fetching incoming requests."
                />
              ) : null}

              {!isIncomingLoading &&
              !isIncomingError &&
              incomingRequests.length === 0 ? (
                <FriendListEmpty
                  title="No incoming requests"
                  description="When someone adds you, their request will land here."
                />
              ) : null}

              {!isIncomingLoading &&
              !isIncomingError &&
              incomingRequests.length > 0 ? (
                <View className="gap-3">
                  {incomingRequests.map((request) => (
                    <FriendListItem
                      key={request.id}
                      name={request.requester.name}
                      userId={request.requester.id}
                      subtitle="Wants to be friends"
                      image={request.requester.image}
                      trailing={
                        <FriendshipActionButton
                          userId={request.requester.id}
                          status="pending_incoming"
                          friendshipId={request.id}
                          layout="incoming"
                        />
                      }
                    />
                  ))}
                </View>
              ) : null}
            </Tabs.Content>
          </Tabs>
        </View>
      </CollapsedLargeHeader>
    </View>
  );
};

export default AddOrFindFriends;
