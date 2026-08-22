import type { ComponentProps } from "react";
import {
  Camera01Icon,
  PodiumIcon,
  SplitIcon,
} from "@hugeicons/core-free-icons";
import type { HugeiconsIcon } from "@hugeicons/react-native";

export type OnboardingSlide = {
  key: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  title: string;
  description: string;
  /** Floating proof chips layered over the art tile. */
  chips: { label: string; tone: "accent" | "success" | "warning" }[];
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: "snap",
    icon: Camera01Icon,
    title: "Snap the receipt",
    description:
      "Photograph any bill and ReceiptRival pulls out items, tax, and tip. No calculator arguments at the table.",
    chips: [{ label: "$86.40 scanned", tone: "accent" }],
  },
  {
    key: "split",
    icon: SplitIcon,
    title: "Split it fair",
    description:
      "Even shares, exact items, or custom amounts. Everyone sees who owes what the moment you split.",
    chips: [
      { label: "You owe $12.30", tone: "warning" },
      { label: "Owes you $8.75", tone: "success" },
    ],
  },
  {
    key: "ranks",
    icon: PodiumIcon,
    title: "Settle the score",
    description:
      "Pay friends back on time to climb the Hall of Fame. Stall, and the Wall of Shame is waiting.",
    chips: [{ label: "#1 Hall of Fame", tone: "success" }],
  },
];
