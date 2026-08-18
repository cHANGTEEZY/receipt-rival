import {
  forwardRef,
  type ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SwipeActionSurfaceContext } from "@/components/swipe-action-content";
import { AppHaptics } from "@/lib/haptics";

/* Reanimated shared values are intentionally mutated through `.value`. */
/* eslint-disable react-hooks/immutability */

export type SwipeSide = "left" | "right";

export type SwipeableRowActionRenderState = {
  index: number;
  progress: SharedValue<number>;
  side: SwipeSide;
};

export type SwipeableRowAction = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  backgroundColor?: string;
  content:
    | ReactNode
    | ((state: SwipeableRowActionRenderState) => ReactNode);
  disabled?: boolean;
  /**
   * Explicitly allows this action to run when the row is fully swiped.
   * If several actions opt in, the first action in the array wins.
   */
  fullSwipe?: boolean;
  haptic?: () => void;
  key: string;
  onPress: () => Promise<void> | void;
  style?: StyleProp<ViewStyle>;
  width?: number;
};

export type SwipeableRowHaptics = {
  actionPress?: (action: SwipeableRowAction, side: SwipeSide) => void;
  fullSwipe?: (action: SwipeableRowAction, side: SwipeSide) => void;
  reveal?: (side: SwipeSide) => void;
};

export type SwipeableRowRef = {
  close: (animated?: boolean) => void;
  openLeft: () => void;
  openRight: () => void;
};

export type SwipeableRowProps = {
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /**
   * Fraction of the measured row width required to trigger a full swipe.
   */
  fullSwipeThreshold?: number;
  haptics?: SwipeableRowHaptics;
  leftActions?: readonly SwipeableRowAction[];
  /**
   * Fraction of the revealed action width required to leave a side open.
   */
  openThreshold?: number;
  overshootFriction?: number;
  rightActions?: readonly SwipeableRowAction[];
  springConfig?: {
    damping?: number;
    mass?: number;
    stiffness?: number;
  };
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_ACTION_WIDTH = 76;
const DEFAULT_FULL_SWIPE_THRESHOLD = 0.72;
const DEFAULT_OPEN_THRESHOLD = 0.42;
const VELOCITY_THRESHOLD = 650;
const VELOCITY_PROJECTION = 0.12;

const DEFAULT_SPRING = {
  damping: 22,
  mass: 0.75,
  stiffness: 240,
} as const;

export const defaultSwipeableRowHaptics: SwipeableRowHaptics = {
  actionPress: () => AppHaptics.press(),
  fullSwipe: () => AppHaptics.system.impactHeavy(),
  reveal: () => AppHaptics.selection(),
};

function clamp(value: number, minimum: number, maximum: number) {
  "worklet";
  return Math.min(maximum, Math.max(minimum, value));
}

function actionWidth(action: SwipeableRowAction) {
  return action.width ?? DEFAULT_ACTION_WIDTH;
}

function totalActionWidth(actions: readonly SwipeableRowAction[]) {
  return actions.reduce((total, action) => total + actionWidth(action), 0);
}

function firstFullSwipeAction(actions: readonly SwipeableRowAction[]) {
  return actions.find((action) => action.fullSwipe && !action.disabled);
}

function fullSwipeCommitDistance(
  width: number,
  revealWidth: number,
  threshold: number,
) {
  "worklet";

  return Math.min(
    width * 0.88,
    Math.max(width * threshold, revealWidth + 64),
  );
}

export const SwipeableRow = forwardRef<SwipeableRowRef, SwipeableRowProps>(
  function SwipeableRow(
    {
      children,
      containerStyle,
      disabled = false,
      fullSwipeThreshold = DEFAULT_FULL_SWIPE_THRESHOLD,
      haptics = defaultSwipeableRowHaptics,
      leftActions = [],
      openThreshold = DEFAULT_OPEN_THRESHOLD,
      overshootFriction = 0.35,
      rightActions = [],
      springConfig,
      style,
    },
    ref,
  ) {
    const translateX = useSharedValue(0);
    const gestureStartX = useSharedValue(0);
    const rowWidth = useSharedValue(0);
    const revealedDuringGesture = useSharedValue(false);
    const fullSwipeArmed = useSharedValue(false);

    const leftWidth = totalActionWidth(leftActions);
    const rightWidth = totalActionWidth(rightActions);
    const leftFullSwipeAction = firstFullSwipeAction(leftActions);
    const rightFullSwipeAction = firstFullSwipeAction(rightActions);
    const spring = useMemo(
      () => ({ ...DEFAULT_SPRING, ...springConfig }),
      [springConfig],
    );

    const close = useCallback(
      (animated = true) => {
        translateX.value = animated ? withSpring(0, spring) : 0;
      },
      [spring, translateX],
    );

    const openLeft = useCallback(() => {
      if (leftWidth > 0) {
        translateX.value = withSpring(leftWidth, spring);
      }
    }, [leftWidth, spring, translateX]);

    const openRight = useCallback(() => {
      if (rightWidth > 0) {
        translateX.value = withSpring(-rightWidth, spring);
      }
    }, [rightWidth, spring, translateX]);

    useImperativeHandle(ref, () => ({ close, openLeft, openRight }), [
      close,
      openLeft,
      openRight,
    ]);

    const fireRevealHaptic = useCallback(
      (side: SwipeSide) => haptics.reveal?.(side),
      [haptics],
    );

    const fireFullSwipeHaptic = useCallback(
      (side: SwipeSide) => {
        const action =
          side === "left" ? leftFullSwipeAction : rightFullSwipeAction;
        if (!action) return;
        (action.haptic ?? (() => haptics.fullSwipe?.(action, side)))();
      },
      [haptics, leftFullSwipeAction, rightFullSwipeAction],
    );

    const completeFullSwipe = useCallback(
      (side: SwipeSide) => {
        const action =
          side === "left" ? leftFullSwipeAction : rightFullSwipeAction;
        if (!action) return;

        void action.onPress();
        translateX.value = withSpring(0, spring);
      },
      [leftFullSwipeAction, rightFullSwipeAction, spring, translateX],
    );

    const pressAction = useCallback(
      (action: SwipeableRowAction, side: SwipeSide) => {
        if (action.disabled) return;

        (action.haptic ?? (() => haptics.actionPress?.(action, side)))();
        close();
        void action.onPress();
      },
      [close, haptics],
    );

    const onLayout = useCallback(
      (event: LayoutChangeEvent) => {
        rowWidth.value = event.nativeEvent.layout.width;
      },
      [rowWidth],
    );

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .enabled(!disabled)
          .activeOffsetX([-6, 6])
          .failOffsetY([-12, 12])
          .onBegin(() => {
            gestureStartX.value = translateX.value;
            revealedDuringGesture.value = false;
            fullSwipeArmed.value = false;
          })
          .onUpdate((event) => {
            const rawPosition = gestureStartX.value + event.translationX;
            const side: SwipeSide = rawPosition >= 0 ? "left" : "right";
            const hasActions =
              side === "left" ? leftWidth > 0 : rightWidth > 0;

            if (!hasActions) {
              translateX.value = rawPosition * overshootFriction;
              return;
            }

            const revealWidth = side === "left" ? leftWidth : rightWidth;
            const direction = side === "left" ? 1 : -1;
            const distance = Math.abs(rawPosition);
            const resistedDistance =
              distance <= revealWidth
                ? distance
                : revealWidth + (distance - revealWidth) * overshootFriction;
            const canFullSwipe =
              side === "left"
                ? Boolean(leftFullSwipeAction)
                : Boolean(rightFullSwipeAction);
            const maximumDistance = canFullSwipe
              ? Math.max(rowWidth.value, revealWidth)
              : revealWidth + 32;

            translateX.value =
              direction *
              clamp(canFullSwipe ? distance : resistedDistance, 0, maximumDistance);

            if (
              !revealedDuringGesture.value &&
              distance >= revealWidth * openThreshold
            ) {
              revealedDuringGesture.value = true;
              runOnJS(fireRevealHaptic)(side);
            }

            const reachedFullSwipe =
              canFullSwipe &&
              distance >=
                fullSwipeCommitDistance(
                  rowWidth.value,
                  revealWidth,
                  fullSwipeThreshold,
                );

            if (reachedFullSwipe && !fullSwipeArmed.value) {
              fullSwipeArmed.value = true;
              runOnJS(fireFullSwipeHaptic)(side);
            } else if (
              fullSwipeArmed.value &&
              distance <
                fullSwipeCommitDistance(
                  rowWidth.value,
                  revealWidth,
                  fullSwipeThreshold,
                ) -
                  20
            ) {
              fullSwipeArmed.value = false;
            }
          })
          .onEnd((event) => {
            const side: SwipeSide =
              translateX.value >= 0 ? "left" : "right";
            const direction = side === "left" ? 1 : -1;
            const revealWidth = side === "left" ? leftWidth : rightWidth;
            const fullSwipeAction =
              side === "left"
                ? leftFullSwipeAction
                : rightFullSwipeAction;

            if (fullSwipeArmed.value && fullSwipeAction) {
              translateX.value = withTiming(
                direction * Math.max(rowWidth.value, revealWidth),
                { duration: 170 },
                (finished) => {
                  if (finished) {
                    runOnJS(completeFullSwipe)(side);
                  }
                },
              );
              return;
            }

            const projectedDistance =
              Math.abs(translateX.value) +
              Math.max(0, direction * event.velocityX) * VELOCITY_PROJECTION;
            const movingTowardActions =
              direction * event.velocityX > VELOCITY_THRESHOLD;
            const shouldOpen =
              revealWidth > 0 &&
              (projectedDistance >= revealWidth * openThreshold ||
                movingTowardActions);

            translateX.value = withSpring(
              shouldOpen ? direction * revealWidth : 0,
              spring,
            );
          }),
      [
        completeFullSwipe,
        disabled,
        fireFullSwipeHaptic,
        fireRevealHaptic,
        fullSwipeArmed,
        fullSwipeThreshold,
        gestureStartX,
        leftFullSwipeAction,
        leftWidth,
        openThreshold,
        overshootFriction,
        revealedDuringGesture,
        rightFullSwipeAction,
        rightWidth,
        rowWidth,
        spring,
        translateX,
      ],
    );

    const rowAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const leftProgress = useDerivedValue(() =>
      leftWidth ? clamp(translateX.value / leftWidth, 0, 1) : 0,
    );
    const rightProgress = useDerivedValue(() =>
      rightWidth ? clamp(-translateX.value / rightWidth, 0, 1) : 0,
    );
    const leftFullSwipeProgress = useDerivedValue(() => {
      if (!leftFullSwipeAction || rowWidth.value <= 0) return 0;

      const distance = Math.max(0, translateX.value);
      const commitDistance = fullSwipeCommitDistance(
        rowWidth.value,
        leftWidth,
        fullSwipeThreshold,
      );
      return interpolate(
        distance,
        [leftWidth, commitDistance],
        [0, 1],
        Extrapolation.CLAMP,
      );
    });
    const rightFullSwipeProgress = useDerivedValue(() => {
      if (!rightFullSwipeAction || rowWidth.value <= 0) return 0;

      const distance = Math.max(0, -translateX.value);
      const commitDistance = fullSwipeCommitDistance(
        rowWidth.value,
        rightWidth,
        fullSwipeThreshold,
      );
      return interpolate(
        distance,
        [rightWidth, commitDistance],
        [0, 1],
        Extrapolation.CLAMP,
      );
    });

    return (
      <View
        onLayout={onLayout}
        style={[styles.container, containerStyle]}
      >
        <ActionTray
          actions={leftActions}
          fullSwipeProgress={leftFullSwipeProgress}
          onPress={pressAction}
          progress={leftProgress}
          rowWidth={rowWidth}
          side="left"
        />
        <ActionTray
          actions={rightActions}
          fullSwipeProgress={rightFullSwipeProgress}
          onPress={pressAction}
          progress={rightProgress}
          rowWidth={rowWidth}
          side="right"
        />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.row, style, rowAnimatedStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

type ActionTrayProps = {
  actions: readonly SwipeableRowAction[];
  fullSwipeProgress: SharedValue<number>;
  onPress: (action: SwipeableRowAction, side: SwipeSide) => void;
  progress: SharedValue<number>;
  rowWidth: SharedValue<number>;
  side: SwipeSide;
};

function ActionTray({
  actions,
  fullSwipeProgress,
  onPress,
  progress,
  rowWidth,
  side,
}: ActionTrayProps) {
  if (actions.length === 0) return null;

  const fullSwipeAction = firstFullSwipeAction(actions);
  const regularActions = fullSwipeAction
    ? actions.filter((action) => action.key !== fullSwipeAction.key)
    : actions;
  const fullActionWidth = fullSwipeAction
    ? actionWidth(fullSwipeAction)
    : 0;

  return (
    <View
      pointerEvents="box-none"
      style={styles.actionTray}
    >
      <View
        pointerEvents="box-none"
        style={[
          styles.regularActionGroup,
          side === "left"
            ? { left: fullActionWidth }
            : { right: fullActionWidth },
        ]}
      >
        {regularActions.map((action) => (
          <ActionButton
            action={action}
            count={actions.length}
            fullSwipeProgress={fullSwipeProgress}
            index={actions.indexOf(action)}
            key={action.key}
            onPress={onPress}
            progress={progress}
            rowWidth={rowWidth}
            side={side}
          />
        ))}
      </View>

      {fullSwipeAction ? (
        <ActionButton
          action={fullSwipeAction}
          count={actions.length}
          fullSwipeProgress={fullSwipeProgress}
          index={actions.indexOf(fullSwipeAction)}
          isFullSwipeAction
          key={fullSwipeAction.key}
          onPress={onPress}
          progress={progress}
          rowWidth={rowWidth}
          side={side}
        />
      ) : null}
    </View>
  );
}

type ActionButtonProps = {
  action: SwipeableRowAction;
  count: number;
  fullSwipeProgress: SharedValue<number>;
  index: number;
  isFullSwipeAction?: boolean;
  onPress: (action: SwipeableRowAction, side: SwipeSide) => void;
  progress: SharedValue<number>;
  rowWidth: SharedValue<number>;
  side: SwipeSide;
};

function ActionButton({
  action,
  count,
  fullSwipeProgress,
  index,
  isFullSwipeAction = false,
  onPress,
  progress,
  rowWidth,
  side,
}: ActionButtonProps) {
  const baseWidth = actionWidth(action);

  const animatedStyle = useAnimatedStyle(() => {
    const delay = (index / Math.max(1, count)) * 0.32;
    const actionProgress = interpolate(
      progress.value,
      [delay, Math.min(1, delay + 0.58)],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const siblingOpacity = isFullSwipeAction
      ? 1
      : interpolate(
          fullSwipeProgress.value,
          [0, 0.68, 1],
          [1, 0.35, 0],
          Extrapolation.CLAMP,
        );
    const width = isFullSwipeAction
      ? interpolate(
          fullSwipeProgress.value,
          [0, 1],
          [baseWidth, rowWidth.value],
          Extrapolation.CLAMP,
        )
      : baseWidth;

    return {
      opacity:
        interpolate(actionProgress, [0, 0.35, 1], [0, 0.6, 1]) *
        siblingOpacity,
      transform: [
        {
          translateX: interpolate(
            actionProgress,
            [0, 1],
            [side === "left" ? -18 : 18, 0],
          ),
        },
        {
          scale: isFullSwipeAction
            ? 1
            : interpolate(
                fullSwipeProgress.value,
                [0, 1],
                [interpolate(actionProgress, [0, 1], [0.78, 1]), 0.86],
                Extrapolation.CLAMP,
              ),
        },
      ],
      width,
    };
  });

  const content =
    typeof action.content === "function"
      ? action.content({ index, progress, side })
      : action.content;

  return (
    <Animated.View
      style={[
        styles.action,
        isFullSwipeAction && styles.fullSwipeAction,
        isFullSwipeAction &&
          (side === "left" ? styles.fullActionLeft : styles.fullActionRight),
        !isFullSwipeAction && { width: baseWidth },
        animatedStyle,
        action.style,
      ]}
    >
      <SwipeActionSurfaceContext.Provider value={action.backgroundColor}>
        <Pressable
          accessibilityHint={action.accessibilityHint}
          accessibilityLabel={action.accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: action.disabled }}
          disabled={action.disabled}
          onPress={() => onPress(action, side)}
          style={({ pressed }) => [
            styles.actionPressable,
            pressed && styles.pressed,
          ]}
        >
          {content}
        </Pressable>
      </SwipeActionSurfaceContext.Provider>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  action: {
    height: "100%",
    overflow: "hidden",
  },
  actionPressable: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  actionTray: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  container: {
    borderCurve: "continuous",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  fullActionLeft: {
    left: 0,
  },
  fullActionRight: {
    right: 0,
  },
  fullSwipeAction: {
    bottom: 0,
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  pressed: {
    opacity: 0.65,
  },
  regularActionGroup: {
    bottom: 0,
    flexDirection: "row",
    position: "absolute",
    top: 0,
  },
  row: {
    zIndex: 1,
  },
});
