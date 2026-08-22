import { useId } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useCSSVariable } from "uniwind";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

/** Clay mesh palette — warm terracotta on a cool-gray canvas. */
const LIGHT_COLORS = ["#E8C4B0", "#E0B49A", "#F0D4C4"] as const;
const DARK_COLORS = ["#4A3028", "#3D2822", "#45302A"] as const;
const LIGHT_BG = "#F7F7F8";
const DARK_BG = "#1E1E20";

const DEFAULT_BLOBS = [
  { cx: "10%", cy: "-5%", rx: "58%", ry: "78%" },
  { cx: "48%", cy: "5%", rx: "52%", ry: "82%" },
  { cx: "92%", cy: "-5%", rx: "58%", ry: "78%" },
] as const;

export type MeshBlobConfig = {
  cx: string;
  cy: string;
  rx: string;
  ry: string;
};

export type MeshBackgroundProps = {
  colors?: readonly [string, string, string];
  background?: string;
  meshHeightRatio?: number;
  blobs?: readonly MeshBlobConfig[];
};

export default function MeshBackground({
  colors: colorsProp,
  background: backgroundProp,
  meshHeightRatio = 0.6,
  blobs: blobsProp,
}: MeshBackgroundProps = {}) {
  const { height, width } = useWindowDimensions();
  const scheme = useAppColorScheme();
  const themeBg = useCSSVariable("--color-background");
  const reactId = useId().replace(/:/g, "");
  const id = `m${reactId}`;

  const background =
    backgroundProp ??
    (typeof themeBg === "string" && themeBg.length > 0
      ? themeBg
      : scheme === "dark"
        ? DARK_BG
        : LIGHT_BG);

  const meshHeight = height * meshHeightRatio;
  const colors = colorsProp ?? (scheme === "dark" ? DARK_COLORS : LIGHT_COLORS);
  const blobs = blobsProp ?? DEFAULT_BLOBS;

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
      <View style={{ width, height: meshHeight, overflow: "hidden" }}>
        <Svg width={width} height={meshHeight} style={StyleSheet.absoluteFill}>
          <Defs>
            {blobs.map((blob, i) => (
              <RadialGradient
                key={i}
                id={`${id}_b${i}`}
                cx={blob.cx}
                cy={blob.cy}
                rx={blob.rx}
                ry={blob.ry}
              >
                <Stop offset="0%" stopColor={colors[i]} stopOpacity="0.95" />
                <Stop offset="55%" stopColor={colors[i]} stopOpacity="0.35" />
                <Stop offset="100%" stopColor={colors[i]} stopOpacity="0" />
              </RadialGradient>
            ))}
            <LinearGradient id={`${id}_f`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={background} stopOpacity="0" />
              <Stop offset="45%" stopColor={background} stopOpacity="0.15" />
              <Stop offset="75%" stopColor={background} stopOpacity="0.7" />
              <Stop offset="100%" stopColor={background} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={meshHeight} fill={background} />
          {blobs.map((_, i) => (
            <Rect
              key={i}
              x={0}
              y={0}
              width={width}
              height={meshHeight}
              fill={`url(#${id}_b${i})`}
            />
          ))}
          <Rect
            x={0}
            y={0}
            width={width}
            height={meshHeight}
            fill={`url(#${id}_f)`}
          />
        </Svg>
      </View>
    </View>
  );
}
