import {
  AddInvoiceIcon,
  BadgePercentIcon,
  Calculator01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { type ComponentProps } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticSelection } from "@/lib/haptics";

import { PressableFeedback } from "heroui-native";
import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import { SPLIT_METHODS, type SplitMethod } from "../data/split-form";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

type MethodVisual = {
  icon: IconData;
  color: string;
};

const METHOD_VISUALS: Record<SplitMethod, MethodVisual> = {
  equal: {
    icon: UserGroupIcon,
    color: "#3B82F6",
  },
  itemized: {
    icon: AddInvoiceIcon,
    color: "#10B981",
  },
  percentage: {
    icon: BadgePercentIcon,
    color: "#8B5CF6",
  },
  custom: {
    icon: Calculator01Icon,
    color: "#F59E0B",
  },
};

type SplitMethodFieldProps = {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
  error?: string | null;
};

function RadioIndicator({
  isSelected,
  accentColor,
  mutedColor,
}: {
  isSelected: boolean;
  accentColor: string;
  mutedColor: string;
}) {
  return (
    <View
      className="size-5 items-center justify-center rounded-full"
      style={{
        borderWidth: 2,
        borderColor: isSelected ? accentColor : mutedColor,
      }}
    >
      {isSelected ? (
        <View
          className="size-2.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      ) : null}
    </View>
  );
}

function MethodIconTile({
  icon,
  color,
  size = 36,
}: {
  icon: IconData;
  color: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderCurve: "continuous",
      }}
    >
      <HugeiconsIcon
        icon={icon}
        size={Math.round(size * 0.56)}
        color="#FFFFFF"
        strokeWidth={1.75}
      />
    </View>
  );
}

type SplitMethodCardProps = {
  method: (typeof SPLIT_METHODS)[number];
  visual: MethodVisual;
  isSelected: boolean;
  accentColor: string;
  mutedColor: string;
  onSelect: () => void;
};

function SplitMethodCard({
  method,
  visual,
  isSelected,
  accentColor,
  mutedColor,
  onSelect,
}: SplitMethodCardProps) {
  return (
    <PressableFeedback
      animation={false}
      onPress={onSelect}
      className="overflow-hidden rounded-3xl"
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${method.label}. ${method.description}`}
    >
      <PressableFeedback.Highlight
        animation={{
          backgroundColor: { value: accentColor },
          opacity: { value: [0, 0.07] },
        }}
      />
      <PressableFeedback.Ripple
        classNames={{ container: "overflow-hidden rounded-3xl" }}
        animation={{
          backgroundColor: { value: visual.color },
          opacity: { value: [0.14, 0.14, 0] },
          progress: { baseDuration: 280 },
        }}
      />

      <View
        className={`relative flex-row gap-3.5 rounded-3xl p-4 ${
          isSelected
            ? "border-2 border-accent bg-accent/10"
            : "border border-border bg-surface"
        }`}
        style={{ borderCurve: "continuous" }}
      >
        <View className="absolute right-4 top-4">
          <RadioIndicator
            isSelected={isSelected}
            accentColor={accentColor}
            mutedColor={mutedColor}
          />
        </View>

        <MethodIconTile icon={visual.icon} color={visual.color} />

        <View className="min-w-0 flex-1 gap-0.5 pr-7">
          <Typography type="body-sm" weight="semibold">
            {method.label}
          </Typography>
          <Typography type="body-xs" color="muted">
            {method.description}
          </Typography>
        </View>
      </View>
    </PressableFeedback>
  );
}

export function SplitMethodField({
  value,
  onChange,
  error,
}: SplitMethodFieldProps) {
  const accent = useCSSVariable("--color-accent");
  const muted = useCSSVariable("--color-muted");
  const accentColor = typeof accent === "string" ? accent : "#3B82F6";
  const mutedColor = typeof muted === "string" ? muted : "#C4C4C8";

  return (
    <View className="gap-2">
      <Typography type="body-sm" weight="semibold" className="text-foreground">
        Split method
      </Typography>

      <View className="gap-3">
        {SPLIT_METHODS.map((method) => {
          const visual = METHOD_VISUALS[method.value];
          const isSelected = value === method.value;

          return (
            <SplitMethodCard
              key={method.value}
              method={method}
              visual={visual}
              isSelected={isSelected}
              accentColor={accentColor}
              mutedColor={mutedColor}
              onSelect={() => {
                if (isSelected) return;
                hapticSelection();
                onChange(method.value);
              }}
            />
          );
        })}
      </View>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
