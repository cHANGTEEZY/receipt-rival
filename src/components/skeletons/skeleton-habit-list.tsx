import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { SkeletonCircle, SkeletonText } from "./skeleton";

export type HabitSectionSkeleton = {
  label: string;
  rows: number;
};

const DEFAULT_SECTIONS: HabitSectionSkeleton[] = [
  { label: "Morning", rows: 2 },
  { label: "Evening", rows: 2 },
];

/**
 * Loading placeholder for a HabitPill row — 44px icon, two text lines and a
 * 26px trailing checkbox, spaced exactly like the real pill.
 */
function SkeletonHabitRow({ index }: { index: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 36).duration(220)}
      className="flex-row items-center gap-3.5 overflow-hidden rounded-4xl bg-surface px-3.5 py-3"
      style={{ borderCurve: "continuous" }}
      accessibilityElementsHidden
    >
      <SkeletonCircle className="size-11 shrink-0" />
      <View className="min-w-0 flex-1 gap-2">
        <SkeletonText width="w-2/3" className="h-4" />
        <SkeletonText width="w-1/3" className="h-3" />
      </View>
      <SkeletonCircle className="size-6.5 shrink-0" />
    </Animated.View>
  );
}

type SkeletonHabitListProps = {
  sections?: HabitSectionSkeleton[];
};

/**
 * Loading placeholder for the grouped habit list — routine headers and pills,
 * matching Today and Habits page rhythm. Rows reveal with a short stagger.
 */
export function SkeletonHabitList({
  sections = DEFAULT_SECTIONS,
}: SkeletonHabitListProps) {
  const sectionsWithOffset = sections.reduce<
    (HabitSectionSkeleton & { startIndex: number })[]
  >((acc, section) => {
    const startIndex =
      acc.length === 0 ? 0 : acc[acc.length - 1].startIndex + acc[acc.length - 1].rows;
    acc.push({ ...section, startIndex });
    return acc;
  }, []);

  return (
    <View className="gap-6" accessibilityElementsHidden>
      {sectionsWithOffset.map((section) => (
        <View key={section.label} className="gap-2.5">
          <SkeletonText width="w-16" className="px-1" />
          <View className="gap-2.5">
            {Array.from({ length: section.rows }, (_, i) => (
              <SkeletonHabitRow
                key={section.startIndex + i}
                index={section.startIndex + i}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
