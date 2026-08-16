import { Camera01Icon, Image02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { View } from "react-native";

import { useImagePicker } from "@/hooks/use-image-picker";

import { Button } from "heroui-native/button";
import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";

import type { ReceiptImage } from "../data/split-form";

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
  const { isPicking, pickFromCamera, pickFromLibrary } = useImagePicker({
    cameraPermissionMessage:
      "Enable camera access in Settings to take receipt photos.",
    libraryPermissionMessage:
      "Enable photo library access in Settings to choose a receipt image.",
    errorTitle: "Could not add receipt",
    errorMessage:
      "Something went wrong while selecting the image. Try again.",
  });

  const handlePick = async (source: "library" | "camera") => {
    const image =
      source === "camera"
        ? await pickFromCamera()
        : await pickFromLibrary();

    if (image) {
      onChange(image);
    }
  };

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
            onPress={() => void handlePick("library")}
          >
            <HugeiconsIcon icon={Image02Icon} size={14} strokeWidth={1.75} />
            <Button.Label>{value ? "Replace" : "Find evidence"}</Button.Label>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isPicking}
            onPress={() => void handlePick("camera")}
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
