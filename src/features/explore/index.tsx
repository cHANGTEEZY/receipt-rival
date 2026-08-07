import { useState } from "react";
import { View } from "react-native";

import HapticPressable from "@/components/HapticButton";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import { SkeletonCard } from "@/components/skeletons/skeleton-card";

import { Typography } from "heroui-native/text";

export default function Explore() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader title="Explore">
        <View className="gap-4 px-4">
          <Typography type="body" color="muted">
            Shared components from the boilerplate foundation — skeleton loaders,
            haptic feedback, and collapsing headers.
          </Typography>

          <HapticPressable
            className="rounded-4xl bg-accent px-5 py-4"
            style={{ borderCurve: "continuous" }}
            onPress={() => setShowSkeleton((v) => !v)}
          >
            <Typography
              type="body"
              weight="semibold"
              className="text-accent-foreground text-center"
            >
              {showSkeleton ? "Hide skeleton" : "Show skeleton"}
            </Typography>
          </HapticPressable>

          {showSkeleton ? (
            <View className="gap-3">
              <SkeletonCard index={0} />
              <SkeletonCard index={1} />
            </View>
          ) : (
            <View className="rounded-4xl bg-surface px-4 py-5">
              <Typography type="body" weight="medium">
                Content loaded
              </Typography>
              <Typography type="body-sm" color="muted" className="mt-1">
                Tap the button above to toggle the skeleton state.
              </Typography>
            </View>
          )}
        </View>
      </CollapsingLargeHeader>
    </View>
  );
}
