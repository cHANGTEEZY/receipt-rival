import {
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from "react-native";
import { cn } from "heroui-native";

type KeyboardAvoidingWrapperProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  keyboardVerticalOffset?: number;
};

const KeyboardAvoidingWrapper = ({
  children,
  className,
  style,
  keyboardVerticalOffset = 0,
}: KeyboardAvoidingWrapperProps) => {
  // Android `behavior="height"` often collapses content to zero height (blank screen).
  // Prefer padding on iOS; leave behavior unset on Android.
  return (
    <KeyboardAvoidingView
      className={cn("flex-1", className)}
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? keyboardVerticalOffset : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingWrapper;
