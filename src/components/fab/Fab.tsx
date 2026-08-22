import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { usePathname } from "expo-router";
import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";
import { ACCENT_HEX } from "@/theme/accent";

import {
  GlassControl,
  GlassControlContainer,
} from "@/components/layouts/GlassControl";
import {
  FAB_BACKDROP_TRANSITION,
  FAB_EDGE_MARGIN,
  FAB_HEADER_INSET,
  FAB_ITEM_GAP,
  FAB_MAIN_SIZE,
  FAB_OPEN_TRANSITION,
  FAB_TAB_BAR_INSET,
} from "./constants";
import { FabContext } from "./FabContext";
import { FabItem, type InternalFabItemProps } from "./FabItem";
import type { FabPosition, IconData } from "./types";

export type FabProps = {
  /** Screen corner to anchor the button to. @default "bottom-right" */
  position?: FabPosition;
  /**
   * Route pathnames or leaf segment names on which the FAB should not
   * render, e.g. `["sign-in", "settings"]`.
   */
  hiddenOnScreens?: string[];
  /** Extra manual spacing on top of the automatic safe-area/header/tab-bar inset. */
  offset?: { x?: number; y?: number };
  /** Add clearance for the collapsed header height. Only affects `top-*` positions. @default true */
  avoidHeader?: boolean;
  /** Add clearance for the native bottom tab bar. Only affects `bottom-*` positions. @default true */
  avoidTabBar?: boolean;
  /** Icon shown on the main button. @default PlusSignIcon */
  icon?: IconData;
  /** "Direct" mode — fires immediately when there are no `children`. */
  onPress?: () => void;
  /** `Fab.Item` elements. Presence switches to "menu" mode. */
  children?: ReactNode;
  /** Main button diameter. @default 56 */
  size?: number;
  disabled?: boolean;
  testID?: string;
};

function isScreenHidden(pathname: string, hiddenOnScreens?: string[]): boolean {
  if (!hiddenOnScreens?.length) return false;

  return hiddenOnScreens.some((name) => {
    const withSlash = name.startsWith("/") ? name : `/${name}`;
    return (
      pathname === name ||
      pathname === withSlash ||
      pathname.endsWith(withSlash)
    );
  });
}

export function Fab({
  position = "bottom-right",
  hiddenOnScreens,
  offset,
  avoidHeader = true,
  avoidTabBar = true,
  icon = PlusSignIcon,
  onPress,
  children,
  size = FAB_MAIN_SIZE,
  disabled = false,
  testID,
}: FabProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const accentForeground = useCSSVariable("--color-accent-foreground");
  const iconColor =
    typeof accentForeground === "string" ? accentForeground : "#ffffff";

  const [open, setOpen] = useState(false);

  // Collapse the menu if the route changes while it's open, so it never
  // reappears expanded on the next screen. Adjusted during render (rather
  // than in an effect) to avoid an extra cascading render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const items = useMemo(
    () => Children.toArray(children).filter(isValidElement),
    [children],
  );
  const isMenuMode = items.length > 0;
  const isBottom = position.startsWith("bottom");
  const isRight = position.endsWith("right");
  const hidden = isScreenHidden(pathname, hiddenOnScreens);

  if (hidden) {
    return null;
  }

  const closeMenu = () => setOpen(false);

  const handleMainPress = () => {
    if (isMenuMode) {
      setOpen((prev) => !prev);
    } else {
      onPress?.();
    }
  };

  const cornerStyle: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } = {};

  if (isBottom) {
    cornerStyle.bottom =
      insets.bottom +
      (avoidTabBar ? (FAB_TAB_BAR_INSET ?? 0) : 0) +
      FAB_EDGE_MARGIN +
      (offset?.y ?? 0);
  } else {
    cornerStyle.top =
      insets.top +
      (avoidHeader ? FAB_HEADER_INSET : 0) +
      FAB_EDGE_MARGIN +
      (offset?.y ?? 0);
  }

  if (isRight) {
    cornerStyle.right = insets.right + FAB_EDGE_MARGIN + (offset?.x ?? 0);
  } else {
    cornerStyle.left = insets.left + FAB_EDGE_MARGIN + (offset?.x ?? 0);
  }

  const clonedItems = items.map((item, index) =>
    cloneElement(item as ReactElement<InternalFabItemProps>, {
      key: (item as ReactElement).key ?? index,
      __index: index,
      __count: items.length,
    }),
  );

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      testID={testID}
    >
      {isMenuMode ? (
        <EaseView
          pointerEvents={open ? "auto" : "none"}
          style={StyleSheet.absoluteFill}
          animate={{ opacity: open ? 1 : 0 }}
          transition={FAB_BACKDROP_TRANSITION}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={closeMenu}
            className="flex-1 bg-backdrop"
          />
        </EaseView>
      ) : null}

      <FabContext.Provider
        value={{ open, position, itemCount: items.length, closeMenu }}
      >
        <GlassControlContainer
          spacing={FAB_ITEM_GAP}
          style={[
            styles.anchor,
            cornerStyle,
            {
              flexDirection: isBottom ? "column-reverse" : "column",
              alignItems: isRight ? "flex-end" : "flex-start",
              gap: FAB_ITEM_GAP,
            },
          ]}
        >
          <GlassControl size={size} tintColor={ACCENT_HEX}>
            <HapticPressable
              accessibilityRole="button"
              accessibilityLabel={testID ?? "Floating action button"}
              disabled={disabled}
              haptic={{ type: isMenuMode ? "selection" : "impact" }}
              onPress={handleMainPress}
              className="items-center justify-center rounded-full"
              style={{
                width: size,
                height: size,
                borderCurve: "continuous",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <EaseView
                animate={{ rotate: isMenuMode && open ? 45 : 0 }}
                transition={FAB_OPEN_TRANSITION}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={24}
                  color={iconColor}
                  strokeWidth={2}
                />
              </EaseView>
            </HapticPressable>
          </GlassControl>

          {clonedItems}
        </GlassControlContainer>
      </FabContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    overflow: "visible",
  },
});

Fab.Item = FabItem;
