import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

const LIGHT_COLORS = ["#A8C8F0", "#88B0E8", "#C0D8F8"] as const;
const DARK_COLORS = ["#2A3F5E", "#1E3048", "#243850"] as const;
const LIGHT_BG = "#F7F7F8";
const DARK_BG = "#1E1E20";

export default function AuthMeshBackground() {
  const { height, width } = useWindowDimensions();
  const scheme = useAppColorScheme();
  const background = scheme === "dark" ? DARK_BG : LIGHT_BG;
  const meshHeight = height * 0.6;
  const colors = scheme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: background,
      }}
    >
      <View style={{ height: meshHeight, width, overflow: "hidden" }}>
        <Svg width={width} height={meshHeight} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="authBlue" cx="12%" cy="0%" rx="55%" ry="70%">
              <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.95" />
              <Stop offset="55%" stopColor={colors[0]} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient
              id="authIndigo"
              cx="50%"
              cy="8%"
              rx="50%"
              ry="75%"
            >
              <Stop offset="0%" stopColor={colors[1]} stopOpacity="0.9" />
              <Stop offset="50%" stopColor={colors[1]} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="authSky" cx="90%" cy="0%" rx="55%" ry="70%">
              <Stop offset="0%" stopColor={colors[2]} stopOpacity="0.95" />
              <Stop offset="55%" stopColor={colors[2]} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={colors[2]} stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="authFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={background} stopOpacity="0" />
              <Stop offset="55%" stopColor={background} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={background} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill={background}
          />
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill="url(#authBlue)"
          />
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill="url(#authIndigo)"
          />
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill="url(#authSky)"
          />
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill="url(#authFade)"
          />
        </Svg>
      </View>
    </View>
  );
}
