import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";
import { hapticSelection } from "@/lib/haptics";
import { formatMoney } from "@/utils/money";
import type { ItemRowErrors } from "@/utils/errors";

import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import {
  centsToDisplay,
  createEmptySplitItem,
  displayToCents,
  displayToQuantity,
  type SplitItemForm,
} from "../data/split-form";
import {
  isRemainderItem,
  itemLineTotalCents,
  putRemainingOnOthers,
  remainingAfterLinesCents,
  remainderShareOf,
  setRemainderShare,
  sumFilledItemsCents,
  syncRemainderItem,
  type RemainderShare,
} from "../lib/split-items";
import { SplitField } from "./split-form-field";

type SplitItemsFieldProps = {
  value: SplitItemForm[];
  onChange: (items: SplitItemForm[]) => void;
  totalAmountCents: number;
  currency: string;
  allowRemainderShare?: boolean;
  error?: string | null;
  rowErrors?: Record<number, ItemRowErrors>;
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

export function SplitItemsField({
  value,
  onChange,
  totalAmountCents,
  currency,
  allowRemainderShare = false,
  error,
  rowErrors = {},
}: SplitItemsFieldProps) {
  const danger = useCSSVariable("--color-danger");
  const dangerColor = typeof danger === "string" ? danger : "#ef4444";

  const commit = (next: SplitItemForm[]) => {
    onChange(syncRemainderItem(next, totalAmountCents));
  };

  useEffect(() => {
    const next = syncRemainderItem(value, totalAmountCents);
    if (JSON.stringify(next) !== JSON.stringify(value)) {
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmountCents]);

  const updateItem = (localId: string, patch: Partial<SplitItemForm>) => {
    commit(
      value.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (localId: string) => {
    commit(value.filter((item) => item.localId !== localId));
  };

  const addItem = () => {
    commit([...value, createEmptySplitItem()]);
  };

  const putRemainingOnOthersPress = () => {
    hapticSelection();
    onChange(putRemainingOnOthers(value, totalAmountCents, "everyone-else"));
  };

  const leftoverCents = remainingAfterLinesCents(totalAmountCents, value);
  const accountedCents = sumFilledItemsCents(value);
  const gapCents = totalAmountCents - accountedCents;
  const linesCents = sumFilledItemsCents(value, { excludeRemainder: true });
  const remainderItem = value.find(isRemainderItem);
  const remainderCents = remainderItem
    ? itemLineTotalCents(remainderItem)
    : 0;
  const isBalanced = totalAmountCents > 0 && gapCents === 0;
  const isOver = gapCents < 0;
  const canDumpRemaining = leftoverCents > 0 && !remainderItem && !isOver;

  const lineItems = value.filter((item) => !isRemainderItem(item));
  const remainderShare = remainderItem
    ? remainderShareOf(remainderItem)
    : "everyone-else";

  const setShare = (share: RemainderShare) => {
    if (share === remainderShare) return;
    hapticSelection();
    onChange(setRemainderShare(value, share));
  };

  return (
    <View
      className={`gap-4 ${error ? "rounded-2xl border border-danger p-3" : ""}`}
      style={error ? { borderCurve: "continuous" } : undefined}
    >
      <View
        className="gap-3 rounded-2xl border border-border px-3.5 py-3"
        style={{ borderCurve: "continuous" }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Typography type="body-xs" color="muted">
              {isOver
                ? "Over the bill"
                : isBalanced
                  ? "All itemized"
                  : "Left to itemize"}
            </Typography>
            <Typography
              type="h5"
              weight="semibold"
              className={isOver ? "text-danger" : "text-foreground"}
            >
              {isBalanced
                ? formatMoney(totalAmountCents, currency)
                : formatMoney(
                    Math.abs(isOver ? gapCents : leftoverCents),
                    currency,
                  )}
            </Typography>
          </View>
          <Typography
            type="body-xs"
            color="muted"
            className="max-w-[45%] text-right"
          >
            {formatMoney(linesCents, currency)} of{" "}
            {formatMoney(totalAmountCents, currency)}
            {remainderCents > 0
              ? ` · ${formatMoney(remainderCents, currency)} others`
              : ""}
          </Typography>
        </View>

        {canDumpRemaining ? (
          <>
            <Typography type="body-xs" color="muted">
              Itemize the lines you care about, then dump the leftover as
              Others. Faster than typing the whole receipt.
            </Typography>
            <Button
              variant="secondary"
              size="sm"
              onPress={putRemainingOnOthersPress}
            >
              <Button.Label>
                Put remaining on others · {formatMoney(leftoverCents, currency)}
              </Button.Label>
            </Button>
          </>
        ) : null}

        {isBalanced && remainderCents > 0 ? (
          <Typography type="body-xs" color="muted">
            Others covers the leftover so you don't have to enter every line.
          </Typography>
        ) : null}

        {isOver ? (
          <Typography type="body-xs" className="text-danger">
            Line items add up to more than the bill. Trim a price or qty.
          </Typography>
        ) : null}
      </View>

      {lineItems.length === 0 && !remainderItem ? (
        <Typography type="body-sm" color="muted">
          No items yet. Add line items from the receipt.
        </Typography>
      ) : null}

      {lineItems.map((item, index) => {
        const itemError = rowErrors[value.indexOf(item)];

        return (
          <View
            key={item.localId}
            className="gap-3 rounded-2xl bg-surface-secondary px-3 py-3"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center justify-between">
              <Typography type="body-sm" weight="semibold">
                Item {index + 1}
              </Typography>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove item ${index + 1}`}
                hitSlop={8}
                onPress={() => removeItem(item.localId)}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={18}
                  color={dangerColor}
                  strokeWidth={1.75}
                />
              </Pressable>
            </View>

            <SplitField
              label="Name"
              placeholder="Pepperoni pizza"
              value={item.name}
              onChangeText={(text) => updateItem(item.localId, { name: text })}
              error={itemError?.name}
              isRequired
              autoCapitalize="sentences"
              returnKeyType="next"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <SplitField
                  label="Qty"
                  placeholder="1"
                  value={String(item.quantity)}
                  onChangeText={(text) =>
                    updateItem(item.localId, {
                      quantity: displayToQuantity(text),
                    })
                  }
                  error={itemError?.quantity}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
              <View className="flex-1">
                <SplitField
                  label="Unit price"
                  placeholder="0.00"
                  value={centsToDisplay(item.unitPriceCents)}
                  onChangeText={(text) =>
                    updateItem(item.localId, {
                      unitPriceCents: displayToCents(text),
                    })
                  }
                  error={itemError?.unitPriceCents}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>
        );
      })}

      {remainderItem ? (
        <View
          className="gap-3 rounded-2xl bg-surface-secondary px-3 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Typography type="body-sm" weight="semibold">
                Others
              </Typography>
              <Typography type="body-xs" color="muted">
                Leftover after your itemized lines. Tracks automatically as you
                add more items.
              </Typography>
            </View>
            <View className="flex-row items-center gap-3">
              <Typography type="body-sm" weight="semibold">
                {formatMoney(itemLineTotalCents(remainderItem), currency)}
              </Typography>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove others leftover"
                hitSlop={8}
                onPress={() => removeItem(remainderItem.localId)}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={18}
                  color={dangerColor}
                  strokeWidth={1.75}
                />
              </Pressable>
            </View>
          </View>

          {allowRemainderShare ? (
            <View className="gap-2">
              <Typography type="body-xs" color="muted">
                Who covers this leftover?
              </Typography>
              <View className="flex-row flex-wrap gap-2">
                <SharePill
                  label="Everyone else"
                  selected={remainderShare === "everyone-else"}
                  onPress={() => setShare("everyone-else")}
                />
                <SharePill
                  label="Everyone"
                  selected={remainderShare === "everyone"}
                  onPress={() => setShare("everyone")}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <Button variant="secondary" size="md" onPress={addItem}>
        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
        <Button.Label>Add item</Button.Label>
      </Button>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
