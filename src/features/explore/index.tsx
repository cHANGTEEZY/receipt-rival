import { useRef, useState } from "react";
import { View } from "react-native";

import HapticPressable from "@/components/HapticButton";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import { SkeletonCard } from "@/components/skeletons/skeleton-card";
import {
  SlideToComplete,
  type SlideToCompleteHandle,
} from "@/components/SlideToComplete";
import { SwipeMenuButton } from "@/features/swipe-menu";

import { Typography } from "heroui-native/text";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Explore() {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [shouldFail, setShouldFail] = useState(false);
  const slideRef = useRef<SlideToCompleteHandle>(null);

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader title="Explore" leading={<SwipeMenuButton />}>
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

          <View className="gap-3 rounded-4xl bg-surface p-4">
            <View className="gap-1">
              <Typography type="body" weight="medium">
                Slide to complete
              </Typography>
              <Typography type="body-sm" color="muted">
                Drag the thumb all the way to the right. It resolves an async
                action, then auto-resets.
              </Typography>
            </View>

            <SlideToComplete
              ref={slideRef}
              label="Slide to confirm"
              onSlideComplete={async () => {
                await sleep(1400);
                if (shouldFail) {
                  throw new Error("Simulated failure");
                }
              }}
            />

            <HapticPressable
              className="self-start rounded-full bg-default px-4 py-2"
              style={{ borderCurve: "continuous" }}
              onPress={() => setShouldFail((v) => !v)}
            >
              <Typography type="body-xs" weight="semibold">
                {shouldFail ? "Will fail — tap to fix" : "Will succeed — tap to break"}
              </Typography>
            </HapticPressable>
          </View>
        </View>
      </CollapsingLargeHeader>
    </View>
  );
}
