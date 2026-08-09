import { Platform } from "react-native";

import type { SpringTransition, TimingTransition } from "react-native-ease";

/** Diameter of the main trigger button. */
export const FAB_MAIN_SIZE = 56;

/** Diameter of each expanded menu item's icon circle. */
export const FAB_ITEM_SIZE = 48;

/** Distance from the screen edge (in addition to safe-area insets). */
export const FAB_EDGE_MARGIN = 10;

/** Gap between stacked items (and between the main button and the first item). */
export const FAB_ITEM_GAP = 10;

/**
 * Extra clearance below the safe-area top inset for `top-*` positions.
 * Use the `offset` prop to nudge further if a screen has a fixed header.
 */
export const FAB_HEADER_INSET = 1;

/**
 * Estimated native bottom tab bar height a `bottom-*` FAB must clear, on top
 * of the safe-area bottom inset. `NativeTabs` is a native controller (and can
 * minimize on scroll), so its real height isn't measurable from JS — use the
 * `offset` prop to fine-tune per screen.
 */
export const FAB_TAB_BAR_INSET = Platform.select({
  ios: 8,
  android: 60,
  default: 44,
});

/** Delay increment (ms) between successive item animations, for the cascade effect. */
export const FAB_STAGGER_MS = 28;

/** Fast spring used for the expand/collapse and icon-rotate animations. */
export const FAB_OPEN_TRANSITION: SpringTransition = {
  type: "spring",
  damping: 16,
  stiffness: 260,
};

/** Quick fade for the backdrop scrim. */
export const FAB_BACKDROP_TRANSITION: TimingTransition = {
  type: "timing",
  duration: 150,
  easing: "easeOut",
};
