import {
  Money01Icon,
  MoneyReceive01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { type ComponentProps } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticSelection } from "@/lib/haptics";
import { formatMoney } from "@/utils/money";

import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";
import { PressableFeedback } from "heroui-native";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

type PaymentMethodOption = {
  id: "esewa" | "khalti" | "cash";
  label: string;
  description: string;
  icon: IconData;
  color: string;
  available: boolean;
};

const METHODS: PaymentMethodOption[] = [
  {
    id: "esewa",
    label: "eSewa",
    description: "Pay digitally with eSewa — coming soon",
    icon: Wallet01Icon,
    color: "#60BB46",
    available: false,
  },
  {
    id: "khalti",
    label: "Khalti",
    description: "Pay digitally with Khalti — coming soon",
    icon: MoneyReceive01Icon,
    color: "#5C2D91",
    available: false,
  },
  {
    id: "cash",
    label: "Settled in cash",
    description: "Tell the owner you already paid in cash",
    icon: Money01Icon,
    color: "#F59E0B",
    available: true,
  },
];

type PaymentMethodsSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amountCents: number;
  currency: string;
  isSubmittingCash?: boolean;
  onSelectCash: () => void | Promise<void>;
};

export function PaymentMethodsSheet({
  isOpen,
  onOpenChange,
  amountCents,
  currency,
  isSubmittingCash = false,
  onSelectCash,
}: PaymentMethodsSheetProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8A8A8F";

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["52%"]}>
          <View className="gap-5 pb-2">
            <View className="gap-1">
              <BottomSheet.Title>Pay your share</BottomSheet.Title>
              <BottomSheet.Description>
                {formatMoney(amountCents, currency)} · pick how you settled up
              </BottomSheet.Description>
            </View>

            <View className="gap-3">
              {METHODS.map((method) => {
                const disabled =
                  !method.available || (method.id === "cash" && isSubmittingCash);

                return (
                  <PressableFeedback
                    key={method.id}
                    animation={false}
                    isDisabled={disabled}
                    onPress={() => {
                      if (method.id !== "cash") return;
                      hapticSelection();
                      void onSelectCash();
                    }}
                    className="overflow-hidden rounded-3xl"
                    accessibilityRole="button"
                    accessibilityState={{ disabled }}
                    accessibilityLabel={method.label}
                  >
                    <PressableFeedback.Highlight
                      animation={{
                        backgroundColor: { value: method.color },
                        opacity: { value: [0, 0.08] },
                      }}
                    />

                    <View
                      className={`flex-row items-center gap-3.5 rounded-3xl border border-border bg-surface p-4 ${
                        disabled ? "opacity-55" : ""
                      }`}
                      style={{ borderCurve: "continuous" }}
                    >
                      <View
                        className="size-11 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: method.color,
                          borderCurve: "continuous",
                        }}
                      >
                        <HugeiconsIcon
                          icon={method.icon}
                          size={22}
                          color="#FFFFFF"
                          strokeWidth={1.75}
                        />
                      </View>

                      <View className="min-w-0 flex-1 gap-0.5">
                        <Typography type="body-sm" weight="semibold">
                          {method.label}
                        </Typography>
                        <Typography type="body-xs" color="muted">
                          {method.description}
                        </Typography>
                      </View>

                      {method.id === "cash" && isSubmittingCash ? (
                        <Spinner size="sm" />
                      ) : !method.available ? (
                        <Typography type="body-xs" style={{ color: mutedColor }}>
                          Soon
                        </Typography>
                      ) : null}
                    </View>
                  </PressableFeedback>
                );
              })}
            </View>

            <Button
              variant="tertiary"
              onPress={() => onOpenChange(false)}
              isDisabled={isSubmittingCash}
            >
              <Button.Label>Cancel</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
