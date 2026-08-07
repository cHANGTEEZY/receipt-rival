import { cn } from "heroui-native";
import { ScrollView, View, type ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  contentContainerClassName?: string;
  contentContainerStyle?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
  bleedTop?: boolean;
  testID?: string;
};

const Screen = ({
  children,
  className,
  scroll = false,
  contentContainerClassName,
  contentContainerStyle,
  edges,
  bleedTop = false,
  testID,
}: ScreenProps) => {
  const { top } = useSafeAreaInsets();
  const scheme = useAppColorScheme();
  const backgroundColor = scheme === "dark" ? "#1E1E20" : "#F7F7F8";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={edges}
      testID={testID}
      collapsable={false}
    >
      <View
        collapsable={false}
        className={cn("flex-1 bg-background", className)}
        style={{
          flex: 1,
          paddingTop: bleedTop ? 0 : top,
          backgroundColor,
        }}
      >
        {scroll ? (
          <ScrollView
            className="flex-1"
            style={{ flex: 1 }}
            contentContainerClassName={cn(
              "flex-grow",
              contentContainerClassName,
            )}
            contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </SafeAreaView>
  );
};

export default Screen;
