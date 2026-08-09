import "../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { useAppFonts } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash was already hidden.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const colorScheme = useAppColorScheme();
  const backgroundColor = useCSSVariable("--color-background");
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark";

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore if splash was already hidden.
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  useEffect(() => {
    if (typeof backgroundColor === "string") {
      void SystemUI.setBackgroundColorAsync(backgroundColor);
    }
  }, [backgroundColor]);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor:
          typeof backgroundColor === "string" ? backgroundColor : undefined,
      }}
    >
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <AppProviders>
            <StatusBar style={statusBarStyle} animated />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  flex: 1,
                  backgroundColor:
                    typeof backgroundColor === "string"
                      ? backgroundColor
                      : undefined,
                },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(screens)" />
            </Stack>
          </AppProviders>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
