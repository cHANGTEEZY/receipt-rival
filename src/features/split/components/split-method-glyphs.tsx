import { type ReactNode } from "react";
import { View } from "react-native";

type SplitMethodGlyphProps = {
  color: string;
  size?: number;
};

function GlyphFrame({
  size,
  children,
}: {
  size: number;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

/** Three equal columns — split evenly. */
export function EqualSplitGlyph({ color, size = 28 }: SplitMethodGlyphProps) {
  const barWidth = Math.max(2, Math.round(size * 0.14));
  const barHeight = Math.round(size * 0.62);
  const gap = Math.round(size * 0.12);

  return (
    <GlyphFrame size={size}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: barWidth,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </GlyphFrame>
  );
}

/** Receipt lines — itemized split. */
export function ItemizedSplitGlyph({ color, size = 28 }: SplitMethodGlyphProps) {
  const width = Math.round(size * 0.72);
  const lineHeight = Math.max(2, Math.round(size * 0.08));
  const radii = Math.round(size * 0.14);
  const lineWidths = [1, 0.82, 0.64];

  return (
    <GlyphFrame size={size}>
      <View
        style={{
          width,
          paddingVertical: Math.round(size * 0.12),
          paddingHorizontal: Math.round(size * 0.1),
          borderWidth: 1.5,
          borderColor: color,
          borderRadius: radii,
          gap: Math.round(size * 0.1),
        }}
      >
        {lineWidths.map((fraction, index) => (
          <View
            key={index}
            style={{
              width: width * fraction * 0.72,
              height: lineHeight,
              borderRadius: lineHeight,
              backgroundColor: color,
              opacity: index === 0 ? 1 : 0.72 - index * 0.12,
            }}
          />
        ))}
      </View>
    </GlyphFrame>
  );
}

/** Pie slice — percentage split. */
export function PercentageSplitGlyph({
  color,
  size = 28,
}: SplitMethodGlyphProps) {
  const diameter = Math.round(size * 0.68);
  const radius = diameter / 2;

  return (
    <GlyphFrame size={size}>
      <View
        style={{
          width: diameter,
          height: diameter,
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: color,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: radius,
            height: diameter,
            left: 0,
            top: 0,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: radius * 0.55,
            height: radius * 0.55,
            borderRadius: radius,
            right: Math.round(radius * 0.12),
            top: Math.round(radius * 0.18),
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: "transparent",
          }}
        />
      </View>
    </GlyphFrame>
  );
}

/** Bars of different heights — custom amounts. */
export function CustomSplitGlyph({ color, size = 28 }: SplitMethodGlyphProps) {
  const barWidth = Math.max(2, Math.round(size * 0.13));
  const gap = Math.round(size * 0.1);
  const heights = [0.42, 0.72, 0.56];

  return (
    <GlyphFrame size={size}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap }}>
        {heights.map((fraction, index) => (
          <View
            key={index}
            style={{
              width: barWidth,
              height: Math.round(size * fraction),
              borderRadius: barWidth,
              backgroundColor: color,
              opacity: 0.55 + index * 0.15,
            }}
          />
        ))}
      </View>
    </GlyphFrame>
  );
}
