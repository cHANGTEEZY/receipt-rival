import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { formatDate } from "@/utils/formatter";
import { isAndroid } from "@/utils/platform";

import { Description } from "heroui-native/description";
import { FieldError } from "heroui-native/field-error";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { Typography } from "heroui-native/text";

import { normalizeDueDate } from "../data/split-form";

type SplitDateFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
  minimumDate?: Date;
};

export function SplitDateField({
  label,
  value,
  onChange,
  error,
  description,
  isRequired,
  minimumDate,
}: SplitDateFieldProps) {
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (isAndroid) {
      setShowAndroidPicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    onChange(normalizeDueDate(selectedDate));
  };

  return (
    <TextField isInvalid={Boolean(error)} isRequired={isRequired}>
      <Label>{label}</Label>

      {isAndroid ? (
        <View className="gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}, ${formatDate(value)}`}
            onPress={() => setShowAndroidPicker(true)}
            className="rounded-xl border border-border bg-surface px-3 py-3"
            style={{ borderCurve: "continuous" }}
          >
            <Typography type="body-sm" className="text-foreground">
              {formatDate(value)}
            </Typography>
          </Pressable>

          {showAndroidPicker ? (
            <DateTimePicker
              value={value}
              mode="date"
              display="default"
              minimumDate={minimumDate}
              onChange={handleChange}
            />
          ) : null}
        </View>
      ) : (
        <View className="self-start">
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            minimumDate={minimumDate}
            onChange={handleChange}
            themeVariant={Platform.OS === "ios" ? undefined : "light"}
          />
        </View>
      )}

      {description && !error ? (
        <Description>{description}</Description>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
