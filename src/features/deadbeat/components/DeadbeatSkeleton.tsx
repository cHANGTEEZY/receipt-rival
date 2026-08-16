import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonCircle, SkeletonText } from "@/components/skeletons/skeleton";

export function DeadbeatSkeleton() {
  return (
    <View className="gap-6">
      <View className="flex-row gap-3">
        <View className="h-9 flex-1 rounded-full bg-surface" />
        <View className="h-9 flex-1 rounded-full bg-surface" />
      </View>

      <View className="gap-2 px-1">
        <SkeletonText width="w-48" className="h-7" />
        <SkeletonText width="w-64" className="h-4" />
      </View>

      <View className="flex-row items-end gap-2 px-1 pt-16">
        <View className="flex-1 items-center">
          <SkeletonCircle className="z-10 mb-[-10] size-12" />
          <View className="h-[160px] w-full rounded-[28px] bg-surface" />
        </View>
        <View className="flex-1 items-center">
          <SkeletonCircle className="z-10 mb-[-10] size-16" />
          <View className="h-[204px] w-full rounded-[28px] bg-surface" />
        </View>
        <View className="flex-1 items-center">
          <SkeletonCircle className="z-10 mb-[-10] size-12" />
          <View className="h-[132px] w-full rounded-[28px] bg-surface" />
        </View>
      </View>

      <View className="gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(index * 40).duration(240)}
            className="flex-row items-center gap-3 rounded-3xl bg-surface px-3.5 py-3"
            style={{ borderCurve: "continuous" }}
          >
            <SkeletonText width="w-5" className="h-5" />
            <SkeletonCircle className="size-12" />
            <View className="flex-1 gap-2">
              <SkeletonText width="w-32" className="h-4" />
              <SkeletonText width="w-24" className="h-5" />
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
