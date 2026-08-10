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
import { Typography } from "heroui-native/text";

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

      {value ? (
        <View className="gap-3">
          <View
            className="overflow-hidden rounded-xl border border-border bg-surface-secondary"
            style={{ borderCurve: "continuous" }}
          >
            <Image
              source={{ uri: value.uri }}
              accessibilityLabel="Selected receipt preview"
              contentFit="cover"
              style={{ width: "100%", height: 200 }}
            />
          </View>

          <Typography type="body-sm" color="muted" numberOfLines={1}>
            {value.fileName ?? "Receipt image selected"}
          </Typography>

          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              isDisabled={isPicking}
              onPress={() => pickImage("library")}
              className="flex-1"
            >
              <Button.Label>Replace</Button.Label>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isDisabled={isPicking}
              onPress={() => onChange(null)}
              className="flex-1"
            >
              <Button.Label>Remove</Button.Label>
            </Button>
          </View>
        </View>
      ) : (
        <View className="gap-2">
          <Button
            variant="secondary"
            size="md"
            isDisabled={isPicking}
            onPress={() => pickImage("library")}
          >
            <Button.Label>Choose from library</Button.Label>
          </Button>
          <Button
            variant="secondary"
            size="md"
            isDisabled={isPicking}
            onPress={() => pickImage("camera")}
          >
            <Button.Label>Take photo</Button.Label>
          </Button>
        </View>
      )}

      {description && !error ? (
        <Description>{description}</Description>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
