import { Stack } from "expo-router";

import { useStackContentStyle } from "@/hooks/use-navigation-theme";

export default function ScreensLayout() {
  const contentStyle = useStackContentStyle();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle,
      }}
    />
  );
}
