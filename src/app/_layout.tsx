import "../global.css";

import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import {
  useNavigationTheme,
  useScreenBackgroundColor,
  useStackContentStyle,
} from "@/hooks/use-navigation-theme";
import { useAppFonts } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash was already hidden.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const navigationTheme = useNavigationTheme();
  const stackContentStyle = useStackContentStyle();
  const colorScheme = useAppColorScheme();
  const backgroundColor = useScreenBackgroundColor();
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark";

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore if splash was already hidden.
      });
    }
    if (backgroundColor) {
      void SystemUI.setBackgroundColorAsync(backgroundColor);
    }
  }, [fontsLoaded, fontError, backgroundColor]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor,
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <HeroUINativeProvider>
            <AppProviders>
              <StatusBar style={statusBarStyle} animated />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: stackContentStyle,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="(screens)" />
              </Stack>
            </AppProviders>
          </HeroUINativeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
