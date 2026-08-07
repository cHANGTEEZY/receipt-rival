import { type ComponentProps, type ReactNode } from "react";

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ListGroup, PressableFeedback } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { SettingsIconTile } from "./settings-icon-tile";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

type SettingsRowProps = {
  title: string;
  description?: string;
  icon?: IconData;
  iconBackground?: string;
  iconColor?: string;
  leading?: ReactNode;
  trailing?: ReactNode | null;
  external?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
  title,
  description,
  icon,
  iconBackground,
  iconColor,
  leading,
  trailing,
  external = false,
  onPress,
}: SettingsRowProps) {
  const muted = useCSSVariable("--color-muted");
  const mutedColor = typeof muted === "string" ? muted : "#8A8A8F";

  const prefix =
    leading ??
    (icon && iconBackground ? (
      <SettingsIconTile
        icon={icon}
        backgroundColor={iconBackground}
        iconColor={iconColor}
      />
    ) : null);

  let suffix: ReactNode | undefined;
  if (trailing === null) {
    suffix = null;
  } else if (trailing !== undefined) {
    suffix = trailing;
  } else if (external) {
    suffix = (
      <HugeiconsIcon
        icon={ArrowUpRight01Icon}
        size={18}
        color={mutedColor}
        strokeWidth={1.75}
      />
    );
  }

  return (
    <PressableFeedback animation={false} onPress={onPress} className="px-1">
      <PressableFeedback.Scale>
        <ListGroup.Item disabled>
          {prefix ? (
            <ListGroup.ItemPrefix>{prefix}</ListGroup.ItemPrefix>
          ) : null}
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle className="capitalize">
              {title}
            </ListGroup.ItemTitle>
            {description ? (
              <ListGroup.ItemDescription>
                {description}
              </ListGroup.ItemDescription>
            ) : null}
          </ListGroup.ItemContent>
          {suffix === null ? null : suffix !== undefined ? (
            <ListGroup.ItemSuffix>{suffix}</ListGroup.ItemSuffix>
          ) : (
            <ListGroup.ItemSuffix iconProps={{ size: 18, color: mutedColor }} />
          )}
        </ListGroup.Item>
      </PressableFeedback.Scale>
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
