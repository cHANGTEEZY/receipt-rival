import { View } from "react-native";

import type { Settlement } from "@/api/settlements";
import { formatMoney } from "@/utils/money";

import { Button } from "heroui-native/button";
import { Chip } from "heroui-native/chip";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

type CashReviewCardProps = {
  payerName: string;
  settlements: Settlement[];
  currency: string;
  isConfirming?: boolean;
  isRejecting?: boolean;
  onConfirm: () => void;
  onReject: () => void;
};

export function CashReviewCard({
  payerName,
  settlements,
  currency,
  isConfirming = false,
  isRejecting = false,
  onConfirm,
  onReject,
}: CashReviewCardProps) {
  const totalCents = settlements.reduce(
    (sum, settlement) => sum + settlement.amountCents,
    0,
  );
  const busy = isConfirming || isRejecting;

  return (
    <View
      className="gap-4 rounded-3xl border border-warning/30 bg-warning/10 px-4 py-4"
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Typography type="body" weight="semibold">
            {payerName} says they paid in cash
          </Typography>
          <Typography type="body-sm" color="muted">
            Confirm only if you actually received{" "}
            {formatMoney(totalCents, currency)}.
          </Typography>
        </View>
        <Chip size="sm" variant="soft" color="warning">
          <Chip.Label>Review</Chip.Label>
        </Chip>
      </View>

      <Typography type="h5" weight="bold">
        {formatMoney(totalCents, currency)}
      </Typography>

      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          isDisabled={busy}
          onPress={onReject}
        >
          {isRejecting ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Reject</Button.Label>
          )}
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          isDisabled={busy}
          onPress={onConfirm}
        >
          {isConfirming ? (
            <Spinner size="sm" color="white" />
          ) : (
            <Button.Label>Confirm</Button.Label>
          )}
        </Button>
      </View>
    </View>
  );
}
