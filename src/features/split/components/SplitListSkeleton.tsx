import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonText } from "@/components/skeletons/skeleton";

type SplitListSkeletonProps = {
  count?: number;
};

export function SplitListSkeleton({ count = 4 }: SplitListSkeletonProps) {
  return (
    <View className="gap-2">
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 40).duration(240)}
          className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <View className="size-12 rounded-full bg-default/40" />
          <View className="min-w-0 flex-1 gap-2">
            <SkeletonText width="w-36" className="h-4" />
            <SkeletonText width="w-24" className="h-3" />
          </View>
          <View className="items-end gap-2">
            <SkeletonText width="w-16" className="h-4" />
            <SkeletonText width="w-12" className="h-3" />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
