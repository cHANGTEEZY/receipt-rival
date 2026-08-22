import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import type { OnboardingSlide } from "../slides";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Typography } from "heroui-native/text";

const TILE = 208;
const CHIP_TONES = {
  accent: "bg-accent/15",
  success: "bg-success/15",
  warning: "bg-warning/20",
} as const;
const CHIP_TEXT_TONES = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
} as const;

type FloatingChipProps = {
  label: string;
  tone: keyof typeof CHIP_TONES;
  positionClass: string;
  phaseMs: number;
};

function FloatingChip({
  label,
  tone,
  positionClass,
  phaseMs,
}: FloatingChipProps) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withDelay(
      phaseMs,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 1100 }),
          withTiming(5, { duration: 1300 }),
        ),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(bob);
  }, [bob, phaseMs]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <View pointerEvents="none" className={`absolute ${positionClass}`}>
      <Animated.View
        style={chipStyle}
        className={`rounded-full px-3.5 py-2 ${CHIP_TONES[tone]}`}
      >
        <Typography
          type="body-xs"
          weight="bold"
          className={CHIP_TEXT_TONES[tone]}
        >
          {label}
        </Typography>
      </Animated.View>
    </View>
  );
}

export function SlideArt({ slide }: { slide: OnboardingSlide }) {
  const accent = useCSSVariable("--color-accent");
  const iconColor = typeof accent === "string" ? accent : "#C45D3E";

  return (
    <View
      className="items-center justify-center"
      style={{ width: TILE, height: TILE }}
    >
      <View
        className="absolute inset-0 items-center justify-center rounded-[64px] bg-accent/10"
        style={{ borderCurve: "continuous" }}
      />
      <View
        className="absolute h-40 w-40 items-center justify-center rounded-[48px] bg-accent/14"
        style={{ borderCurve: "continuous" }}
      />
      <View
        className="h-28 w-28 items-center justify-center rounded-full bg-surface"
        style={{
          borderCurve: "continuous",
          shadowColor: "#1a1a2e",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        <HugeiconsIcon
          icon={slide.icon}
          size={56}
          color={iconColor}
          strokeWidth={1.5}
        />
      </View>

      <FloatingChip
        label={slide.chips[0].label}
        tone={slide.chips[0].tone}
        positionClass="-right-6 top-8"
        phaseMs={0}
      />
      {slide.chips.length > 1 ? (
        <FloatingChip
          label={slide.chips[1].label}
          tone={slide.chips[1].tone}
          positionClass="-left-7 bottom-10"
          phaseMs={420}
        />
      ) : null}
    </View>
  );
}
