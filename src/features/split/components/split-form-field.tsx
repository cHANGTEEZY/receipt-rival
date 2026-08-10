import { forwardRef, type ReactNode } from "react";
import { type TextInput } from "react-native";

import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Input, type InputProps } from "heroui-native/input";
import { Label } from "heroui-native/label";
import { TextArea } from "heroui-native/text-area";
import { TextField } from "heroui-native/text-field";

type SplitFieldProps = InputProps & {
  label: string;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
};

export const SplitField = forwardRef<TextInput, SplitFieldProps>(
  ({ label, error, description, isRequired, ...inputProps }, ref) => {
    return (
      <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
        {label ? <Label>{label}</Label> : null}
        <Input ref={ref} {...inputProps} />
        {description && !error ? (
          <Description>{description}</Description>
        ) : null}
        {error ? <FieldError>{error}</FieldError> : null}
      </TextField>
    );
  },
);

SplitField.displayName = "SplitField";

type SplitTextAreaFieldProps = Omit<InputProps, "multiline"> & {
  label: string;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
};

export function SplitTextAreaField({
  label,
  error,
  description,
  isRequired,
  ...inputProps
}: SplitTextAreaFieldProps) {
  return (
    <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
      <Label>{label}</Label>
      <TextArea {...inputProps} />
      {description && !error ? (
        <Description>{description}</Description>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}

type SplitFieldShellProps = {
  label: string;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
  children: ReactNode;
};

export function SplitFieldShell({
  label,
  error,
  description,
  isRequired,
  children,
}: SplitFieldShellProps) {
  return (
    <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
      <Label>{label}</Label>
      {children}
      {description && !error ? (
        <Description>{description}</Description>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
