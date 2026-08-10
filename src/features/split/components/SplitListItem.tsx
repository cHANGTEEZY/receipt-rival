import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { Payment } from "@/api/payments";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";

type SplitListItemProps = {
  payment: Payment;
  onPress: () => void;
};

function statusChipColor(
  status: Payment["status"],
): "accent" | "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "finalized":
      return "accent";
    case "completed":
      return "success";
    case "draft":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
}

export function SplitListItem({ payment, onPress }: SplitListItemProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open split ${payment.title}`}
      onPress={onPress}
    >
      <View
        className="flex-row items-center gap-3 rounded-3xl bg-surface px-4 py-3.5"
        style={{ borderCurve: "continuous" }}
      >
        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-center gap-2">
            <Typography
              type="body"
              weight="semibold"
              numberOfLines={1}
              className="min-w-0 flex-1"
            >
              {payment.title}
            </Typography>
            <Chip size="sm" variant="soft" color={statusChipColor(payment.status)}>
              <Chip.Label className="capitalize">{payment.status}</Chip.Label>
            </Chip>
          </View>

          <Typography type="body-sm" color="muted" numberOfLines={1}>
            {formatMoney(payment.totalAmountCents, payment.currency)}
            {" · "}
            Due {formatShortDate(payment.dueAt)}
            {payment.locationName ? ` · ${payment.locationName}` : ""}
          </Typography>
        </View>

        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={18}
          color={mutedColor}
          strokeWidth={1.75}
        />
      </View>
    </Pressable>
  );
}
