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
import { preloadAppHaptics } from "@/lib/haptics";
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
    preloadAppHaptics();
  }, []);

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
          {/*
            AppProviders (QueryClientProvider) must wrap HeroUINativeProvider,
            not the other way around: HeroUINativeProvider renders its
            <PortalHost /> as a sibling *after* `children`, so anything
            portaled through it (e.g. BottomSheet.Portal content) is only a
            descendant of providers that wrap HeroUINativeProvider itself.
          */}
          <AppProviders>
            <HeroUINativeProvider>
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
            </HeroUINativeProvider>
          </AppProviders>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
