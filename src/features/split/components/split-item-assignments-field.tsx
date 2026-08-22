import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { useFriendsList } from "@/api/hooks/use-friends";
import HapticPressable from "@/components/HapticButton";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { hapticSelection } from "@/lib/haptics";
import { formatMoney, splitQuantityEvenly } from "@/utils/money";

import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import {
  type ItemAssignmentForm,
  type SplitItemForm,
} from "../data/split-form";
import {
  addRemainingQuantityTo,
  assignedQuantity,
  isFilledSplitItem,
  isRemainderItem,
  remainderAllocations,
  remainderAssigneeIds,
  remainderCategory,
  remainderShareOf,
  setRemainderShare,
  unassignedAmountCents,
  type RemainderShare,
} from "../lib/split-items";

const QUANTITY_EPSILON = 0.001;

type SplitItemAssignmentsFieldProps = {
  items: SplitItemForm[];
  friendIds: string[];
  currentUserId?: string;
  currency: string;
  value: ItemAssignmentForm[];
  onChange: (value: ItemAssignmentForm[]) => void;
  onChangeItems?: (items: SplitItemForm[]) => void;
  error?: string | null;
};

function SharePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");
  const border = useCSSVariable("--color-border");
  const selectedColor = typeof foreground === "string" ? foreground : "#1C1C1E";
  const idleColor = typeof muted === "string" ? muted : "#8E8E93";
  const idleBorder = typeof border === "string" ? border : "#E3E3E6";

  return (
    <HapticPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      haptic={
        selected ? { type: "none" } : { type: "pulsar", effect: "selection" }
      }
      hapticTrigger="onPressIn"
      onPress={onPress}
      className="rounded-full px-3 py-1.5"
      style={{
        borderCurve: "continuous",
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? selectedColor : idleBorder,
      }}
    >
      <Typography
        type="body-xs"
        weight="semibold"
        style={{ color: selected ? selectedColor : idleColor }}
      >
        {label}
      </Typography>
    </HapticPressable>
  );
}

export function SplitItemAssignmentsField({
  items,
  friendIds,
  currentUserId,
  currency,
  value,
  onChange,
  onChangeItems,
  error,
}: SplitItemAssignmentsFieldProps) {
  const { data } = useFriendsList();
  const friends = getAcceptedFriends(data?.data ?? []);
  const nameById = new Map(friends.map((friend) => [friend.id, friend.name]));

  const filledItems = items.filter(isFilledSplitItem);
  const filledItemIds = filledItems.map((item) => item.localId).join(",");
  const friendKey = friendIds.join(",");
  const remainderKey = filledItems
    .filter(isRemainderItem)
    .map(
      (item) => `${item.localId}:${item.category}:${item.unitPriceCents}`,
    )
    .join(",");

  useEffect(() => {
    const next = filledItems.map((item) => {
      const existing = value.find((a) => a.itemLocalId === item.localId);

      if (isRemainderItem(item)) {
        return {
          itemLocalId: item.localId,
          allocations: remainderAllocations(item, friendIds, currentUserId),
        };
      }

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
  }, [filledItemIds, friendKey, remainderKey]);

  if (friendIds.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Select friends first, then come back to assign items.
      </Typography>
    );
  }

  if (filledItems.length === 0) {
    return (
      <Typography type="body-sm" color="muted">
        Add items first, then assign them here.
      </Typography>
    );
  }

  const remainingAssignCents = filledItems.reduce((sum, item) => {
    const assignment = value.find((a) => a.itemLocalId === item.localId);
    return (
      sum + Math.max(0, unassignedAmountCents(item, assignment?.allocations))
    );
  }, 0);
  const isAssignComplete = remainingAssignCents === 0;

  const othersIds = remainderAssigneeIds(
    friendIds,
    currentUserId,
    "everyone-else",
  );

  const replaceItemAllocations = (
    itemLocalId: string,
    allocations: ItemAssignmentForm["allocations"],
  ) => {
    onChange(
      value.map((assignment) =>
        assignment.itemLocalId === itemLocalId
          ? { ...assignment, allocations }
          : assignment,
      ),
    );
  };

  return (
    <View
      className={`gap-4 ${error ? "rounded-2xl border border-danger p-3" : ""}`}
      style={error ? { borderCurve: "continuous" } : undefined}
    >
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Typography type="body-xs" color="muted">
            {isAssignComplete ? "All assigned" : "Left to assign"}
          </Typography>
          <Typography
            type="h5"
            weight="semibold"
            className={isAssignComplete ? "text-foreground" : "text-danger"}
          >
            {formatMoney(remainingAssignCents, currency)}
          </Typography>
        </View>
        <Typography type="body-xs" color="muted" className="text-right">
          Dump leftovers on others instead of tapping every unit.
        </Typography>
      </View>

      {filledItems.map((item) => {
        const assignment = value.find((a) => a.itemLocalId === item.localId);
        const allocations = assignment?.allocations ?? [];
        const assigned = assignedQuantity(allocations);
        const isComplete =
          Math.abs(assigned - item.quantity) <= QUANTITY_EPSILON;
        const remainingQty = item.quantity - assigned;
        const remainingCents = Math.max(
          0,
          unassignedAmountCents(item, allocations),
        );
        const isRemainder = isRemainderItem(item);
        const share = isRemainder ? remainderShareOf(item) : null;

        const updateAllocation = (userId: string, quantity: number) => {
          const clamped = Math.max(0, quantity);
          const nextAllocations = friendIds.map((id) => {
            if (id === userId) return { userId: id, quantity: clamped };
            const existing = allocations.find((a) => a.userId === id);
            return { userId: id, quantity: existing?.quantity ?? 0 };
          });
          replaceItemAllocations(item.localId, nextAllocations);
        };

        const splitEvenly = () => {
          if (isRemainder) {
            applyRemainderShare("everyone");
            return;
          }
          const quantities = splitQuantityEvenly(
            item.quantity,
            friendIds.length,
          );
          replaceItemAllocations(
            item.localId,
            friendIds.map((id, index) => ({
              userId: id,
              quantity: quantities[index] ?? 0,
            })),
          );
        };

        const applyRemainderShare = (nextShare: RemainderShare) => {
          hapticSelection();
          onChangeItems?.(setRemainderShare(items, nextShare));
          replaceItemAllocations(
            item.localId,
            remainderAllocations(
              { ...item, category: remainderCategory(nextShare) },
              friendIds,
              currentUserId,
            ),
          );
        };

        const giveRemainingToYou = () => {
          if (!currentUserId || remainingQty <= QUANTITY_EPSILON) return;
          hapticSelection();
          replaceItemAllocations(
            item.localId,
            addRemainingQuantityTo(
              item,
              allocations,
              friendIds,
              [currentUserId],
              { byCents: isRemainder },
            ),
          );
        };

        const giveRemainingToOthers = () => {
          if (remainingQty <= QUANTITY_EPSILON || othersIds.length === 0) {
            return;
          }
          hapticSelection();
          replaceItemAllocations(
            item.localId,
            addRemainingQuantityTo(item, allocations, friendIds, othersIds, {
              byCents: isRemainder,
            }),
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
                  {item.name || "Unnamed item"}
                </Typography>
                <Typography type="body-xs" color="muted">
                  {isRemainder
                    ? `${formatMoney(item.unitPriceCents, currency)} leftover`
                    : `${formatMoney(item.unitPriceCents, currency)} × ${item.quantity}`}
                </Typography>
              </View>
              {isRemainder ? null : (
                <Button variant="tertiary" size="sm" onPress={splitEvenly}>
                  <Button.Label>Split evenly</Button.Label>
                </Button>
              )}
            </View>

            {isRemainder ? (
              <View className="gap-2">
                <Typography type="body-xs" color="muted">
                  Split this leftover without assigning every line.
                </Typography>
                <View className="flex-row flex-wrap gap-2">
                  <SharePill
                    label="Everyone else"
                    selected={share === "everyone-else"}
                    onPress={() => applyRemainderShare("everyone-else")}
                  />
                  <SharePill
                    label="Everyone"
                    selected={share === "everyone"}
                    onPress={() => applyRemainderShare("everyone")}
                  />
                </View>
              </View>
            ) : remainingQty > QUANTITY_EPSILON ? (
              <View className="flex-row flex-wrap gap-2">
                {currentUserId ? (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onPress={giveRemainingToYou}
                  >
                    <Button.Label>Rest to you</Button.Label>
                  </Button>
                ) : null}
                {othersIds.length > 0 ? (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onPress={giveRemainingToOthers}
                  >
                    <Button.Label>Rest to others</Button.Label>
                  </Button>
                ) : null}
              </View>
            ) : null}

            <View className="gap-2">
              {friendIds.map((friendId) => {
                const quantity =
                  allocations.find((a) => a.userId === friendId)?.quantity ??
                  0;
                const friendName =
                  friendId === currentUserId
                    ? "You"
                    : (nameById.get(friendId) ?? "Mystery friend");
                const shareCents = Math.round(
                  quantity * item.unitPriceCents,
                );

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
                    {isRemainder ? (
                      <Typography
                        type="body-sm"
                        weight="semibold"
                        className="text-foreground"
                      >
                        {shareCents > 0
                          ? formatMoney(shareCents, currency)
                          : "—"}
                      </Typography>
                    ) : (
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Decrease ${friendName}'s share of ${item.name}`}
                          hitSlop={6}
                          onPress={() =>
                            updateAllocation(friendId, quantity - 1)
                          }
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
                          onPress={() =>
                            updateAllocation(friendId, quantity + 1)
                          }
                          className="size-7 items-center justify-center rounded-full bg-surface"
                        >
                          <HugeiconsIcon
                            icon={PlusSignIcon}
                            size={14}
                            strokeWidth={2}
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <Typography
              type="body-xs"
              color={isComplete ? "muted" : undefined}
              className={isComplete ? undefined : "text-danger"}
            >
              {isRemainder
                ? isComplete
                  ? "Leftover fully assigned"
                  : `${formatMoney(remainingCents, currency)} leftover still unassigned`
                : remainingCents > 0
                  ? `${formatMoney(remainingCents, currency)} left · ${assigned} of ${item.quantity} units`
                  : `${assigned} of ${item.quantity} units assigned`}
            </Typography>
          </View>
        );
      })}

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
