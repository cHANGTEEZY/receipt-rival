import { Image } from "expo-image";
import { View } from "react-native";

import { publicImageUrl } from "@/api/users";
import type { DeadbeatLeaderboardEntry } from "@/api/deadbeat";
import {
  getInitials,
} from "@/features/friends/lib/friendship-status";

import { Typography } from "heroui-native/text";

import { RankTitleChip } from "@/features/deadbeat/components/RankTitleChip";

const AVATAR_SIZE = 112;

type ProfileHeroProps = {
  name: string;
  email?: string;
  image?: string | null;
  memberSince: string | null;
  isSelf: boolean;
  shameEntry?: DeadbeatLeaderboardEntry;
  fameEntry?: DeadbeatLeaderboardEntry;
};

export function ProfileHero({
  name,
  email,
  image,
  memberSince,
  isSelf,
  shameEntry,
  fameEntry,
}: ProfileHeroProps) {
  const avatarUri = publicImageUrl(image);
  const initials = getInitials(name);

  const subtitleParts = [
    isSelf ? "This is you" : null,
    memberSince ? `Splitting since ${memberSince}` : null,
  ].filter(Boolean);

  return (
    <View className="items-center gap-3 pt-2">
      <View
        className="items-center justify-center overflow-hidden rounded-full bg-accent"
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderCurve: "continuous",
        }}
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            contentFit="cover"
          />
        ) : (
          <Typography type="h1" weight="bold" className="text-accent-foreground">
            {initials}
          </Typography>
        )}
      </View>

      <View className="items-center gap-1">
        <Typography type="h3" weight="bold" className="text-center">
          {name}
        </Typography>
        {subtitleParts.length > 0 ? (
          <Typography type="body-sm" color="muted" className="text-center">
            {subtitleParts.join(" · ")}
          </Typography>
        ) : null}
        {!isSelf && email ? (
          <Typography type="body-xs" color="muted" numberOfLines={1}>
            {email}
          </Typography>
        ) : null}
      </View>

      {shameEntry || fameEntry ? (
        <View className="flex-row flex-wrap items-center justify-center gap-2 pt-1">
          {shameEntry ? (
            <RankTitleChip title={shameEntry.title} variant="shame" />
          ) : null}
          {fameEntry ? (
            <RankTitleChip title={fameEntry.title} variant="fame" />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
