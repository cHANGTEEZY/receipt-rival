import type { ComponentProps } from "react";

import type { HugeiconsIcon } from "@hugeicons/react-native";

export type FabPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];
