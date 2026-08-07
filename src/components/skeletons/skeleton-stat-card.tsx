import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Skeleton, SkeletonCircle, SkeletonText } from "./skeleton";

export type StatCardGraphic = "ring" | "bars";

const BAR_HEIGHTS = [18, 30, 22, 42, 26, 34, 44];

/** Right-side graphic that mirrors the real StatCard's ring or weekly bars. */
function StatCardGraphicSkeleton({ graphic }: { graphic: StatCardGraphic }) {
  if (graphic === "ring") {
    return <SkeletonCircle className="size-14" />;
  }

  return (
    <View
      className="h-12 flex-row items-end"
      style={{ gap: 5 }}
      accessibilityElementsHidden
    >
      {BAR_HEIGHTS.map((height, index) => (
        <Skeleton
          key={index}
          className="w-1.5 rounded-full"
          style={{ height }}
        />
      ))}
    </View>
  );
}

type SkeletonStatCardProps = {
  /** Card index — drives the subtle stagger between cards. */
  index?: number;
  graphic?: StatCardGraphic;
};

/**
 * Loading placeholder for a Today stat card — same surface, radius, padding
 * and value rhythm as StatCard so nothing jumps when data arrives.
 */
export function SkeletonStatCard({
  index = 0,
  graphic = "ring",
}: SkeletonStatCardProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 40).duration(240)}
      className="w-full rounded-4xl bg-surface px-4 py-5"
      style={{ borderCurve: "continuous" }}
      accessibilityElementsHidden
    >
      <View className="gap-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <SkeletonCircle className="size-6" />
            <SkeletonText width="w-16" className="h-4" />
          </View>
          <SkeletonText width="w-10" className="h-3" />
        </View>

        <View className="flex-row items-end justify-between">
          <View className="flex-row items-baseline gap-1.5">
            <SkeletonText width="w-12" className="h-8" />
            <SkeletonText width="w-20" className="h-3" />
          </View>
          <StatCardGraphicSkeleton graphic={graphic} />
        </View>
      </View>
    </Animated.View>
  );
}
