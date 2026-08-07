import type { ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonText } from "./skeleton";

type SkeletonCardProps = {
  /** Card index — drives the subtle stagger between cards. */
  index?: number;
  headerTrailing?: ReactNode;
  children?: ReactNode;
};

/**
 * Loading placeholder for a ProgressCard — same surface, radius, padding
 * and header rhythm so content never jumps when it swaps in.
 */
export function SkeletonCard({
  index = 0,
  headerTrailing,
  children,
}: SkeletonCardProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 40).duration(240)}
      className="gap-4 rounded-4xl bg-surface px-4 py-5"
      style={{ borderCurve: "continuous" }}
    >
      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <SkeletonText width="w-24" className="h-4" />
          {headerTrailing ?? <SkeletonText width="w-12" className="h-3" />}
        </View>
        <SkeletonText width="w-2/3" className="h-3" />
      </View>
      {children}
    </Animated.View>
  );
}
