import { View } from "react-native";

import type { CounterpartyBalance } from "../lib/profile-data";
import { formatMoney } from "@/utils/money";

import { Typography } from "heroui-native/text";

function BalanceColumn({
  label,
  amountCents,
  currency,
  amountClassName,
}: {
  label: string;
  amountCents: number;
  currency: string;
  amountClassName?: string;
}) {
  return (
    <View className="min-w-0 flex-1 gap-1">
      <Typography type="body-xs" color="muted">
        {label}
      </Typography>
      <Typography
        type="h4"
        weight="bold"
        className={amountClassName}
        numberOfLines={1}
      >
        {formatMoney(amountCents, currency)}
      </Typography>
    </View>
  );
}

export function ProfileBalanceCard({
  balance,
}: {
  balance: CounterpartyBalance;
}) {
  const bothZero =
    balance.theyOweYou.amountCents === 0 && balance.youOweThem.amountCents === 0;

  if (bothZero) {
    return (
      <View
        className="items-center gap-1 rounded-3xl bg-surface px-5 py-4"
        style={{ borderCurve: "continuous" }}
      >
        <Typography type="body-sm" weight="semibold">
          All settled between you two
        </Typography>
        <Typography type="body-xs" color="muted">
          No pending balances right now.
        </Typography>
      </View>
    );
  }

  return (
    <View
      className="rounded-3xl bg-surface px-5 py-4"
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-row items-stretch">
        <BalanceColumn
          label="They owe you"
          amountCents={balance.theyOweYou.amountCents}
          currency={balance.theyOweYou.currency}
          amountClassName={balance.theyOweYou.amountCents > 0 ? "text-success" : undefined}
        />
        <View className="mx-4 w-px bg-border" />
        <BalanceColumn
          label="You owe them"
          amountCents={balance.youOweThem.amountCents}
          currency={balance.youOweThem.currency}
          amountClassName={balance.youOweThem.amountCents > 0 ? "text-danger" : undefined}
        />
      </View>
    </View>
  );
}
