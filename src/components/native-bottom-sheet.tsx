import { BottomSheet, RNHostView, type SnapPoint } from "@expo/ui";
import { type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NativeBottomSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  snapPoints?: SnapPoint[];
  showDragIndicator?: boolean;
  children: ReactNode;
};

export type { SnapPoint };

export function NativeBottomSheet({
  isPresented,
  onDismiss,
  snapPoints,
  showDragIndicator = true,
  children,
}: NativeBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const fillsParent = Boolean(snapPoints?.length);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={snapPoints}
      showDragIndicator={showDragIndicator}
    >
      <RNHostView matchContents={!fillsParent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={fillsParent ? { flex: 1 } : undefined}
        >
          <View
            className="gap-4 px-2 py-4"
            style={{
              flex: fillsParent ? 1 : undefined,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            {children}
          </View>
        </KeyboardAvoidingView>
      </RNHostView>
    </BottomSheet>
  );
}
