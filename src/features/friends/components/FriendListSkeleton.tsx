import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonCircle, SkeletonText } from "@/components/skeletons/skeleton";

type FriendListSkeletonProps = {
  count?: number;
};

export function FriendListSkeleton({ count = 5 }: FriendListSkeletonProps) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 40).duration(240)}
          className="flex-row items-center gap-3 rounded-3xl bg-surface px-3 py-3"
          style={{ borderCurve: "continuous" }}
        >
          <SkeletonCircle className="size-12" />
          <View className="flex-1 gap-2">
            <SkeletonText width="w-32" className="h-4" />
            <SkeletonText width="w-44" className="h-3" />
          </View>
          <SkeletonText width="w-20" className="h-8" />
        </Animated.View>
      ))}
    </View>
  );
}
