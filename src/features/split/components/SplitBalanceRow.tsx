import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { Payment } from "@/api/payments";
import type { PaymentSplit } from "@/api/splits";
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
  const title = payment?.title?.trim() || "Split";
  const initials = getInitials(title);
  const subtitle = youOwe
    ? `You owe ${counterpartName}`
    : `${counterpartName} owes you`;

  return (
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
            {formatMoney(split.amountCents, split.currency)}
          </Typography>
          <Typography type="body-xs" color="muted">
            Pending
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}
