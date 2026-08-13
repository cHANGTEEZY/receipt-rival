import { BlurView } from "expo-blur";
import { GlassContainer, GlassView } from "expo-glass-effect";
import { type ReactNode, type RefObject } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { SUPPORTS_LIQUID_GLASS } from "@/utils/platform";

const DEFAULT_SIZE = 40;
const ANDROID_BLUR_METHOD = "dimezisBlurView" as const;

type GlassControlProps = {
  children?: ReactNode;
  blurTargetRef?: RefObject<View | null>;
  size?: number;
  tintColor?: string;
  style?: ViewStyle;
  /** When false, native glass animates to `none` instead of using opacity. @default true */
  active?: boolean;
};

export function GlassControl({
  children,
  blurTargetRef,
  size = DEFAULT_SIZE,
  tintColor,
  style,
  active = true,
}: GlassControlProps) {
  const isDark = useAppColorScheme() === "dark";

  if (!children) return null;

  const shape: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const content = (
    <View style={styles.inner}>
      {tintColor ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tintColor,
          }}
        />
      ) : null}
      {children}
    </View>
  );

  if (SUPPORTS_LIQUID_GLASS) {
    return (
      <GlassView
        isInteractive={active}
        colorScheme={isDark ? "dark" : "light"}
        glassEffectStyle={{
          style: active ? "regular" : "none",
          animate: true,
          animationDuration: 0.28,
        }}
        tintColor={tintColor}
        style={[shape, style]}
      >
        {content}
      </GlassView>
    );
  }

  if (Platform.OS === "android" && blurTargetRef) {
    return (
      <View style={[styles.clip, shape, style]}>
        <BlurView
          intensity={isDark ? 36 : 52}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
          blurTarget={blurTargetRef}
          blurMethod={ANDROID_BLUR_METHOD}
          blurReductionFactor={4}
        />
        {content}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.clip,
        shape,
        {
          backgroundColor:
            tintColor ??
            (isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.72)"),
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  inner: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});

type GlassControlContainerProps = {
  children: ReactNode;
  /** Distance at which neighboring glass views begin to merge. */
  spacing?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlassControlContainer({
  children,
  spacing,
  style,
}: GlassControlContainerProps) {
  if (SUPPORTS_LIQUID_GLASS) {
    return (
      <GlassContainer spacing={spacing} style={style} pointerEvents="box-none">
        {children}
      </GlassContainer>
    );
  }

  return (
    <View style={style} pointerEvents="box-none">
      {children}
    </View>
  );
}
