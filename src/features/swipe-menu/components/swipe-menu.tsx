import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { GlassContainer, GlassView } from "expo-glass-effect";
import { type Href, usePathname, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

import ProfileButton from "@/components/ProfileButton";

import { SUPPORTS_LIQUID_GLASS } from "@/utils/platform";
import {
  ACCOUNT_DESTINATIONS,
  MENU_TITLE,
  NAV_DESTINATIONS,
  SWIPE_MENU_LAYOUT,
} from "../constants";
import type { ColorPalette, SwipeMenuDestination } from "../types";

type SwipeMenuProps = {
  colors: ColorPalette;
  contentAnimatedStyle: AnimatedStyle<ViewStyle>;
  dockAnimatedStyle: AnimatedStyle<ViewStyle>;
  menuWidth: number;
  onClose: () => void;
  onLogout: () => void;
  onProfilePress: () => void;
  safeAreaBottom: number;
  safeAreaTop: number;
};

export function SwipeMenu({
  colors,
  contentAnimatedStyle,
  dockAnimatedStyle,
  menuWidth,
  onClose,
  onLogout,
  onProfilePress,
  safeAreaBottom,
  safeAreaTop,
}: SwipeMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dockBottom = Math.max(
    safeAreaBottom,
    SWIPE_MENU_LAYOUT.minimumSafeAreaPadding,
  );

  const selectDestination = (destination: SwipeMenuDestination) => {
    onClose();
    router.navigate(destination.href as Href);
  };

  return (
    <View
      style={[
        styles.menu,
        {
          backgroundColor: colors.menuBackground,
          paddingTop: Math.max(
            safeAreaTop,
            SWIPE_MENU_LAYOUT.minimumSafeAreaPadding,
          ),
          width: menuWidth,
        },
      ]}
    >
      <Animated.View style={[styles.menuBody, contentAnimatedStyle]}>
        <Text selectable style={[styles.title, { color: colors.text }]}>
          {MENU_TITLE}
        </Text>

        <ScrollView
          contentContainerStyle={styles.menuContent}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          style={styles.menuScroll}
        >
          <SectionTitle colors={colors}>Navigate</SectionTitle>
          {NAV_DESTINATIONS.map((destination) => (
            <DestinationRow
              colors={colors}
              destination={destination}
              key={destination.id}
              onPress={() => selectDestination(destination)}
              selected={destination.isSelected(pathname)}
            />
          ))}

          <SectionTitle colors={colors}>Account</SectionTitle>
          {ACCOUNT_DESTINATIONS.map((destination) => (
            <DestinationRow
              colors={colors}
              destination={destination}
              key={destination.id}
              onPress={() => selectDestination(destination)}
              selected={destination.isSelected(pathname)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.actionDock,
          {
            bottom: dockBottom,
            left: SWIPE_MENU_LAYOUT.horizontalPadding,
            right: SWIPE_MENU_LAYOUT.horizontalPadding,
          },
          dockAnimatedStyle,
        ]}
      >
        {SUPPORTS_LIQUID_GLASS ? (
          <GlassContainer
            spacing={SWIPE_MENU_LAYOUT.actionDockSpacing}
            style={styles.actionRow}
          >
            <GlassView
              colorScheme="auto"
              glassEffectStyle="regular"
              isInteractive
              style={styles.homeSurface}
              tintColor={"#a32736"}
            >
              <LogoutButton onPress={onLogout} colors={colors} />
            </GlassView>
            <GlassView
              colorScheme="auto"
              glassEffectStyle="regular"
              isInteractive
              style={styles.profileSurface}
            >
              <DockProfileButton onPress={onProfilePress} />
            </GlassView>
          </GlassContainer>
        ) : (
          <View style={styles.actionRow}>
            <View
              style={[styles.homeSurface, { backgroundColor: colors.accent }]}
            >
              <LogoutButton onPress={onLogout} colors={colors} />
            </View>
            <View
              style={[
                styles.profileSurface,
                styles.profileFallback,
                {
                  backgroundColor: colors.surfaceBackground,
                  borderColor: colors.separator,
                },
              ]}
            >
              <DockProfileButton onPress={onProfilePress} />
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function SectionTitle({
  children,
  colors,
}: {
  children: string;
  colors: ColorPalette;
}) {
  return (
    <Text selectable style={[styles.sectionTitle, { color: colors.text }]}>
      {children}
    </Text>
  );
}

function DestinationRow({
  colors,
  destination,
  onPress,
  selected,
}: {
  colors: ColorPalette;
  destination: SwipeMenuDestination;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.destinationRow,
        selected && { backgroundColor: colors.menuSelected },
        pressed && styles.pressed,
      ]}
    >
      <HugeiconsIcon
        icon={destination.icon}
        size={22}
        color={colors.text}
        strokeWidth={1.75}
      />
      <Text
        numberOfLines={1}
        style={[styles.destinationTitle, { color: colors.text }]}
      >
        {destination.title}
      </Text>
    </Pressable>
  );
}

function LogoutButton({
  colors,
  onPress,
}: {
  colors: ColorPalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.homeButton}
      className="bg-danger"
    >
      <HugeiconsIcon
        icon={Logout01Icon}
        size={20}
        color={colors.accentText}
        strokeWidth={1.75}
      />
      <Text style={[styles.homeLabel, { color: colors.accentText }]}>
        Logout
      </Text>
    </Pressable>
  );
}

function DockProfileButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.profileButton}>
      <ProfileButton size="md" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    paddingHorizontal: SWIPE_MENU_LAYOUT.horizontalPadding,
  },
  menuBody: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -1,
    paddingBottom: 14,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: SWIPE_MENU_LAYOUT.scrollBottomPadding,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
    paddingBottom: 7,
    paddingHorizontal: 8,
    paddingTop: 18,
  },
  destinationRow: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    flexDirection: "row",
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 10,
  },
  destinationTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  actionDock: {
    position: "absolute",
  },
  actionRow: {
    flexDirection: "row",
    gap: SWIPE_MENU_LAYOUT.actionDockSpacing,
    height: SWIPE_MENU_LAYOUT.actionDockHeight,
    width: "100%",
  },
  homeSurface: {
    borderCurve: "continuous",
    borderRadius: 999,
    flex: 1,
    overflow: "hidden",
  },
  homeButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  homeLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileSurface: {
    borderCurve: "continuous",
    borderRadius: 999,
    height: SWIPE_MENU_LAYOUT.actionDockHeight,
    overflow: "hidden",
    width: SWIPE_MENU_LAYOUT.actionDockHeight,
  },
  profileFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  profileButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.55,
  },
});
