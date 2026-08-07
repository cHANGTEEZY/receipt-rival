import Svg, { Circle, Line, Path } from "react-native-svg";
import { withUniwind } from "uniwind";

type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

const STROKE = 1.75;
const FALLBACK = "#8a8a8f";

function EyeBase({ size = 20, color = FALLBACK }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

function EyeOffBase({ size = 20, color = FALLBACK }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1={2}
        y1={2}
        x2={22}
        y2={22}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const colorMapping = {
  color: { fromClassName: "className", styleProperty: "color" },
} as const;

/** Password-reveal "show" icon. Color follows a text-* className token. */
export const EyeIcon = withUniwind(EyeBase, colorMapping);

/** Password-reveal "hide" icon. Color follows a text-* className token. */
export const EyeOffIcon = withUniwind(EyeOffBase, colorMapping);

/**
 * The "Calm Focus" brand glyph: an aperture ring with a centered dot.
 * Rendered in white on the accent tile (see AuthHeader).
 */
export function FocusGlyph({ size = 24, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12}
        cy={12}
        r={7}
        stroke={color}
        strokeOpacity={0.9}
        strokeWidth={2}
      />
      <Circle cx={12} cy={12} r={2.5} fill={color} />
    </Svg>
  );
}
