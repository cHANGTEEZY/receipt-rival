import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonText } from "@/components/skeletons/skeleton";

type SplitListSkeletonProps = {
  count?: number;
};

export function SplitListSkeleton({ count = 4 }: SplitListSkeletonProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 40).duration(240)}
          className="gap-2 rounded-3xl bg-surface px-4 py-3.5"
          style={{ borderCurve: "continuous" }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <SkeletonText width="w-40" className="h-4" />
            <SkeletonText width="w-16" className="h-5" />
          </View>
          <SkeletonText width="w-56" className="h-3" />
        </Animated.View>
      ))}
    </View>
  );
}
