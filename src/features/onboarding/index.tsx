import { useCallback, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MeshBackground from "@/components/MeshBackground";
import {
  hapticPress,
  hapticSelection,
  hapticSuccessCelebration,
} from "@/lib/haptics";
import { markOnboardingComplete } from "@/lib/onboarding";
import { useCSSVariable } from "uniwind";

import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";

import { SlideArt } from "./components/slide-art";
import { ONBOARDING_SLIDES, type OnboardingSlide } from "./slides";

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const accent = useCSSVariable("--color-accent");
  const accentColor = typeof accent === "string" ? accent : undefined;

  const scrollX = useSharedValue(0);
  const lastIndex = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [page, setPage] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const isLast = page === ONBOARDING_SLIDES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    scrollX.value = x;

    const nextIndex = Math.min(
      Math.max(Math.round(x / Math.max(width, 1)), 0),
      ONBOARDING_SLIDES.length - 1,
    );
    if (nextIndex !== lastIndex.value) {
      lastIndex.value = nextIndex;
      setPage(nextIndex);
      hapticSelection();
    }
  };

  const goToPage = (index: number) => {
    hapticPress();
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const finish = useCallback(
    (celebrate: boolean) => {
      if (finishing) return;
      setFinishing(true);

      if (celebrate) {
        hapticSuccessCelebration();
      } else {
        hapticSelection();
      }

      void markOnboardingComplete().then(() => {
        router.replace("/(app)/home");
      });
    },
    [finishing],
  );

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View className="flex-row items-center justify-end px-5">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onPress={() => finish(false)}
          >
            <Button.Label>Skip</Button.Label>
          </Button>
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {ONBOARDING_SLIDES.map((slide, index) => (
            <Slide
              key={slide.key}
              index={index}
              slide={slide}
              width={width}
              scrollX={scrollX}
            />
          ))}
        </Animated.ScrollView>

        <View className="items-center gap-7 px-6">
          <View className="flex-row items-center gap-2">
            {ONBOARDING_SLIDES.map((slide, index) => (
              <Dot
                key={slide.key}
                index={index}
                scrollX={scrollX}
                width={width}
              />
            ))}
          </View>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
            onPress={() => (isLast ? finish(true) : goToPage(page + 1))}
          >
            <Button.Label>{isLast ? "Get started" : "Continue"}</Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
}

type SlideProps = {
  slide: OnboardingSlide;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
};

function Slide({ slide, index, width, scrollX }: SlideProps) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const artStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          range,
          [width * 0.35, 0, -width * 0.35],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollX.value,
          range,
          [0.85, 1, 0.85],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollX.value,
      range,
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      range,
      [-0.4, 1, -0.4],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollX.value,
          range,
          [18, 0, -18],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View
      style={{ width, height: "100%" }}
      className="items-center justify-center px-10"
    >
      <Animated.View style={artStyle}>
        <SlideArt slide={slide} />
      </Animated.View>

      <Animated.View style={textStyle} className="items-center gap-3 pt-12">
        <Typography type="h2" weight="bold" className="text-center">
          {slide.title}
        </Typography>
        <Typography
          type="body"
          color="muted"
          className="max-w-[300px] text-center"
        >
          {slide.description}
        </Typography>
      </Animated.View>
    </View>
  );
}

type DotProps = {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
};

function Dot({ index, width, scrollX }: DotProps) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, range, [8, 26, 8], Extrapolation.CLAMP),
    opacity: interpolate(
      scrollX.value,
      range,
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    ),
  }));

  return <Animated.View style={dotStyle} className="h-2 rounded-full bg-accent" />;
}
