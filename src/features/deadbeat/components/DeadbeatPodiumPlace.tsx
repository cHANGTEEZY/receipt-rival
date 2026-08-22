import {
  LaurelWreathLeft01Icon,
  LaurelWreathRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { useId, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, Rect, Stop } from "react-native-svg";

import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";
import { UserAvatar } from "@/features/friends/components/UserAvatar";
import { hapticSelection } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

const PODIUM = {
  1: {
    height: 204,
    rankSize: 50,
    avatarSize: "lg" as const,
    wreathSize: 42,
    body: "#FFD56B",
    bodyDark: "#E8B03C",
    cap: "#FFE9A0",
    bottom: "#D9A028",
    wreath: "#E0B13A",
  },
  2: {
    height: 160,
    rankSize: 42,
    avatarSize: "md" as const,
    wreathSize: 34,
    body: "#D1DCE5",
    bodyDark: "#A8B8C6",
    cap: "#E8F0F5",
    bottom: "#94A8B8",
    wreath: "#8FA3B0",
  },
  3: {
    height: 132,
    rankSize: 36,
    avatarSize: "md" as const,
    wreathSize: 32,
    body: "#FFC4BC",
    bodyDark: "#E89890",
    cap: "#FFD8D2",
    bottom: "#D8887C",
    wreath: "#D4897A",
  },
} as const;

type PodiumRank = keyof typeof PODIUM;

type DeadbeatPodiumPlaceProps = {
  entry: DeadbeatLeaderboardEntry;
};

function capRadius(width: number) {
  return Math.max(16, Math.min(24, width * 0.2));
}

function PodiumCylinder({
  width,
  height,
  rank,
}: {
  width: number;
  height: number;
  rank: PodiumRank;
}) {
  const theme = PODIUM[rank];
  const reactId = useId().replace(/:/g, "");
  const gradientId = `podium-${rank}-${reactId}`;
  const ry = capRadius(width);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={theme.bodyDark} />
          <Stop offset="0.22" stopColor={theme.cap} />
          <Stop offset="0.45" stopColor={theme.body} />
          <Stop offset="1" stopColor={theme.bodyDark} />
        </LinearGradient>
      </Defs>
      <Rect
        x={0}
        y={ry}
        width={width}
        height={height - ry * 2}
        fill={`url(#${gradientId})`}
      />
      <Ellipse
        cx={width / 2}
        cy={height - ry}
        rx={width / 2}
        ry={ry}
        fill={theme.bottom}
      />
      <Ellipse
        cx={width / 2}
        cy={ry}
        rx={width / 2}
        ry={ry}
        fill={theme.cap}
      />
      <Ellipse
        cx={width / 2}
        cy={ry * 0.72}
        rx={width / 2 - 5}
        ry={ry * 0.42}
        fill="#FFFFFF"
        opacity={0.28}
      />
    </Svg>
  );
}

export function DeadbeatPodiumPlace({ entry }: DeadbeatPodiumPlaceProps) {
  const [width, setWidth] = useState(0);
  const rank = (entry.rank === 1 || entry.rank === 2 || entry.rank === 3
    ? entry.rank
    : 3) as PodiumRank;
  const theme = PODIUM[rank];
  const displayName = entry.isCurrentUser ? "You" : entry.user.name;
  const ry = capRadius(width || 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${displayName}'s profile`}
      onPress={() => {
        hapticSelection();
        router.push(`/(screens)/user/${entry.user.id}`);
      }}
      className="flex-1 items-center"
    >
      <View className="z-20 mb-[-12] items-center" pointerEvents="none">
        <View className="flex-row items-center">
          <View className="mr-[-8]">
            <HugeiconsIcon
              icon={LaurelWreathLeft01Icon}
              size={theme.wreathSize}
              color={theme.wreath}
              strokeWidth={1.75}
            />
          </View>
          <View
            className="rounded-full border-[3px] border-white bg-white"
            style={{
              shadowColor: "#1a1a2e",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.16,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <UserAvatar
              name={entry.user.name}
              userId={entry.user.id}
              image={entry.user.image}
              size={theme.avatarSize}
            />
          </View>
          <View className="ml-[-8]">
            <HugeiconsIcon
              icon={LaurelWreathRight01Icon}
              size={theme.wreathSize}
              color={theme.wreath}
              strokeWidth={1.75}
            />
          </View>
        </View>
      </View>

      <View
        className="w-full"
        style={{ height: theme.height }}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== width) setWidth(nextWidth);
        }}
      >
        <View
          className="absolute left-2 right-2 rounded-full bg-black/15"
          style={{ bottom: -8, height: 14 }}
        />
        {width > 0 ? (
          <PodiumCylinder width={width} height={theme.height} rank={rank} />
        ) : null}

        <View
          className="absolute inset-0 items-center"
          style={{
            paddingTop: ry * 1.7 + 2,
            paddingBottom: ry * 0.7,
            paddingHorizontal: 6,
          }}
        >
          <Typography
            type="body-sm"
            weight="semibold"
            className="px-1 text-center"
            numberOfLines={1}
            style={{ color: "#3A3A3C" }}
          >
            {displayName}
          </Typography>
          <View className="flex-1" />
          <Typography
            weight="bold"
            className="text-white"
            style={{
              fontSize: theme.rankSize,
              lineHeight: theme.rankSize,
              letterSpacing: -1.5,
            }}
          >
            {entry.rank}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}
