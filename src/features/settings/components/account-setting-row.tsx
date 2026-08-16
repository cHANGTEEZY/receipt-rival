import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ListGroup, PressableFeedback } from "heroui-native";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

import { Typography } from "heroui-native/text";

type AccountSettingRowProps = {
  label: string;
  value?: string | null;
  onPress?: () => void;
};

export function AccountSettingRow({
  label,
  value,
  onPress,
}: AccountSettingRowProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8A8A8F";
  const displayValue = value?.trim() || "Not provided";

  const content = (
    <ListGroup.Item disabled>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{label}</ListGroup.ItemTitle>
      </ListGroup.ItemContent>
      <ListGroup.ItemSuffix>
        <View className="max-w-45 flex-row items-center gap-2">
          <Typography type="body-sm" color="muted" numberOfLines={1}>
            {displayValue}
          </Typography>
          {onPress ? (
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              size={16}
              color={mutedColor}
              strokeWidth={1.75}
            />
          ) : null}
        </View>
      </ListGroup.ItemSuffix>
    </ListGroup.Item>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableFeedback animation={false} onPress={onPress} className="px-1">
      <PressableFeedback.Scale>{content}</PressableFeedback.Scale>
      <PressableFeedback.Ripple
        animation={{
          backgroundColor: { value: "#dbeafe" },
          opacity: { value: [0.2, 0.2, 0] },
          progress: { baseDuration: 240 },
        }}
      />
    </PressableFeedback>
  );
}
