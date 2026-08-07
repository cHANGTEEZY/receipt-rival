import { type ReactNode } from "react";
import { View } from "react-native";

import { ListGroup } from "heroui-native/list-group";
import { Typography } from "heroui-native/text";

type SettingsSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <View className="gap-2">
      {title || description ? (
        <View className="gap-0.5 px-3">
          {title ? (
            <Typography
              type="h5"
              weight="medium"
              className="text-muted"
              accessibilityRole="header"
            >
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography type="body-xs" className="text-muted/80">
              {description}
            </Typography>
          ) : null}
        </View>
      ) : null}
      <ListGroup className={"overflow-hidden rounded-4xl " + className}>
        {children}
      </ListGroup>
    </View>
  );
}
