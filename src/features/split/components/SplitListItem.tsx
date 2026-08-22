import { ArrowRight01Icon, ArrowUpRight01Icon, Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { Pressable, Share, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { Payment } from "@/api/payments";
import {
  SwipeActionContent,
  useSwipeActionTone,
} from "@/components/swipe-action-content";
import { SwipeableRow } from "@/components/SwipeableRow";
import { getInitials } from "@/features/friends/lib/friendship-status";
import { ACCENT_HEX } from "@/theme/accent";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Typography } from "heroui-native/text";

import { paymentStatusLabel } from "../lib/status";

type SplitListItemProps = {
  payment: Payment;
  onPress: () => void;
};

function statusTextClass(status: Payment["status"]): string {
  switch (status) {
    case "completed":
      return "text-success";
    case "finalized":
      return "text-accent";
    case "draft":
      return "text-warning";
    case "cancelled":
      return "text-muted";
    default:
      return "text-muted";
  }
}

export function SplitListItem({ payment, onPress }: SplitListItemProps) {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : ACCENT_HEX;
  const openTone = useSwipeActionTone("accent");
  const shareTone = useSwipeActionTone("neutral");
  const initials = getInitials(payment.title);
  const subtitleParts = [
    payment.dueAt ? `Due ${formatShortDate(payment.dueAt)}` : null,
    payment.locationName,
  ].filter(Boolean);
  const amount = formatMoney(payment.totalAmountCents, payment.currency);

  return (
    <SwipeableRow
      leftActions={[
        {
          accessibilityLabel: `Open split ${payment.title}`,
          backgroundColor: openTone.backgroundColor,
          content: (
            <SwipeActionContent
              color={openTone.foregroundColor}
              icon={ArrowRight01Icon}
              label="Open"
            />
          ),
          fullSwipe: true,
          key: "open",
          onPress,
          width: 80,
        },
      ]}
      rightActions={[
        {
          accessibilityLabel: `Share split ${payment.title}`,
          backgroundColor: shareTone.backgroundColor,
          content: (
            <SwipeActionContent
              color={shareTone.foregroundColor}
              icon={ArrowUpRight01Icon}
              label="Share"
            />
          ),
          key: "share",
          onPress: () => {
            void Share.share({
              message: `${payment.title} · ${amount}`,
              title: payment.title,
            });
          },
          width: 80,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open split ${payment.title}`}
        onPress={onPress}
      >
        <View
          className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <View className="size-12 items-center justify-center overflow-hidden rounded-full bg-accent/15">
            {payment.receiptImageUrl ? (
              <Image
                source={{ uri: payment.receiptImageUrl }}
                style={{ width: 48, height: 48 }}
                contentFit="cover"
              />
            ) : initials && initials !== "?" ? (
              <Typography type="body-sm" weight="bold" className="text-accent">
                {initials}
              </Typography>
            ) : (
              <HugeiconsIcon
                icon={Invoice01Icon}
                size={20}
                color={iconColor}
                strokeWidth={1.75}
              />
            )}
          </View>

          <View className="min-w-0 flex-1 gap-0.5">
            <Typography type="body" weight="semibold" numberOfLines={1}>
              {payment.title}
            </Typography>
            <Typography type="body-sm" color="muted" numberOfLines={1}>
              {subtitleParts.length > 0
                ? subtitleParts.join(" · ")
                : paymentStatusLabel(payment.status)}
            </Typography>
          </View>

          <View className="shrink-0 items-end gap-0.5">
            <Typography type="body-sm" weight="semibold">
              {amount}
            </Typography>
            <Typography
              type="body-xs"
              className={statusTextClass(payment.status)}
            >
              {paymentStatusLabel(payment.status)}
            </Typography>
          </View>
        </View>
      </Pressable>
    </SwipeableRow>
  );
}
