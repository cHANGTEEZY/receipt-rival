import { forwardRef, useState } from "react";
import { Pressable, type TextInput, View } from "react-native";

import { EyeIcon, EyeOffIcon } from "@/components/icons";

import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Input, type InputProps } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";

type AuthFieldProps = InputProps & {
  label: string;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
};

export const AuthField = forwardRef<TextInput, AuthFieldProps>(
  ({ label, error, description, isRequired, ...inputProps }, ref) => {
    return (
      <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
        <Label>{label}</Label>
        <Input ref={ref} {...inputProps} />
        {description && !error ? (
          <Description>{description}</Description>
        ) : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </TextField>
    );
  },
);

AuthField.displayName = "AuthField";

export const AuthPasswordField = forwardRef<TextInput, AuthFieldProps>(
  ({ label, error, description, isRequired, ...inputProps }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
        <Label>{label}</Label>
        <View className="w-full justify-center">
          <Input
            ref={ref}
            className="pr-12"
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            {...inputProps}
          />
          <Pressable
            className="absolute right-3 h-11 w-11 items-center justify-center"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            onPress={() => setVisible((v) => !v)}
          >
            {visible ? (
              <EyeOffIcon size={20} className="text-muted" />
            ) : (
              <EyeIcon size={20} className="text-muted" />
            )}
          </Pressable>
        </View>
        {description && !error ? (
          <Description>{description}</Description>
        ) : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </TextField>
    );
  },
);

AuthPasswordField.displayName = "AuthPasswordField";
