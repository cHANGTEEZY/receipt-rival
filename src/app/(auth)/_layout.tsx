import { Stack } from "expo-router";

import { useStackContentStyle } from "@/hooks/use-navigation-theme";

export default function AuthLayout() {
  const contentStyle = useStackContentStyle();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle,
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
