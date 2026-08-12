import {
  ArrowRight02Icon,
  ChevronRightIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  cancelAnimation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import { AppHaptics } from "@/lib/haptics";

import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

type SlideState = "idle" | "loading" | "completed";

export type SlideToCompleteHandle = {
  /** Animates the thumb back to the start and returns control to `"idle"`. */
  reset: () => void;
};

export type SlideToCompleteProps = {
  /**
   * Called once the thumb is dragged past `threshold` and released.
   * Resolve to land on the completed state; throw or reject to snap the
   * thumb back to the start with an error haptic.
   */
  onSlideComplete: () => void | Promise<void>;
  /** Idle hint text. @default "Slide to confirm" */
  label?: string;
  /** Shown while `onSlideComplete` is pending. @default "Confirming…" */
  loadingLabel?: string;
  /** Shown once `onSlideComplete` resolves. @default "Confirmed" */
  completedLabel?: string;
  /** Icon shown in the thumb before dragging. @default ArrowRight02Icon */
  icon?: IconData;
  /** Icon shown in the thumb once completed. @default Tick02Icon */
  completedIcon?: IconData;
  disabled?: boolean;
  /** Fraction (0–1) of the travel distance required to trigger completion. @default 0.75 */
  threshold?: number;
  /** Track height; the thumb is a circle of the same size. @default 56 */
  height?: number;
  /** Track background color. Defaults to the theme's secondary surface. */
  trackColor?: string;
  /** Thumb/fill color while idle or dragging. Defaults to the theme accent. */
  progressColor?: string;
  /** Thumb/fill color once completed. Defaults to the theme success color. */
  completedColor?: string;
  /** Icon/spinner color inside the thumb. @default "#FFFFFF" */
  thumbForegroundColor?: string;
  /** @default true */
  hapticsEnabled?: boolean;
  /**
   * Milliseconds to wait after completion before auto-resetting to idle.
   * Pass `null` to stay completed until `reset()` is called manually.
   * @default 1600
   */
  resetDelayMs?: number | null;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const SNAP_SPRING = { damping: 22, stiffness: 260, mass: 0.9 };
const RELEASE_SPRING = { damping: 16, stiffness: 180, mass: 1 };
const TRACK_INSET = 4;
const HINT_DISTANCE = 6;
const TICK_STEPS = 4;

function clampWorklet(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

/**
 * An Apple-style "slide to confirm" control: drag the thumb to the end of
 * the track to trigger `onSlideComplete`. Handles its own loading/completed
 * states (so `onSlideComplete` can be async), snap-back on rejection, and
 * haptic "detents" while dragging — similar to iOS's slide-to-unlock feel.
 *
 * @example
 * ```tsx
 * <SlideToComplete
 *   label="Slide to pay"
 *   onSlideComplete={async () => {
 *     await chargeCard();
 *   }}
 * />
 * ```
 */
export const SlideToComplete = forwardRef<
  SlideToCompleteHandle,
  SlideToCompleteProps
>(function SlideToComplete(
  {
    onSlideComplete,
    label = "Slide to confirm",
    loadingLabel = "Confirming…",
    completedLabel = "Confirmed",
    icon = ArrowRight02Icon,
    completedIcon = Tick02Icon,
    disabled = false,
    threshold = 0.75,
    height = 56,
    trackColor,
    progressColor,
    completedColor,
    thumbForegroundColor = "#FFFFFF",
    hapticsEnabled = true,
    resetDelayMs = 1600,
    className,
    style,
    testID,
  },
  ref,
) {
  const accent = useCSSVariable("--color-accent");
  const success = useCSSVariable("--color-success");
  const surfaceSecondary = useCSSVariable("--color-surface-secondary");
  const muted = useCSSVariable("--color-muted");

  const accentColor =
    progressColor ?? (typeof accent === "string" ? accent : "#3B82F6");
  const successColor =
    completedColor ?? (typeof success === "string" ? success : "#22C55E");
  const trackBg =
    trackColor ??
    (typeof surfaceSecondary === "string" ? surfaceSecondary : "#EDEDF2");
  const mutedColor = typeof muted === "string" ? muted : "#8A8A8F";

  const [state, setState] = useState<SlideState>("idle");
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateX = useSharedValue(0);
  const maxTranslate = useSharedValue(0);
  const startX = useSharedValue(0);
  const lastTick = useSharedValue(0);
  const hintOffset = useSharedValue(0);

  const thumbSize = height - TRACK_INSET * 2;

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const snapToStart = useCallback(() => {
    translateX.value = withSpring(0, SNAP_SPRING);
  }, [translateX]);

  const reset = useCallback(() => {
    clearResetTimeout();
    setState("idle");
    lastTick.value = 0;
    snapToStart();
  }, [clearResetTimeout, lastTick, snapToStart]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const triggerHaptic = useCallback(
    (fn: () => void) => {
      if (hapticsEnabled) fn();
    },
    [hapticsEnabled],
  );

  const handleGrab = useCallback(() => {
    triggerHaptic(AppHaptics.system.impactLight);
  }, [triggerHaptic]);

  const handleTick = useCallback(() => {
    triggerHaptic(AppHaptics.system.selection);
  }, [triggerHaptic]);

  const handleCommitted = useCallback(() => {
    clearResetTimeout();
    setState("loading");
    triggerHaptic(AppHaptics.submit);

    void (async () => {
      try {
        await onSlideComplete();
        setState("completed");
        triggerHaptic(AppHaptics.successCelebration);

        if (resetDelayMs !== null) {
          resetTimeoutRef.current = setTimeout(reset, resetDelayMs);
        }
      } catch (error) {
        triggerHaptic(AppHaptics.errorCritical);
        setState("idle");
        snapToStart();

        if (__DEV__) {
          console.warn("[SlideToComplete] onSlideComplete rejected", error);
        }
      }
    })();
  }, [
    clearResetTimeout,
    onSlideComplete,
    reset,
    resetDelayMs,
    snapToStart,
    triggerHaptic,
  ]);

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const trackWidth = event.nativeEvent.layout.width;
      maxTranslate.value = Math.max(
        trackWidth - thumbSize - TRACK_INSET * 2,
        0,
      );
    },
    [maxTranslate, thumbSize],
  );

  const isInteractive = !disabled && state === "idle";

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isInteractive)
        .onStart(() => {
          "worklet";
          startX.value = translateX.value;
          lastTick.value = 0;
          runOnJS(handleGrab)();
        })
        .onUpdate((event) => {
          "worklet";
          const next = clampWorklet(
            startX.value + event.translationX,
            0,
            maxTranslate.value,
          );
          translateX.value = next;

          if (maxTranslate.value <= 0) return;

          const progress = next / maxTranslate.value;
          const tick = Math.floor(progress * TICK_STEPS);
          if (tick > lastTick.value) {
            lastTick.value = tick;
            runOnJS(handleTick)();
          }
        })
        .onEnd(() => {
          "worklet";
          const progress =
            maxTranslate.value > 0 ? translateX.value / maxTranslate.value : 0;

          if (progress >= threshold) {
            translateX.value = withSpring(maxTranslate.value, RELEASE_SPRING);
            runOnJS(handleCommitted)();
          } else {
            lastTick.value = 0;
            translateX.value = withSpring(0, SNAP_SPRING);
          }
        }),
    [
      handleCommitted,
      handleGrab,
      handleTick,
      isInteractive,
      lastTick,
      maxTranslate,
      startX,
      threshold,
      translateX,
    ],
  );

  // Idle "swipe hint" — a subtle back-and-forth nudge inviting the user to
  // drag, cancelled the moment they actually start.
  useEffect(() => {
    if (state !== "idle" || disabled) {
      cancelAnimation(hintOffset);
      hintOffset.value = withTiming(0, { duration: 150 });
      return;
    }

    hintOffset.value = withRepeat(
      withSequence(
        withTiming(HINT_DISTANCE, { duration: 650 }),
        withTiming(0, { duration: 650 }),
      ),
      -1,
    );

    return () => cancelAnimation(hintOffset);
  }, [disabled, hintOffset, state]);

  useEffect(() => clearResetTimeout, [clearResetTimeout]);

  const thumbStyle = useAnimatedStyle(() => {
    const progress =
      maxTranslate.value > 0 ? translateX.value / maxTranslate.value : 0;
    return {
      transform: [{ translateX: translateX.value }],
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        [accentColor, successColor],
      ),
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const progress =
      maxTranslate.value > 0 ? translateX.value / maxTranslate.value : 0;
    return {
      width: translateX.value + thumbSize,
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        [accentColor, successColor],
      ),
      opacity: interpolate(progress, [0, 1], [0.12, 0.22], Extrapolation.CLAMP),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const progress =
      maxTranslate.value > 0 ? translateX.value / maxTranslate.value : 0;
    return {
      opacity: interpolate(progress, [0, 0.5], [1, 0], Extrapolation.CLAMP),
    };
  });

  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hintOffset.value }],
  }));

  const displayLabel =
    state === "loading"
      ? loadingLabel
      : state === "completed"
        ? completedLabel
        : label;

  return (
    <View
      className={className}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      testID={testID}
    >
      <View
        onLayout={handleTrackLayout}
        className="overflow-hidden rounded-full border border-border"
        style={{
          height,
          backgroundColor: trackBg,
          borderCurve: "continuous",
        }}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute rounded-full"
          style={[
            { left: TRACK_INSET, top: TRACK_INSET, bottom: TRACK_INSET },
            fillStyle,
          ]}
        />

        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          {state === "idle" ? (
            <Animated.View
              key="idle-label"
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(120)}
              style={labelStyle}
            >
              <Animated.View
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Typography type="body-sm" weight="semibold" color="muted">
                  {displayLabel}
                </Typography>
                <Animated.View style={hintStyle}>
                  <HugeiconsIcon
                    icon={ChevronRightIcon}
                    size={16}
                    color={mutedColor}
                    strokeWidth={2}
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          ) : (
            <Animated.View
              key={state}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(120)}
            >
              <Typography type="body-sm" weight="semibold" color="muted">
                {displayLabel}
              </Typography>
            </Animated.View>
          )}
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View
            className="absolute items-center justify-center rounded-full"
            style={[
              {
                top: TRACK_INSET,
                left: TRACK_INSET,
                width: thumbSize,
                height: thumbSize,
                borderCurve: "continuous",
              },
              thumbStyle,
            ]}
          >
            {state === "loading" ? (
              <Animated.View
                key="loading"
                entering={FadeIn.duration(120)}
                exiting={FadeOut.duration(100)}
              >
                <Spinner size="sm" color="white" />
              </Animated.View>
            ) : state === "completed" ? (
              <Animated.View
                key="completed"
                entering={FadeIn.duration(120)}
                exiting={FadeOut.duration(100)}
              >
                <HugeiconsIcon
                  icon={completedIcon}
                  size={22}
                  color={thumbForegroundColor}
                  strokeWidth={2}
                />
              </Animated.View>
            ) : (
              <Animated.View
                key="idle-icon"
                entering={FadeIn.duration(120)}
                exiting={FadeOut.duration(100)}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={20}
                  color={thumbForegroundColor}
                  strokeWidth={2}
                />
              </Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
});
