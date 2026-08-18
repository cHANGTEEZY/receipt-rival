import {
  ArrowRight01Icon,
  Invoice01Icon,
  Mail01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { Pressable, Share, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { Payment } from "@/api/payments";
import type { PaymentSplit } from "@/api/splits";
import {
  SwipeActionContent,
  useSwipeActionTone,
} from "@/components/swipe-action-content";
import { SwipeableRow } from "@/components/SwipeableRow";
import { getInitials } from "@/features/friends/lib/friendship-status";
import { formatMoney } from "@/utils/money";

import { Typography } from "heroui-native/text";

type SplitBalanceRowProps = {
  split: PaymentSplit;
  payment?: Payment;
  counterpartName: string;
  youOwe: boolean;
  onPress: () => void;
};

export function SplitBalanceRow({
  split,
  payment,
  counterpartName,
  youOwe,
  onPress,
}: SplitBalanceRowProps) {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : "#3b82f6";
  const openTone = useSwipeActionTone("accent");
  const payTone = useSwipeActionTone("success");
  const remindTone = useSwipeActionTone("warning");
  const title = payment?.title?.trim() || "Split";
  const initials = getInitials(title);
  const amount = formatMoney(split.amountCents, split.currency);
  const subtitle = youOwe
    ? `You owe ${counterpartName}`
    : `${counterpartName} owes you`;

  return (
    <SwipeableRow
      leftActions={
        youOwe
          ? [
              {
                accessibilityHint: "Opens this split so you can settle up",
                accessibilityLabel: `Pay ${amount} for ${title}`,
                backgroundColor: payTone.backgroundColor,
                content: (
                  <SwipeActionContent
                    color={payTone.foregroundColor}
                    icon={Money01Icon}
                    label="Pay"
                  />
                ),
                fullSwipe: true,
                key: "pay",
                onPress,
                width: 80,
              },
            ]
          : [
              {
                accessibilityLabel: `Open split ${title}`,
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
            ]
      }
      rightActions={
        youOwe
          ? [
              {
                accessibilityLabel: `Open split ${title}`,
                backgroundColor: openTone.backgroundColor,
                content: (
                  <SwipeActionContent
                    color={openTone.foregroundColor}
                    icon={ArrowRight01Icon}
                    label="Open"
                  />
                ),
                key: "open",
                onPress,
                width: 80,
              },
            ]
          : [
              {
                accessibilityLabel: `Remind ${counterpartName} about ${title}`,
                backgroundColor: remindTone.backgroundColor,
                content: (
                  <SwipeActionContent
                    color={remindTone.foregroundColor}
                    icon={Mail01Icon}
                    label="Remind"
                  />
                ),
                fullSwipe: true,
                key: "remind",
                onPress: () => {
                  void Share.share({
                    message: `Hey ${counterpartName}, just a nudge on ${title} — ${amount} is still pending.`,
                    title: `Remind ${counterpartName}`,
                  });
                },
                width: 88,
              },
            ]
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${subtitle} for ${title}`}
        onPress={onPress}
      >
        <View
          className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <View className="size-12 items-center justify-center overflow-hidden rounded-full bg-accent/15">
            {payment?.receiptImageUrl ? (
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
              {title}
            </Typography>
            <Typography type="body-sm" color="muted" numberOfLines={1}>
              {subtitle}
            </Typography>
          </View>

          <View className="shrink-0 items-end gap-0.5">
            <Typography
              type="body-sm"
              weight="semibold"
              className={youOwe ? "text-danger" : "text-success"}
            >
              {youOwe ? "−" : "+"}
              {amount}
            </Typography>
            <Typography type="body-xs" color="muted">
              Pending
            </Typography>
          </View>
        </View>
      </Pressable>
    </SwipeableRow>
  );
}
