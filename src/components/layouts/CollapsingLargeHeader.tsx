import { BlurTargetView, BlurView } from "expo-blur";
import { useRef, useState, type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollViewMarker } from "react-native-screens/experimental";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

import { Typography } from "heroui-native/text";

const COLLAPSE_DISTANCE = 56;
const COMPACT_BAR_CONTENT_HEIGHT = 44;
/** Large title is fully hidden once compact title begins appearing. */
const COMPACT_TITLE_THRESHOLD = COLLAPSE_DISTANCE * 0.35;

/** Android SDK 55+: real blur requires BlurTargetView + dimezis method. */
const ANDROID_BLUR_METHOD = "dimezisBlurView" as const;

type CollapsingLargeHeaderProps = {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
};

export default function CollapsingLargeHeader({
  title,
  trailing,
  children,
  contentContainerStyle,
}: CollapsingLargeHeaderProps) {
  const insets = useSafeAreaInsets();
  const scheme = useAppColorScheme();
  const scrollY = useSharedValue(0);
  const blurTargetRef = useRef<View | null>(null);
  const [compactTitleVisible, setCompactTitleVisible] = useState(false);

  const compactBarHeight = insets.top + COMPACT_BAR_CONTENT_HEIGHT;
  const isDark = scheme === "dark";

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.value = y;
    const nextVisible = y >= COMPACT_TITLE_THRESHOLD;
    setCompactTitleVisible((prev) =>
      prev === nextVisible ? prev : nextVisible,
    );
  };

  const largeTitleStyle = useAnimatedStyle(() => {
    const hidden = scrollY.value >= COMPACT_TITLE_THRESHOLD;
    return {
      opacity: hidden
        ? 0
        : interpolate(
            scrollY.value,
            [0, COMPACT_TITLE_THRESHOLD],
            [1, 0],
            Extrapolation.CLAMP,
          ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, COMPACT_TITLE_THRESHOLD],
            [0, -8],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const compactChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COMPACT_TITLE_THRESHOLD, COLLAPSE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const scrollView = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingTop: insets.top + 8,
          paddingBottom: 72,
        },
        contentContainerStyle,
      ]}
      // NativeTabs otherwise auto-adjusts the first ScrollView (rest y ≈ -insets.top),
      // which doubles our manual safe-area padding and breaks minimize restore on scroll-up.
      contentInsetAdjustmentBehavior="never"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Animated.View style={[styles.expandedRow, largeTitleStyle]}>
        <View style={styles.largeTitleWrap}>
          <Typography
            type="h1"
            weight="semibold"
            className="text-foreground"
            accessibilityRole="header"
          >
            {title}
          </Typography>
        </View>
        {trailing ? <View style={styles.trailingSlot}>{trailing}</View> : null}
      </Animated.View>

      {children}
    </ScrollView>
  );

  // ScrollViewMarker registers this scroll view with NativeTabs even when a
  // fixed MeshBackground is the screen's first sibling (paint-behind).
  const markedScroll =
    Platform.OS === "ios" ? (
      <ScrollViewMarker style={styles.scroll}>{scrollView}</ScrollViewMarker>
    ) : (
      scrollView
    );

  return (
    <View collapsable={false} style={styles.root}>
      {Platform.OS === "android" ? (
        <BlurTargetView
          collapsable={false}
          ref={blurTargetRef}
          style={styles.scroll}
        >
          {markedScroll}
        </BlurTargetView>
      ) : (
        markedScroll
      )}

      <View
        pointerEvents="box-none"
        style={[styles.sticky, { height: compactBarHeight }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, compactChromeStyle]}
        >
          <BlurView
            intensity={isDark ? 18 : 24}
            tint={
              Platform.OS === "ios"
                ? isDark
                  ? "systemUltraThinMaterialDark"
                  : "systemUltraThinMaterialLight"
                : isDark
                  ? "dark"
                  : "light"
            }
            style={StyleSheet.absoluteFill}
            {...(Platform.OS === "android"
              ? {
                  blurTarget: blurTargetRef,
                  blurMethod: ANDROID_BLUR_METHOD,
                  blurReductionFactor: 8,
                }
              : null)}
          />
        </Animated.View>

        <View style={{ paddingTop: insets.top }} pointerEvents="none">
          <View style={styles.compactRow}>
            <EaseView
              style={styles.compactTitleWrap}
              animate={{
                opacity: compactTitleVisible ? 1 : 0,
                translateY: compactTitleVisible ? 0 : 8,
              }}
              transition={{
                type: "timing",
                duration: 200,
                easing: "easeOut",
              }}
            >
              <Typography
                type="h4"
                weight="semibold"
                className="text-center text-foreground"
                truncate
                accessibilityRole="header"
                style={styles.compactTitleText}
              >
                {title}
              </Typography>
            </EaseView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  sticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: "hidden",
  },
  compactRow: {
    height: COMPACT_BAR_CONTENT_HEIGHT,
    justifyContent: "center",
  },
  compactTitleWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 56,
  },
  compactTitleText: {
    width: "100%",
    textAlign: "center",
  },
  trailingSlot: {
    marginLeft: 8,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  expandedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
    minHeight: COMPACT_BAR_CONTENT_HEIGHT,
  },
  largeTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
});
