import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { hapticError, hapticProcessing, hapticSuccess } from "@/lib/haptics";
import { getFieldError } from "@/utils/errors";
import { logger } from "@/utils/logger";

import { Alert } from "heroui-native/alert";
import { Button } from "heroui-native/button";
import { Description } from "heroui-native/description";
import { Label } from "heroui-native/label";
import { Radio } from "heroui-native/radio";
import { RadioGroup } from "heroui-native/radio-group";
import { Select } from "heroui-native/select";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

import {
  CURRENCY_OPTIONS,
  SPLIT_METHODS,
  centsToDisplay,
  displayToCents,
  getSplitFormDefaults,
  splitFormSchema,
  type SplitFormSchema,
} from "../data/split-form";
import { SplitDateField } from "./split-date-field";
import {
  SplitField,
  SplitFieldShell,
  SplitTextAreaField,
} from "./split-form-field";
import { SplitReceiptImageField } from "./split-receipt-image-field";

type SplitFormProps = {
  onSubmit?: (values: SplitFormSchema) => void | Promise<void>;
};

export default function SplitForm({ onSubmit }: SplitFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitShakeSignal, setSubmitShakeSignal] = useState(0);

  const triggerSubmitShake = useCallback(() => {
    setSubmitShakeSignal((count) => count + 1);
  }, []);

  const form = useForm({
    defaultValues: getSplitFormDefaults(),
    validators: {
      onSubmit: splitFormSchema,
    },
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    onSubmitInvalid: () => {
      hapticError();
      triggerSubmitShake();
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      hapticProcessing();

      try {
        await onSubmit?.(value);
        hapticSuccess();
      } catch (error) {
        logger.error("split form submit failed", error);
        hapticError();
        triggerSubmitShake();
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Could not create this split. Try again.",
        );
      }
    },
  });

  const currencyLabels = useMemo(
    () =>
      Object.fromEntries(
        CURRENCY_OPTIONS.map((option) => [option.value, option.label]),
      ),
    [],
  );

  return (
    <View className="gap-8">
      {submitError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Couldn&apos;t create split</Alert.Title>
            <Alert.Description>{submitError}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <View className="gap-4">
        <View className="gap-1">
          <Typography type="h5" weight="semibold" className="text-foreground">
            Details
          </Typography>
          <Typography type="body-sm" color="muted">
            Name the split and add any context your group needs.
          </Typography>
        </View>

        <form.Field name="title">
          {(field) => (
            <SplitField
              label="Title"
              placeholder="Dinner at Mario's"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              isRequired
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <SplitTextAreaField
              label="Description"
              placeholder="Optional notes for everyone in the group."
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              numberOfLines={4}
            />
          )}
        </form.Field>

        <form.Field name="locationName">
          {(field) => (
            <SplitField
              label="Location"
              placeholder="Restaurant, venue, or address"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}
        </form.Field>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Typography type="h5" weight="semibold" className="text-foreground">
            Amounts
          </Typography>
          <Typography type="body-sm" color="muted">
            Set the currency, any discount, and when payment is due.
          </Typography>
        </View>

        <form.Field name="currency">
          {(field) => (
            <SplitFieldShell
              label="Currency"
              error={getFieldError(field.state.meta.errors)}
              isRequired
            >
              <Select
                presentation="bottom-sheet"
                value={{
                  value: field.state.value,
                  label: currencyLabels[field.state.value] ?? field.state.value,
                }}
                onValueChange={(option) => {
                  if (option && !Array.isArray(option)) {
                    field.handleChange(option.value);
                  }
                }}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Choose a currency" />
                  <Select.TriggerIndicator />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content
                    presentation="bottom-sheet"
                    snapPoints={["45%"]}
                  >
                    <Select.ListLabel className="mb-2">
                      Choose a currency
                    </Select.ListLabel>
                    {CURRENCY_OPTIONS.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        label={option.label}
                      />
                    ))}
                  </Select.Content>
                </Select.Portal>
              </Select>
            </SplitFieldShell>
          )}
        </form.Field>

        <form.Field name="discountAmountCents">
          {(field) => (
            <SplitField
              label="Discount"
              placeholder="0.00"
              description="Optional amount to subtract before splitting."
              value={centsToDisplay(field.state.value)}
              onChangeText={(text) => field.handleChange(displayToCents(text))}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          )}
        </form.Field>

        <form.Field name="dueAt">
          {(field) => (
            <SplitDateField
              label="Due date"
              description="When everyone should settle up."
              value={field.state.value}
              onChange={field.handleChange}
              error={getFieldError(field.state.meta.errors)}
              isRequired
              minimumDate={new Date()}
            />
          )}
        </form.Field>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Typography type="h5" weight="semibold" className="text-foreground">
            Split method
          </Typography>
          <Typography type="body-sm" color="muted">
            Choose how the total should be divided.
          </Typography>
        </View>

        <form.Field name="splitMethod">
          {(field) => (
            <SplitFieldShell
              label="Method"
              error={getFieldError(field.state.meta.errors)}
              isRequired
            >
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as SplitFormSchema["splitMethod"])
                }
                className="gap-3"
              >
                {SPLIT_METHODS.map((method) => (
                  <RadioGroup.Item
                    key={method.value}
                    value={method.value}
                    className="rounded-xl bg-surface-secondary px-3 py-3"
                    style={{ borderCurve: "continuous" }}
                  >
                    <View className="flex-1 gap-0.5">
                      <Label>{method.label}</Label>
                      <Description>{method.description}</Description>
                    </View>
                    <Radio />
                  </RadioGroup.Item>
                ))}
              </RadioGroup>
            </SplitFieldShell>
          )}
        </form.Field>
      </View>

      <View className="gap-4">
        <View className="gap-1">
          <Typography type="h5" weight="semibold" className="text-foreground">
            Receipt
          </Typography>
          <Typography type="body-sm" color="muted">
            Attach a photo of the receipt from your library or camera.
          </Typography>
        </View>

        <form.Field name="receiptImage">
          {(field) => (
            <SplitReceiptImageField
              label="Receipt image"
              description="Optional. You can add this later if you do not have one yet."
              value={field.state.value}
              onChange={field.handleChange}
              error={getFieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </View>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          hasValidationErrors: !state.isValid,
        })}
      >
        {({ isSubmitting, hasValidationErrors }) => (
          <ShakingSubmitButton
            shakeSignal={submitShakeSignal}
            isSubmitting={isSubmitting}
            hasActiveError={Boolean(submitError) || hasValidationErrors}
            onPress={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>
    </View>
  );
}

type ShakingSubmitButtonProps = {
  shakeSignal: number;
  isSubmitting: boolean;
  hasActiveError: boolean;
  onPress: () => void;
};

function ShakingSubmitButton({
  shakeSignal,
  isSubmitting,
  hasActiveError,
  onPress,
}: ShakingSubmitButtonProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (shakeSignal === 0) return;

    translateX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [shakeSignal, translateX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={shakeStyle}>
      <Button
        variant={hasActiveError ? "danger" : "primary"}
        size="md"
        isDisabled={isSubmitting}
        onPress={onPress}
      >
        {isSubmitting ? (
          <Spinner size="sm" color="white" />
        ) : (
          <Button.Label>Create split</Button.Label>
        )}
      </Button>
    </Animated.View>
  );
}
