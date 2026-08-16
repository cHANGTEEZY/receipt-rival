import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, useWindowDimensions, View } from "react-native";

import type { Payment } from "@/api/payments";
import { hapticSelection } from "@/lib/haptics";
import { formatMoney } from "@/utils/money";

import { Typography } from "heroui-native/text";

const GAP = 1;
const COLUMNS = 3;

type AccountSplitsGridProps = {
  payments: Payment[];
};

export function AccountSplitsGrid({ payments }: AccountSplitsGridProps) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32;
  const tileSize = Math.floor((contentWidth - GAP * (COLUMNS - 1)) / COLUMNS);

  return (
    <View className="gap-2">
      <View className="px-3">
        <Typography
          type="h5"
          weight="medium"
          className="text-muted"
          accessibilityRole="header"
        >
          Splits
        </Typography>
      </View>

      {payments.length === 0 ? (
        <Typography type="body-sm" color="muted" className="px-3">
          No splits yet. Create one and it’ll show up here.
        </Typography>
      ) : (
        <View
          className="flex-row flex-wrap overflow-hidden rounded-4xl"
          style={{ columnGap: GAP, rowGap: GAP }}
        >
          {payments.map((payment) => (
            <Pressable
              key={payment.id}
              accessibilityRole="button"
              accessibilityLabel={payment.title}
              onPress={() => {
                hapticSelection();
                router.push(`/(screens)/split/${payment.id}`);
              }}
              style={{ width: tileSize, height: tileSize }}
              className="overflow-hidden bg-surface-secondary"
            >
              {payment.receiptImageUrl ? (
                <Image
                  source={{ uri: payment.receiptImageUrl }}
                  style={{ width: tileSize, height: tileSize }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center px-2">
                  <Typography
                    type="body-xs"
                    weight="semibold"
                    numberOfLines={2}
                    className="text-center"
                  >
                    {payment.title}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    {formatMoney(payment.totalAmountCents, payment.currency)}
                  </Typography>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
