import { useEffect } from "react";
import { View } from "react-native";

import { useFriendsList } from "@/api/hooks/use-friends";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { allocateEqualCents, formatMoney } from "@/utils/money";

import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import type { CustomSplitForm } from "../data/split-form";
import { SplitMoneyField } from "./split-money-field";

type SplitCustomAmountFieldProps = {
  friendIds: string[];
  currency: string;
  totalCents: number;
  value: CustomSplitForm[];
  onChange: (value: CustomSplitForm[]) => void;
  error?: string | null;
};

export function SplitCustomAmountField({
  friendIds,
  currency,
  totalCents,
  value,
  onChange,
  error,
}: SplitCustomAmountFieldProps) {
  const { data } = useFriendsList();
  const friends = getAcceptedFriends(data?.data ?? []);
  const nameById = new Map(friends.map((friend) => [friend.id, friend.name]));
  const friendKey = friendIds.join(",");

  useEffect(() => {
    const next = friendIds.map((userId) => {
      const existing = value.find((split) => split.userId === userId);
      return { userId, amountCents: existing?.amountCents ?? 0 };
    });

    if (JSON.stringify(next) !== JSON.stringify(value)) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendKey]);

  const assignedCents = value.reduce((sum, split) => sum + split.amountCents, 0);
  const isComplete = assignedCents === totalCents && totalCents > 0;

  const updateAmount = (userId: string, amountCents: number) => {
    onChange(
      value.map((split) =>
        split.userId === userId
          ? { ...split, amountCents: Math.max(0, amountCents) }
          : split,
      ),
    );
  };

  const splitEvenly = () => {
    const amounts = allocateEqualCents(totalCents, friendIds.length);
    onChange(
      friendIds.map((userId, index) => ({
        userId,
        amountCents: amounts[index] ?? 0,
      })),
    );
  };

  if (friendIds.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Name the accomplices first, then come back to name your price.
      </Typography>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Typography
          type="body-sm"
          color={isComplete ? "muted" : undefined}
          className={isComplete ? undefined : "text-danger"}
        >
          {formatMoney(assignedCents, currency)} of{" "}
          {formatMoney(totalCents, currency)} assigned
        </Typography>
        <Button variant="tertiary" size="sm" onPress={splitEvenly}>
          <Button.Label>Split evenly</Button.Label>
        </Button>
      </View>

      <View className="gap-3">
        {friendIds.map((friendId) => {
          const amountCents =
            value.find((split) => split.userId === friendId)?.amountCents ?? 0;
          const friendName = nameById.get(friendId) ?? "Mystery friend";

          return (
            <View key={friendId} className="flex-row items-center gap-3">
              <Typography
                type="body-sm"
                numberOfLines={1}
                className="flex-1 text-foreground"
              >
                {friendName}
              </Typography>
              <View className="w-28">
                <SplitMoneyField
                  label=""
                  valueCents={amountCents}
                  onChangeCents={(cents) => updateAmount(friendId, cents)}
                  placeholder="0.00"
                />
              </View>
            </View>
          );
        })}
      </View>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
