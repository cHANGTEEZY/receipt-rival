import { useRouter } from "expo-router";
import { type ReactNode, useCallback, useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

import { authClient } from "@/lib/auth-client";
import ScreenCornerSurface from "../../../modules/screen-corner-surface";
import { SwipeMenu } from "./components/swipe-menu";
import {
  ANDROID_SCREEN_CORNER_RADIUS,
  IOS_LEGACY_SCREEN_CORNER_RADIUS,
  SWIPE_MENU_SURFACE_SHADOW,
  SWIPE_MENU_WIDTH_RATIO,
  WEB_SCREEN_CORNER_RADIUS,
} from "./constants";
import { SwipeMenuContext } from "./context";
import { useSwipeMenu } from "./hooks/use-swipe-menu";
import { useSwipeMenuColors } from "./hooks/use-swipe-menu-colors";

type SwipeMenuShellProps = {
  children: ReactNode;
};

export function SwipeMenuShell({ children }: SwipeMenuShellProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const colors = useSwipeMenuColors();
  const menuWidth = screenWidth * SWIPE_MENU_WIDTH_RATIO;
  const {
    animateMenu,
    isMenuOpen,
    mainAnimatedStyle,
    menuContentAnimatedStyle,
    menuDockAnimatedStyle,
    swipeGesture,
  } = useSwipeMenu(menuWidth);
  const fallbackCornerRadius = Platform.select({
    android: ANDROID_SCREEN_CORNER_RADIUS,
    default: WEB_SCREEN_CORNER_RADIUS,
    ios: IOS_LEGACY_SCREEN_CORNER_RADIUS,
  });

  const openMenu = useCallback(() => {
    animateMenu(true);
  }, [animateMenu]);

  const closeMenu = useCallback(() => {
    animateMenu(false);
  }, [animateMenu]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          authClient.signOut();
        },
      },
    ]);
  };

  const openProfile = useCallback(() => {
    animateMenu(false);
    router.push("/(screens)/settings");
  }, [animateMenu, router]);

  const contextValue = useMemo(
    () => ({
      closeMenu,
      isMenuOpen,
      openMenu,
    }),
    [closeMenu, isMenuOpen, openMenu],
  );

  return (
    <SwipeMenuContext.Provider value={contextValue}>
      <GestureDetector gesture={swipeGesture}>
        <View style={[styles.root, { backgroundColor: colors.menuBackground }]}>
          <View
            accessibilityElementsHidden={!isMenuOpen}
            importantForAccessibility={
              isMenuOpen ? "auto" : "no-hide-descendants"
            }
            pointerEvents={isMenuOpen ? "auto" : "none"}
            style={StyleSheet.absoluteFill}
          >
            <SwipeMenu
              colors={colors}
              contentAnimatedStyle={menuContentAnimatedStyle}
              dockAnimatedStyle={menuDockAnimatedStyle}
              menuWidth={menuWidth}
              onClose={closeMenu}
              onLogout={handleLogout}
              onProfilePress={openProfile}
              safeAreaBottom={insets.bottom}
              safeAreaTop={insets.top}
            />
          </View>

          <Animated.View style={[StyleSheet.absoluteFill, mainAnimatedStyle]}>
            <ScreenCornerSurface
              castsShadow
              fallbackRadius={fallbackCornerRadius}
              fallbackShadow={SWIPE_MENU_SURFACE_SHADOW}
              style={[
                styles.mainShadow,
                { backgroundColor: colors.surfaceBackground },
              ]}
            >
              <ScreenCornerSurface
                fallbackRadius={fallbackCornerRadius}
                style={[
                  styles.surface,
                  {
                    backgroundColor: colors.surfaceBackground,
                    borderColor: colors.surfaceBorder,
                    borderWidth: colorScheme === "dark" ? 1 : 0,
                  },
                ]}
              >
                {children}

                <View
                  pointerEvents={isMenuOpen ? "auto" : "none"}
                  style={StyleSheet.absoluteFill}
                >
                  <Pressable
                    accessibilityLabel="Close swipe menu"
                    accessibilityRole="button"
                    onPress={closeMenu}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              </ScreenCornerSurface>
            </ScreenCornerSurface>
          </Animated.View>
        </View>
      </GestureDetector>
    </SwipeMenuContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  mainShadow: {
    flex: 1,
    zIndex: 2,
  },
  surface: {
    flex: 1,
    overflow: "hidden",
  },
});
