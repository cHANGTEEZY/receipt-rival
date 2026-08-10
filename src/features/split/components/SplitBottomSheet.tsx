import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { ReactNode } from "react";
import { View } from "react-native";

import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";

type SplitBottomSheetProps = {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SplitBottomSheet({
  trigger,
  title,
  description,
  children,
  isOpen,
  onOpenChange,
}: SplitBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={["85%"]}
          enableDynamicSizing={false}
          keyboardBehavior="extend"
          contentContainerClassName="h-full"
        >
          <View className="gap-1 px-1 pb-3">
            <BottomSheet.Title>{title}</BottomSheet.Title>
            {description ? (
              <BottomSheet.Description>{description}</BottomSheet.Description>
            ) : null}
          </View>
          <BottomSheetScrollView
            contentContainerClassName="gap-4 px-1 pb-6"
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </BottomSheetScrollView>
          <View className="px-1 pt-3">
            <BottomSheet.Close
              variant="secondary"
              size="md"
              isIconOnly={false}
              className="w-full"
            >
              <Button.Label>Done</Button.Label>
            </BottomSheet.Close>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
