import type { ComponentProps } from "react";

import type { HugeiconsIcon } from "@hugeicons/react-native";

export type HugeIconData = ComponentProps<typeof HugeiconsIcon>["icon"];

export type SwipeMenuDestination = {
  href: string;
  icon: HugeIconData;
  id: string;
  isSelected: (pathname: string) => boolean;
  title: string;
};

export type ColorPalette = {
  accent: string;
  accentText: string;
  menuBackground: string;
  menuSelected: string;
  muted: string;
  separator: string;
  surfaceBackground: string;
  surfaceBorder: string;
  text: string;
};
