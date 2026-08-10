import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";

import { useFriendsList } from "@/api/hooks/use-friends";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { formatMoney, splitQuantityEvenly } from "@/utils/money";

import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import {
  type ItemAssignmentForm,
  type SplitItemForm,
} from "../data/split-form";

const QUANTITY_EPSILON = 0.001;

type SplitItemAssignmentsFieldProps = {
  items: SplitItemForm[];
  friendIds: string[];
  currency: string;
  value: ItemAssignmentForm[];
  onChange: (value: ItemAssignmentForm[]) => void;
  error?: string | null;
};

export function SplitItemAssignmentsField({
  items,
  friendIds,
  currency,
  value,
  onChange,
  error,
}: SplitItemAssignmentsFieldProps) {
  const { data } = useFriendsList();
  const friends = getAcceptedFriends(data?.data ?? []);
  const nameById = new Map(friends.map((friend) => [friend.id, friend.name]));

  const filledItems = items.filter(
    (item) => item.name.trim() || item.unitPriceCents > 0,
  );
  const filledItemIds = filledItems.map((item) => item.localId).join(",");
  const friendKey = friendIds.join(",");

  useEffect(() => {
    const next = filledItems.map((item) => {
      const existing = value.find((a) => a.itemLocalId === item.localId);
      const allocations = friendIds.map((userId) => {
        const prev = existing?.allocations.find((a) => a.userId === userId);
        return { userId, quantity: prev?.quantity ?? 0 };
      });
      return { itemLocalId: item.localId, allocations };
    });

    if (JSON.stringify(next) !== JSON.stringify(value)) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledItemIds, friendKey]);

  if (friendIds.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Name the accomplices first, then come back to assign the guilt.
      </Typography>
    );
  }

  if (filledItems.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Autopsy the receipt first — add some items, then assign them here.
      </Typography>
    );
  }

  return (
    <View className="gap-4">
      {filledItems.map((item) => {
        const assignment = value.find((a) => a.itemLocalId === item.localId);
        const allocations = assignment?.allocations ?? [];
        const assignedQuantity = allocations.reduce(
          (sum, allocation) => sum + allocation.quantity,
          0,
        );
        const isComplete =
          Math.abs(assignedQuantity - item.quantity) <= QUANTITY_EPSILON;

        const updateAllocation = (userId: string, quantity: number) => {
          const clamped = Math.max(0, quantity);
          const nextAllocations = friendIds.map((id) => {
            if (id === userId) return { userId: id, quantity: clamped };
            const existing = allocations.find((a) => a.userId === id);
            return { userId: id, quantity: existing?.quantity ?? 0 };
          });
          onChange(
            value.map((a) =>
              a.itemLocalId === item.localId
                ? { ...a, allocations: nextAllocations }
                : a,
            ),
          );
        };

        const splitEvenly = () => {
          const quantities = splitQuantityEvenly(
            item.quantity,
            friendIds.length,
          );
          const nextAllocations = friendIds.map((id, index) => ({
            userId: id,
            quantity: quantities[index] ?? 0,
          }));
          onChange(
            value.map((a) =>
              a.itemLocalId === item.localId
                ? { ...a, allocations: nextAllocations }
                : a,
            ),
          );
        };

        return (
          <View
            key={item.localId}
            className="gap-3 rounded-2xl bg-surface-secondary px-3 py-3"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <Typography type="body-sm" weight="semibold" numberOfLines={1}>
                  {item.name || "Unnamed suspect"}
                </Typography>
                <Typography type="body-xs" color="muted">
                  {formatMoney(item.unitPriceCents, currency)} × {item.quantity}
                </Typography>
              </View>
              <Button variant="tertiary" size="sm" onPress={splitEvenly}>
                <Button.Label>Split evenly</Button.Label>
              </Button>
            </View>

            <View className="gap-2">
              {friendIds.map((friendId) => {
                const quantity =
                  allocations.find((a) => a.userId === friendId)?.quantity ??
                  0;
                const friendName = nameById.get(friendId) ?? "Mystery friend";

                return (
                  <View
                    key={friendId}
                    className="flex-row items-center justify-between"
                  >
                    <Typography
                      type="body-sm"
                      numberOfLines={1}
                      className="flex-1 text-foreground"
                    >
                      {friendName}
                    </Typography>
                    <View className="flex-row items-center gap-3">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease ${friendName}'s share of ${item.name}`}
                        hitSlop={6}
                        onPress={() => updateAllocation(friendId, quantity - 1)}
                        className="size-7 items-center justify-center rounded-full bg-surface"
                      >
                        <HugeiconsIcon
                          icon={MinusSignIcon}
                          size={14}
                          strokeWidth={2}
                        />
                      </Pressable>
                      <Typography
                        type="body-sm"
                        weight="semibold"
                        className="w-8 text-center text-foreground"
                      >
                        {quantity}
                      </Typography>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Increase ${friendName}'s share of ${item.name}`}
                        hitSlop={6}
                        onPress={() => updateAllocation(friendId, quantity + 1)}
                        className="size-7 items-center justify-center rounded-full bg-surface"
                      >
                        <HugeiconsIcon
                          icon={PlusSignIcon}
                          size={14}
                          strokeWidth={2}
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            <Typography
              type="body-xs"
              color={isComplete ? "muted" : undefined}
              className={isComplete ? undefined : "text-danger"}
            >
              {assignedQuantity} of {item.quantity} units assigned
              {isComplete ? " — nobody gets away clean." : ""}
            </Typography>
          </View>
        );
      })}

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
