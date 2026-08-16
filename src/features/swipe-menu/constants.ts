import {
  AddInvoiceIcon,
  Award01Icon,
  Home01Icon,
  PaintBrush01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import type { SwipeMenuDestination } from "./types";

export const MENU_TITLE = "ReceiptRival";

export const NAV_DESTINATIONS = [
  {
    id: "home",
    title: "Home",
    href: "/(app)/home",
    icon: Home01Icon,
    isSelected: (pathname) => pathname === "/home" || pathname.endsWith("/home"),
  },
  {
    id: "friends",
    title: "Friends",
    href: "/(app)/friends",
    icon: UserGroupIcon,
    isSelected: (pathname) => pathname.split("/").pop() === "friends",
  },
  {
    id: "splits",
    title: "Splits",
    href: "/(app)/splits",
    icon: AddInvoiceIcon,
    isSelected: (pathname) =>
      pathname === "/splits" || pathname.endsWith("/splits"),
  },
  {
    id: "ranks",
    title: "Ranks",
    href: "/(app)/ranks",
    icon: Award01Icon,
    isSelected: (pathname) =>
      pathname === "/ranks" || pathname.endsWith("/ranks"),
  },
] satisfies readonly SwipeMenuDestination[];

export const ACCOUNT_DESTINATIONS = [
  {
    id: "settings",
    title: "Settings",
    href: "/(screens)/settings",
    icon: Settings01Icon,
    isSelected: (pathname) =>
      (pathname === "/settings" || pathname.endsWith("/settings")) &&
      !pathname.includes("appearance"),
  },
  {
    id: "appearance",
    title: "Appearance",
    href: "/(screens)/settings/appearance",
    icon: PaintBrush01Icon,
    isSelected: (pathname) => pathname.includes("appearance"),
  },
] satisfies readonly SwipeMenuDestination[];

export const SWIPE_MENU_WIDTH_RATIO = 0.78;
export const IOS_LEGACY_SCREEN_CORNER_RADIUS = 55;
export const ANDROID_SCREEN_CORNER_RADIUS = 32;
export const WEB_SCREEN_CORNER_RADIUS = 28;
export const SWIPE_MENU_SURFACE_SHADOW = "-8px 0 40px rgba(0, 0, 0, 0.14)";

export const SWIPE_MENU_LAYOUT = {
  actionDockHeight: 58,
  actionDockSpacing: 12,
  horizontalPadding: 18,
  minimumSafeAreaPadding: 16,
  scrollBottomPadding: 112,
} as const;

export const SWIPE_GESTURE = {
  activationDistance: 8,
  directionDistanceThreshold: 12,
  openPositionThreshold: 0.18,
  velocityInfluence: 0.05,
  velocityThreshold: 160,
  verticalTolerance: 18,
} as const;

export const SWIPE_SPRING = {
  damping: 26,
  mass: 0.8,
  overshootClamping: true,
  stiffness: 220,
} as const;

export const SWIPE_MENU_REVEAL = {
  fadeEndProgress: 0.5,
  fadeStartProgress: 0.08,
  startScale: 0.975,
  startVerticalOffset: 8,
} as const;

export const COLOR_FALLBACKS = {
  light: {
    accent: "#3B82F6",
    accentText: "#FFFFFF",
    menuBackground: "#F7F7F7",
    menuSelected: "#E8E8EC",
    muted: "#6E6E76",
    separator: "rgba(0, 0, 0, 0.1)",
    surfaceBackground: "#FFFFFF",
    surfaceBorder: "transparent",
    text: "#1A1A1F",
  },
  dark: {
    accent: "#3B82F6",
    accentText: "#FFFFFF",
    menuBackground: "#121214",
    menuSelected: "#2A2A30",
    muted: "#A3A3AB",
    separator: "rgba(255, 255, 255, 0.12)",
    surfaceBackground: "#1A1A1F",
    surfaceBorder: "rgba(255, 255, 255, 0.1)",
    text: "#FFFFFF",
  },
} as const;
