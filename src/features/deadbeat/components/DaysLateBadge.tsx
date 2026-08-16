import { View } from "react-native";

import { Typography } from "heroui-native/text";

type DaysLateBadgeProps = {
  daysLate: number;
};

function badgeClass(daysLate: number): string {
  if (daysLate >= 8) return "bg-danger";
  if (daysLate >= 4) return "bg-warning";
  return "bg-surface-secondary";
}

function labelClass(daysLate: number): string {
  if (daysLate >= 8) return "text-danger-foreground";
  if (daysLate >= 4) return "text-warning-foreground";
  return "text-muted";
}

export function DaysLateBadge({ daysLate }: DaysLateBadgeProps) {
  if (daysLate <= 0) return null;

  return (
    <View
      className={`shrink-0 rounded-full px-2.5 py-1 ${badgeClass(daysLate)}`}
      style={{ borderCurve: "continuous" }}
    >
      <Typography
        type="body-xs"
        weight="semibold"
        className={labelClass(daysLate)}
      >
        {daysLate} {daysLate === 1 ? "DAY LATE" : "DAYS LATE"}
      </Typography>
    </View>
  );
}
