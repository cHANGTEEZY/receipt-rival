import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

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
import type { ItemRowErrors } from "@/utils/errors";
import { SplitField } from "./split-form-field";

type SplitItemsFieldProps = {
  value: SplitItemForm[];
  onChange: (items: SplitItemForm[]) => void;
  error?: string | null;
  rowErrors?: Record<number, ItemRowErrors>;
};

export function SplitItemsField({
  value,
  onChange,
  error,
  rowErrors = {},
}: SplitItemsFieldProps) {
  const danger = useCSSVariable("--color-danger");
  const dangerColor = typeof danger === "string" ? danger : "#ef4444";

  const updateItem = (localId: string, patch: Partial<SplitItemForm>) => {
    onChange(
      value.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (localId: string) => {
    onChange(value.filter((item) => item.localId !== localId));
  };

  const addItem = () => {
    onChange([...value, createEmptySplitItem()]);
  };

  return (
    <View className="gap-4">
      {value.length === 0 ? (
        <Typography type="body-sm" color="muted">
          No items yet. Add line items from the receipt.
        </Typography>
      ) : null}

      {value.map((item, index) => {
        const itemError = rowErrors[index];

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

      <Button variant="secondary" size="md" onPress={addItem}>
        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
        <Button.Label>Add item</Button.Label>
      </Button>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
