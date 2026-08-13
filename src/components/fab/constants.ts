import { Platform } from "react-native";

import type { SpringTransition, TimingTransition } from "react-native-ease";

export const FAB_MAIN_SIZE = 56;

export const FAB_ITEM_SIZE = 48;

export const FAB_EDGE_MARGIN = 10;

export const FAB_ITEM_GAP = 10;

export const FAB_HEADER_INSET = 1;

export const FAB_TAB_BAR_INSET = Platform.select({
  ios: 8,
  android: 60,
  default: 44,
});

export const FAB_STAGGER_MS = 28;

export const FAB_OPEN_TRANSITION: SpringTransition = {
  type: "spring",
  damping: 17,
  stiffness: 280,
};

export const FAB_BACKDROP_TRANSITION: TimingTransition = {
  type: "timing",
  duration: 80,
  easing: "linear",
};
