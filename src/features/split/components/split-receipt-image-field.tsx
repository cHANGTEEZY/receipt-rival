import { Camera01Icon, Image02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";

import { logger } from "@/utils/logger";

import { Button } from "heroui-native/button";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";

import type { ReceiptImage } from "../data/split-form";

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 0.85,
};

function toReceiptImage(
  asset: ImagePicker.ImagePickerAsset,
): ReceiptImage {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  };
}

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
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = useCallback(
    async (source: "library" | "camera") => {
      setIsPicking(true);

      try {
        if (source === "camera") {
          const permission =
            await ImagePicker.requestCameraPermissionsAsync();

          if (!permission.granted) {
            Alert.alert(
              "Camera access needed",
              "Enable camera access in Settings to take receipt photos.",
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync(
            IMAGE_PICKER_OPTIONS,
          );

          if (!result.canceled && result.assets[0]) {
            onChange(toReceiptImage(result.assets[0]));
          }

          return;
        }

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Photo library access needed",
            "Enable photo library access in Settings to choose a receipt image.",
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync(
          IMAGE_PICKER_OPTIONS,
        );

        if (!result.canceled && result.assets[0]) {
          onChange(toReceiptImage(result.assets[0]));
        }
      } catch (pickError) {
        logger.error("receipt image pick failed", pickError);
        Alert.alert(
          "Could not add receipt",
          "Something went wrong while selecting the image. Try again.",
        );
      } finally {
        setIsPicking(false);
      }
    },
    [onChange],
  );

  return (
    <TextField isInvalid={Boolean(error)}>
      <Label>{label}</Label>

      <View className="flex-row items-center gap-3">
        <View
          className="size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-secondary"
          style={{ borderCurve: "continuous" }}
        >
          {value ? (
            <Image
              source={{ uri: value.uri }}
              accessibilityLabel="Selected receipt preview"
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <HugeiconsIcon icon={Image02Icon} size={20} strokeWidth={1.5} />
          )}
        </View>

        <View className="flex-1 flex-row flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isPicking}
            onPress={() => pickImage("library")}
          >
            <HugeiconsIcon icon={Image02Icon} size={14} strokeWidth={1.75} />
            <Button.Label>{value ? "Replace" : "Find evidence"}</Button.Label>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isPicking}
            onPress={() => pickImage("camera")}
          >
            <HugeiconsIcon icon={Camera01Icon} size={14} strokeWidth={1.75} />
            <Button.Label>Snap evidence</Button.Label>
          </Button>
          {value ? (
            <Button
              variant="tertiary"
              size="sm"
              isDisabled={isPicking}
              onPress={() => onChange(null)}
            >
              <Button.Label>Remove</Button.Label>
            </Button>
          ) : null}
        </View>
      </View>

      {description && !error ? (
        <Description>{description}</Description>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
