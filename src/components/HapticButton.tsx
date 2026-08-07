import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";

export type HapticTrigger = "onPressIn" | "onPress" | "onLongPress" | "manual";

export type HapticConfig =
  | { type: "selection" }
  | { type: "impact"; style?: Haptics.ImpactFeedbackStyle }
  | { type: "notification"; style?: Haptics.NotificationFeedbackType }
  | { type: "custom"; action: () => Promise<void> | void }
  | { type: "none" };

export type HapticPressableProps = Omit<PressableProps, "style"> & {
  haptic?: HapticConfig;
  hapticTrigger?: HapticTrigger;
  hapticsEnabled?: boolean;
  triggerWhenDisabled?: boolean;
  onHapticError?: (error: unknown) => void;
  shouldTriggerHaptic?: (event: GestureResponderEvent) => boolean;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

const DEFAULT_HAPTIC: HapticConfig = {
  type: "impact",
  style: Haptics.ImpactFeedbackStyle.Medium,
};

let hapticsUnavailableWarned = false;

function isHapticsUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not available|native module|linked/i.test(message);
}

export async function runHaptic(
  config: HapticConfig = DEFAULT_HAPTIC,
): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    switch (config.type) {
      case "selection": {
        await Haptics.selectionAsync();
        return;
      }
      case "impact": {
        await Haptics.impactAsync(
          config.style ?? Haptics.ImpactFeedbackStyle.Medium,
        );
        return;
      }
      case "notification": {
        await Haptics.notificationAsync(
          config.style ?? Haptics.NotificationFeedbackType.Success,
        );
        return;
      }
      case "custom": {
        await config.action();
        return;
      }
      case "none":
      default: {
        return;
      }
    }
  } catch (error) {
    if (isHapticsUnavailableError(error)) {
      if (__DEV__ && !hapticsUnavailableWarned) {
        hapticsUnavailableWarned = true;
        console.warn(
          "[haptics] Native module missing. Rebuild the app: npx expo run:ios",
        );
      }
      return;
    }
    throw error;
  }
}

export default function HapticPressable({
  haptic = DEFAULT_HAPTIC,
  hapticTrigger = "onPressIn",
  hapticsEnabled = true,
  triggerWhenDisabled = false,
  onHapticError,
  shouldTriggerHaptic,
  disabled,
  onPress,
  onPressIn,
  onLongPress,
  style,
  ...rest
}: HapticPressableProps) {
  const fireHaptic = useCallback(
    (event: GestureResponderEvent) => {
      if (!hapticsEnabled) return;
      if (disabled && !triggerWhenDisabled) return;
      if (shouldTriggerHaptic && !shouldTriggerHaptic(event)) return;

      void runHaptic(haptic).catch((error) => {
        onHapticError?.(error);
        if (__DEV__) {
          console.warn("[haptics]", error);
        }
      });
    },
    [
      disabled,
      haptic,
      hapticsEnabled,
      onHapticError,
      shouldTriggerHaptic,
      triggerWhenDisabled,
    ],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticTrigger === "onPressIn") {
        fireHaptic(event);
      }
      onPressIn?.(event);
    },
    [fireHaptic, hapticTrigger, onPressIn],
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticTrigger === "onPress") {
        fireHaptic(event);
      }
      onPress?.(event);
    },
    [fireHaptic, hapticTrigger, onPress],
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (hapticTrigger === "onLongPress") {
        fireHaptic(event);
      }
      onLongPress?.(event);
    },
    [fireHaptic, hapticTrigger, onLongPress],
  );

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onLongPress={handleLongPress}
      style={style}
    />
  );
}
