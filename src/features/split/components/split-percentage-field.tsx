import { useEffect } from "react";
import { View } from "react-native";

import { useFriendsList } from "@/api/hooks/use-friends";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { allocateEvenlyPercentages } from "@/utils/money";

import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Input } from "heroui-native/input";
import { Typography } from "heroui-native/text";

import type { PercentageSplitForm } from "../data/split-form";

const PERCENTAGE_EPSILON = 0.01;

type SplitPercentageFieldProps = {
  friendIds: string[];
  value: PercentageSplitForm[];
  onChange: (value: PercentageSplitForm[]) => void;
  error?: string | null;
};

export function SplitPercentageField({
  friendIds,
  value,
  onChange,
  error,
}: SplitPercentageFieldProps) {
  const { data } = useFriendsList();
  const friends = getAcceptedFriends(data?.data ?? []);
  const nameById = new Map(friends.map((friend) => [friend.id, friend.name]));
  const friendKey = friendIds.join(",");

  useEffect(() => {
    const next = friendIds.map((userId) => {
      const existing = value.find((split) => split.userId === userId);
      return { userId, percentage: existing?.percentage ?? 0 };
    });

    if (JSON.stringify(next) !== JSON.stringify(value)) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendKey]);

  const totalPercentage = value.reduce(
    (sum, split) => sum + split.percentage,
    0,
  );
  const isComplete = Math.abs(totalPercentage - 100) <= PERCENTAGE_EPSILON;

  const updatePercentage = (userId: string, percentage: number) => {
    const clamped = Math.min(100, Math.max(0, percentage));
    onChange(
      value.map((split) =>
        split.userId === userId ? { ...split, percentage: clamped } : split,
      ),
    );
  };

  const splitEvenly = () => {
    const percentages = allocateEvenlyPercentages(friendIds.length);
    onChange(
      friendIds.map((userId, index) => ({
        userId,
        percentage: percentages[index] ?? 0,
      })),
    );
  };

  if (friendIds.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Name the accomplices first, then come back to slice the pie.
      </Typography>
    );
  }

  return (
    <View
      className={`gap-4 ${error ? "rounded-2xl border border-danger p-3" : ""}`}
      style={error ? { borderCurve: "continuous" } : undefined}
    >
      <View className="flex-row items-center justify-between">
        <Typography
          type="body-sm"
          color={isComplete ? "muted" : undefined}
          className={isComplete ? undefined : "text-danger"}
        >
          {isComplete
            ? "100% assigned — the pie is whole."
            : `Missing ${(100 - totalPercentage).toFixed(1)}%`}
        </Typography>
        <Button variant="tertiary" size="sm" onPress={splitEvenly}>
          <Button.Label>Split evenly</Button.Label>
        </Button>
      </View>

      <View className="gap-3">
        {friendIds.map((friendId) => {
          const percentage =
            value.find((split) => split.userId === friendId)?.percentage ?? 0;
          const friendName = nameById.get(friendId) ?? "Mystery friend";

          return (
            <View
              key={friendId}
              className="flex-row items-center justify-between gap-3 rounded-2xl bg-surface-secondary px-3 py-2.5"
              style={{ borderCurve: "continuous" }}
            >
              <Typography
                type="body-sm"
                numberOfLines={1}
                className="flex-1 text-foreground"
              >
                {friendName}
              </Typography>
              <View className="w-24 flex-row items-center gap-1">
                <Input
                  value={String(percentage)}
                  onChangeText={(text) => {
                    const parsed = Number.parseFloat(
                      text.replace(/[^0-9.]/g, ""),
                    );
                    updatePercentage(
                      friendId,
                      Number.isNaN(parsed) ? 0 : parsed,
                    );
                  }}
                  keyboardType="decimal-pad"
                  className="flex-1 text-right"
                />
                <Typography type="body-sm" color="muted">
                  %
                </Typography>
              </View>
            </View>
          );
        })}
      </View>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
