import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import type { SharedSplitRow } from "../lib/profile-data";
import { hapticSelection } from "@/lib/haptics";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Typography } from "heroui-native/text";

function directionLabel(direction: SharedSplitRow["direction"]): string {
  return direction === "they_owe" ? "They owe you" : "You owe them";
}

function directionClass(direction: SharedSplitRow["direction"]): string {
  return direction === "they_owe" ? "text-success" : "text-danger";
}

export function ProfileSharedSplits({ rows }: { rows: SharedSplitRow[] }) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8a8a8f";

  if (rows.length === 0) {
    return (
      <View
        className="items-center gap-1 rounded-3xl bg-surface px-5 py-4"
        style={{ borderCurve: "continuous" }}
      >
        <Typography type="body-sm" weight="semibold">
          No shared splits yet
        </Typography>
        <Typography type="body-xs" color="muted" className="text-center">
          Split a receipt with this person and it will show up here.
        </Typography>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Typography type="h5" weight="semibold" className="px-1">
        Shared splits
      </Typography>

      <View className="gap-2">
        {rows.map(({ key, split, direction }) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={`Open split ${split.paymentId}`}
            onPress={() => {
              hapticSelection();
              router.push(`/(screens)/split/${split.paymentId}`);
            }}
          >
            <View
              className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
              style={{ borderCurve: "continuous" }}
            >
              <View className="min-w-0 flex-1 gap-0.5">
                <Typography type="body-sm" weight="semibold" numberOfLines={1}>
                  {directionLabel(direction)}
                </Typography>
                <Typography type="body-xs" color="muted" numberOfLines={1}>
                  {split.status === "pending"
                    ? split.dueAt
                      ? `Due ${formatShortDate(split.dueAt)}`
                      : "No due date"
                    : `Settled · ${formatShortDate(split.createdAt)}`}
                </Typography>
              </View>

              <Typography
                type="body-sm"
                weight="bold"
                className={directionClass(direction)}
              >
                {formatMoney(split.amountCents, split.currency)}
              </Typography>

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                color={mutedColor}
                strokeWidth={1.75}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
