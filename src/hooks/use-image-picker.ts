import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { logger } from "@/utils/logger";

export type PickedImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type ImagePickerSource = "library" | "camera";

const DEFAULT_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  quality: 0.85,
};

export type UseImagePickerOptions = {
  pickerOptions?: ImagePicker.ImagePickerOptions;
  cameraPermissionTitle?: string;
  cameraPermissionMessage?: string;
  libraryPermissionTitle?: string;
  libraryPermissionMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  onError?: (error: unknown) => void;
};

export type ImagePickerSheetOptions = {
  title?: string;
  message?: string;
  cameraLabel?: string;
  libraryLabel?: string;
  cancelLabel?: string;
  onPick: (image: PickedImage) => void | Promise<void>;
};

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
    width: asset.width,
    height: asset.height,
  };
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const {
    pickerOptions = DEFAULT_PICKER_OPTIONS,
    cameraPermissionTitle = "Camera access needed",
    cameraPermissionMessage = "Enable camera access in Settings to take photos.",
    libraryPermissionTitle = "Photo library access needed",
    libraryPermissionMessage = "Enable photo library access in Settings to choose photos.",
    errorTitle = "Could not select photo",
    errorMessage = "Something went wrong while selecting the image. Try again.",
    onError,
  } = options;

  const [isPicking, setIsPicking] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      logger.error("image pick failed", error);
      onError?.(error);
      Alert.alert(errorTitle, errorMessage);
    },
    [errorMessage, errorTitle, onError],
  );

  const pickFromSource = useCallback(
    async (source: ImagePickerSource): Promise<PickedImage | null> => {
      setIsPicking(true);

      try {
        if (source === "camera") {
          const permission = await ImagePicker.requestCameraPermissionsAsync();

          if (!permission.granted) {
            Alert.alert(cameraPermissionTitle, cameraPermissionMessage);
            return null;
          }

          const result = await ImagePicker.launchCameraAsync(pickerOptions);

          if (result.canceled || !result.assets[0]) {
            return null;
          }

          return toPickedImage(result.assets[0]);
        }

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(libraryPermissionTitle, libraryPermissionMessage);
          return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

        if (result.canceled || !result.assets[0]) {
          return null;
        }

        return toPickedImage(result.assets[0]);
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsPicking(false);
      }
    },
    [
      cameraPermissionMessage,
      cameraPermissionTitle,
      handleError,
      libraryPermissionMessage,
      libraryPermissionTitle,
      pickerOptions,
    ],
  );

  const showPickerSheet = useCallback(
    ({
      title = "Choose photo",
      message,
      cameraLabel = "Take photo",
      libraryLabel = "Choose from library",
      cancelLabel = "Cancel",
      onPick,
    }: ImagePickerSheetOptions) => {
      Alert.alert(title, message, [
        {
          text: cameraLabel,
          onPress: () => {
            void (async () => {
              const image = await pickFromSource("camera");
              if (image) {
                await onPick(image);
              }
            })();
          },
        },
        {
          text: libraryLabel,
          onPress: () => {
            void (async () => {
              const image = await pickFromSource("library");
              if (image) {
                await onPick(image);
              }
            })();
          },
        },
        { text: cancelLabel, style: "cancel" },
      ]);
    },
    [pickFromSource],
  );

  return {
    isPicking,
    pickFromSource,
    pickFromCamera: () => pickFromSource("camera"),
    pickFromLibrary: () => pickFromSource("library"),
    showPickerSheet,
  };
}
