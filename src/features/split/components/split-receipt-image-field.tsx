import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { useCSSVariable } from "uniwind";

import HapticPressable from "@/components/HapticButton";
import { useAppColorScheme } from "@/hooks/use-app-color-scheme";
import { useImagePicker } from "@/hooks/use-image-picker";

import { FieldError } from "heroui-native/field-error";
import { Typography } from "heroui-native/text";

import type { ReceiptImage } from "../data/split-form";

const GLYPH_SIZE = 24;

const BORDER_FALLBACK = {
  light: "#E3E3E6",
  dark: "#444448",
} as const;

const MUTED_FALLBACK = {
  light: "#8E8E93",
  dark: "#AEAEB2",
} as const;

const FOREGROUND_FALLBACK = {
  light: "#1C1C1E",
  dark: "#FFFFFF",
} as const;

type ReceiptSource = "library" | "camera";

type GlyphProps = {
  color: string;
  size?: number;
};

/** Landscape photo frame. */
function PhotosGlyph({ color, size = GLYPH_SIZE }: GlyphProps) {
  const width = Math.round(size * 0.84);
  const height = Math.round(size * 0.64);
  const radius = Math.round(size * 0.14);
  const sun = Math.max(4, Math.round(size * 0.16));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width,
          height,
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: color,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: sun,
            height: sun,
            borderRadius: sun,
            borderWidth: 1.5,
            borderColor: color,
            top: Math.round(size * 0.08),
            right: Math.round(size * 0.1),
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -2,
            bottom: -2,
            width: width * 0.55,
            height: height * 0.55,
            borderRadius: radius,
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

/** Camera body with a lens. */
function CameraGlyph({ color, size = GLYPH_SIZE }: GlyphProps) {
  const bodyWidth = Math.round(size * 0.84);
  const bodyHeight = Math.round(size * 0.56);
  const lens = Math.round(size * 0.28);
  const flash = Math.max(4, Math.round(size * 0.14));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: flash,
          height: Math.max(3, Math.round(size * 0.08)),
          borderRadius: 2,
          backgroundColor: color,
          marginBottom: 2,
          alignSelf: "flex-end",
          marginRight: Math.round(size * 0.16),
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderRadius: Math.round(size * 0.16),
          borderWidth: 1.5,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: lens,
            height: lens,
            borderRadius: lens,
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

const SOURCES: {
  value: ReceiptSource;
  label: string;
  description: string;
  glyph: (props: GlyphProps) => ReactElement;
}[] = [
  {
    value: "library",
    label: "Photos",
    description: "From your library",
    glyph: PhotosGlyph,
  },
  {
    value: "camera",
    label: "Camera",
    description: "Snap the receipt",
    glyph: CameraGlyph,
  },
];

type SplitReceiptImageFieldProps = {
  label: string;
  value: ReceiptImage | null;
  onChange: (image: ReceiptImage | null) => void;
  error?: string | null;
  description?: string;
};

export function SplitReceiptImageField({
  label,
  value,
  onChange,
  error,
  description,
}: SplitReceiptImageFieldProps) {
  const scheme = useAppColorScheme();
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");
  const border = useCSSVariable("--color-border");
  const [lastSource, setLastSource] = useState<ReceiptSource | null>(null);

  const selectedColor =
    typeof foreground === "string" ? foreground : FOREGROUND_FALLBACK[scheme];
  const idleColor = typeof muted === "string" ? muted : MUTED_FALLBACK[scheme];
  const idleBorder =
    typeof border === "string" ? border : BORDER_FALLBACK[scheme];

  const { isPicking, pickFromCamera, pickFromLibrary } = useImagePicker({
    cameraPermissionMessage:
      "Enable camera access in Settings to take receipt photos.",
    libraryPermissionMessage:
      "Enable photo library access in Settings to choose a receipt image.",
    errorTitle: "Could not add receipt",
    errorMessage:
      "Something went wrong while selecting the image. Try again.",
  });

  const handlePick = async (source: ReceiptSource) => {
    if (isPicking) return;

    const image =
      source === "camera" ? await pickFromCamera() : await pickFromLibrary();

    if (image) {
      setLastSource(source);
      onChange(image);
    }
  };

  const handleRemove = () => {
    setLastSource(null);
    onChange(null);
  };

  return (
    <View className="gap-2">
      <Typography type="body-sm" weight="semibold" className="text-foreground">
        {label}
      </Typography>
      {description && !error ? (
        <Typography type="body-xs" color="muted">
          {description}
        </Typography>
      ) : null}

      {value ? (
        <View
          className="overflow-hidden rounded-xl"
          style={{
            borderCurve: "continuous",
            borderWidth: 1.5,
            borderColor: selectedColor,
          }}
        >
          <Image
            source={{ uri: value.uri }}
            accessibilityLabel="Selected receipt preview"
            contentFit="cover"
            style={{ width: "100%", height: 160 }}
          />
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Remove receipt image"
            haptic={{ type: "pulsar", effect: "selection" }}
            hapticTrigger="onPressIn"
            onPress={handleRemove}
            className="items-start px-3 py-3"
          >
            <Typography type="body-sm" weight="semibold" style={{ color: selectedColor }}>
              Remove
            </Typography>
          </HapticPressable>
        </View>
      ) : null}

      <View className="flex-row gap-2.5">
        {SOURCES.map((source) => {
          const isSelected = Boolean(value) && lastSource === source.value;
          const accent = isSelected ? selectedColor : idleColor;
          const Glyph = source.glyph;

          return (
            <HapticPressable
              key={source.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isPicking }}
              accessibilityLabel={`${source.label}. ${source.description}`}
              disabled={isPicking}
              haptic={
                isPicking
                  ? { type: "none" }
                  : { type: "pulsar", effect: "selection" }
              }
              hapticTrigger="onPressIn"
              onPress={() => {
                void handlePick(source.value);
              }}
              className="min-h-22 flex-1 items-start justify-between rounded-xl px-3 py-3"
              style={{
                borderCurve: "continuous",
                borderWidth: isSelected ? 1.5 : 1,
                borderColor: isSelected ? selectedColor : idleBorder,
                opacity: isPicking ? 0.55 : 1,
              }}
            >
              <View className="w-full flex-row items-start gap-2">
                <Glyph color={accent} />
                <Typography
                  type="body-xs"
                  numberOfLines={2}
                  className="flex-1 text-right"
                  style={{ color: accent, opacity: 0.72 }}
                >
                  {source.description}
                </Typography>
              </View>
              <Typography
                type="body-sm"
                weight="semibold"
                style={{ color: accent }}
              >
                {source.label}
              </Typography>
            </HapticPressable>
          );
        })}
      </View>

      {error ? <FieldError>{error}</FieldError> : null}
    </View>
  );
}
