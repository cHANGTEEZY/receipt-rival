import { View } from "react-native";

import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";

import { Typography } from "heroui-native/text";

import CycleTheme from "../components/cycle-theme";

export default function Appearance() {
  return (
    <View className="flex-1 bg-background">
      <CollapsedLargeHeader title="Appearance" leading={<GoBackButton />}>
        <View className="mt-5 gap-2 px-4 pb-8">
          <Typography type="h5" weight="semibold" className="text-foreground">
            Color Scheme
          </Typography>
          <Typography type="body-sm" className="text-muted">
            Turn on dark mode, or let the app visually match your device
            settings.
          </Typography>
          <CycleTheme />
        </View>
      </CollapsedLargeHeader>
    </View>
  );
}
