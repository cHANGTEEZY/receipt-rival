import { useForm } from "@tanstack/react-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useFriendsList } from "@/api/hooks/use-friends";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import { hapticError, hapticProcessing, hapticSuccess } from "@/lib/haptics";
import {
  collectValidationMessages,
  getFieldDisplayError,
  getItemRowErrors,
} from "@/utils/errors";
import { logger } from "@/utils/logger";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Alert } from "heroui-native/alert";
import { Button } from "heroui-native/button";
import { FieldError } from "heroui-native/field-error";
import { Select } from "heroui-native/select";
import { Spinner } from "heroui-native/spinner";
import { TagGroup } from "heroui-native/tag-group";
import { Typography } from "heroui-native/text";
import { useToast } from "heroui-native/toast";

import {
  CURRENCY_OPTIONS,
  SPLIT_METHODS,
  getSplitFormDefaults,
  splitFormSchema,
  type SplitFormSchema,
} from "../data/split-form";
import { SplitBottomSheet } from "./SplitBottomSheet";
import { SplitSummaryRow } from "./SplitSummaryRow";
import { SplitCustomAmountField } from "./split-custom-amount-field";
import { SplitDateField } from "./split-date-field";
import { SplitFriendsField } from "./split-friends-field";
import { SplitField, SplitTextAreaField } from "./split-form-field";
import { SplitItemAssignmentsField } from "./split-item-assignments-field";
import { SplitItemsField } from "./split-items-field";
import { SplitMoneyField } from "./split-money-field";
import { SplitPercentageField } from "./split-percentage-field";
import { SplitReceiptImageField } from "./split-receipt-image-field";

type SplitFormProps = {
  onSubmit?: (values: SplitFormSchema) => void | Promise<void>;
};

export default function SplitForm({ onSubmit }: SplitFormProps) {
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitShakeSignal, setSubmitShakeSignal] = useState(0);

  const { data: friendsData } = useFriendsList();
  const friends = getAcceptedFriends(friendsData?.data ?? []);
  const friendNameById = useMemo(
    () => new Map(friends.map((friend) => [friend.id, friend.name])),
    [friends],
  );

  const triggerSubmitShake = useCallback(() => {
    setSubmitShakeSignal((count) => count + 1);
  }, []);

  const showValidationFailure = useCallback(
    (formApi: Parameters<typeof collectValidationMessages>[0]) => {
      const messages = collectValidationMessages(formApi);
      const summary =
        messages[0] ?? "Fix the highlighted fields and try again.";

      logger.warn("split form validation failed", {
        messages,
        errors: formApi.getAllErrors(),
      });

      setSubmitError(summary);
      toast.show({
        variant: "danger",
        label: "Couldn\u2019t create split",
        description:
          messages.length > 1
            ? `${summary} (+${messages.length - 1} more)`
            : summary,
      });
      hapticError();
      triggerSubmitShake();
    },
    [toast, triggerSubmitShake],
  );

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
    onSubmitInvalid: ({ formApi }) => {
      showValidationFailure(formApi);
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
        const message =
          error instanceof Error
            ? error.message
            : "Could not create this split. Try again.";
        setSubmitError(message);
        toast.show({
          variant: "danger",
          label: "Couldn\u2019t create split",
          description: message,
        });
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
    <form.Subscribe
      selector={(state) => ({
        fieldMeta: state.fieldMeta,
        submissionAttempts: state.submissionAttempts,
        isValid: state.isValid,
        isSubmitting: state.isSubmitting,
        values: state.values,
      })}
    >
      {({ fieldMeta, submissionAttempts, isValid, isSubmitting, values }) => {
        const filledItems = values.items.filter(
          (item) => item.name.trim() || item.unitPriceCents > 0,
        );
        const itemsTotalCents = filledItems.reduce(
          (sum, item) => sum + Math.round(item.quantity * item.unitPriceCents),
          0,
        );
        const effectiveTotalCents =
          filledItems.length > 0 ? itemsTotalCents : values.totalAmountCents;
        const netTotalCents = Math.max(
          0,
          effectiveTotalCents - values.discountAmountCents,
        );

        const hasErrorFor = (names: string[]) =>
          submissionAttempts > 0 &&
          names.some((name) => Boolean(getFieldDisplayError(name, [], fieldMeta)));

        const detailsValue = values.title
          ? `${values.title}${values.locationName ? ` @ ${values.locationName}` : ""}`
          : undefined;

        const friendNames = values.friendIds
          .map((id) => friendNameById.get(id))
          .filter((name): name is string => Boolean(name));
        const friendsValue =
          values.friendIds.length > 0
            ? `${values.friendIds.length} accomplice${values.friendIds.length === 1 ? "" : "s"}${friendNames.length ? `: ${friendNames.join(", ")}` : ""}`
            : undefined;

        const amountsValue = `${formatMoney(netTotalCents, values.currency)}${
          values.discountAmountCents > 0
            ? ` (−${formatMoney(values.discountAmountCents, values.currency)})`
            : ""
        } · Due ${formatShortDate(values.dueAt)}`;

        const itemsValue =
          filledItems.length > 0
            ? `${filledItems.length} item${filledItems.length === 1 ? "" : "s"} · ${formatMoney(itemsTotalCents, values.currency)}`
            : undefined;

        const incompleteAssignmentCount = filledItems.filter((item) => {
          const assignment = values.itemAssignments.find(
            (a) => a.itemLocalId === item.localId,
          );
          const assignedQuantity = (assignment?.allocations ?? []).reduce(
            (sum, allocation) => sum + allocation.quantity,
            0,
          );
          return Math.abs(assignedQuantity - item.quantity) > 0.001;
        }).length;
        const assignmentsValue =
          filledItems.length === 0
            ? undefined
            : incompleteAssignmentCount === 0
              ? "All units assigned — nobody's off the hook."
              : `${incompleteAssignmentCount} item${incompleteAssignmentCount === 1 ? "" : "s"} still unassigned`;

        const totalPercentage = values.percentageSplits.reduce(
          (sum, split) => sum + split.percentage,
          0,
        );
        const percentageValue =
          values.friendIds.length === 0
            ? undefined
            : Math.abs(totalPercentage - 100) <= 0.01
              ? "100% assigned"
              : `Missing ${(100 - totalPercentage).toFixed(1)}%`;

        const assignedCustomCents = values.customSplits.reduce(
          (sum, split) => sum + split.amountCents,
          0,
        );
        const customValue =
          values.friendIds.length === 0
            ? undefined
            : `${formatMoney(assignedCustomCents, values.currency)} of ${formatMoney(netTotalCents, values.currency)}`;

        return (
          <View className="gap-6">
            {submitError ? (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Couldn&apos;t create split</Alert.Title>
                  <Alert.Description>{submitError}</Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            <form.Field name="splitMethod">
              {(field) => (
                <View className="gap-2">
                  <Typography
                    type="body-sm"
                    weight="semibold"
                    className="text-foreground"
                  >
                    How are we doing this?
                  </Typography>
                  <TagGroup
                    selectionMode="single"
                    variant="surface"
                    selectedKeys={new Set([field.state.value])}
                    onSelectionChange={(keys) => {
                      const [selected] = [...keys];
                      if (selected) {
                        field.handleChange(
                          selected as SplitFormSchema["splitMethod"],
                        );
                      }
                    }}
                  >
                    <TagGroup.List className="flex-row flex-wrap gap-2">
                      {SPLIT_METHODS.map((method) => (
                        <TagGroup.Item key={method.value} id={method.value}>
                          {method.label}
                        </TagGroup.Item>
                      ))}
                    </TagGroup.List>
                  </TagGroup>
                </View>
              )}
            </form.Field>

            <SplitBottomSheet
              trigger={
                <SplitSummaryRow
                  label="Spill the Details"
                  value={detailsValue}
                  placeholder="Name this betrayal"
                  hasError={hasErrorFor(["title", "description", "locationName"])}
                />
              }
              title="Spill the Details"
              description="Name the split and add any context your group needs."
            >
              <form.Field name="title">
                {(field) => (
                  <SplitField
                    label="What's This Betrayal Called?"
                    placeholder="Dinner at Mario's"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldDisplayError(
                      "title",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                    isRequired
                    autoCapitalize="sentences"
                    returnKeyType="next"
                  />
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <SplitTextAreaField
                    label="Your Alibi"
                    placeholder="Optional notes for everyone in the group."
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldDisplayError(
                      "description",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                    numberOfLines={4}
                  />
                )}
              </form.Field>

              <form.Field name="locationName">
                {(field) => (
                  <SplitField
                    label="Scene of the Crime"
                    placeholder="Restaurant, venue, or address"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldDisplayError(
                      "locationName",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
              </form.Field>
            </SplitBottomSheet>

            <SplitBottomSheet
              trigger={
                <SplitSummaryRow
                  label="Who's Paying With You"
                  value={friendsValue}
                  placeholder="Name the accomplices"
                  hasError={hasErrorFor(["friendIds"])}
                />
              }
              title="Name the Accomplices"
              description="Choose who should be included in this split."
            >
              <form.Field name="friendIds">
                {(field) => (
                  <SplitFriendsField
                    value={field.state.value}
                    onChange={field.handleChange}
                    error={getFieldDisplayError(
                      "friendIds",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                  />
                )}
              </form.Field>
            </SplitBottomSheet>

            <SplitBottomSheet
              trigger={
                <SplitSummaryRow
                  label="Talk Money"
                  value={amountsValue}
                  hasError={hasErrorFor([
                    "currency",
                    "totalAmountCents",
                    "discountAmountCents",
                    "dueAt",
                  ])}
                />
              }
              title="Talk Money"
              description="Set the currency, bill total, any discount, and when payment is due."
            >
              <form.Field name="currency">
                {(field) => (
                  <View className="gap-1.5">
                    <Typography type="body-sm" weight="semibold">
                      Currency
                    </Typography>
                    <Select
                      presentation="bottom-sheet"
                      value={{
                        value: field.state.value,
                        label:
                          currencyLabels[field.state.value] ??
                          field.state.value,
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
                    {getFieldDisplayError(
                      "currency",
                      field.state.meta.errors,
                      fieldMeta,
                    ) ? (
                      <FieldError>
                        {getFieldDisplayError(
                          "currency",
                          field.state.meta.errors,
                          fieldMeta,
                        )}
                      </FieldError>
                    ) : null}
                  </View>
                )}
              </form.Field>

              {values.splitMethod !== "itemized" ? (
                <form.Field name="totalAmountCents">
                  {(field) => (
                    <SplitMoneyField
                      label="The Damage"
                      placeholder="0.00"
                      description="Bill total before discount."
                      valueCents={field.state.value}
                      onChangeCents={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldDisplayError(
                        "totalAmountCents",
                        field.state.meta.errors,
                        fieldMeta,
                      )}
                      isRequired
                      returnKeyType="next"
                    />
                  )}
                </form.Field>
              ) : null}

              <form.Field name="discountAmountCents">
                {(field) => (
                  <SplitMoneyField
                    label="Sweet, Sweet Discount"
                    placeholder="0.00"
                    description="Optional amount to subtract before splitting."
                    valueCents={field.state.value}
                    onChangeCents={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldDisplayError(
                      "discountAmountCents",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                    returnKeyType="next"
                  />
                )}
              </form.Field>

              <form.Field name="dueAt">
                {(field) => (
                  <SplitDateField
                    label="Pay-Up Deadline"
                    description="Future dates are banned. This debt is already due."
                    value={field.state.value}
                    onChange={field.handleChange}
                    error={getFieldDisplayError(
                      "dueAt",
                      field.state.meta.errors,
                      fieldMeta,
                    )}
                    isRequired
                  />
                )}
              </form.Field>
            </SplitBottomSheet>

            {values.splitMethod === "itemized" ||
            values.splitMethod === "equal" ? (
              <SplitBottomSheet
                trigger={
                  <SplitSummaryRow
                    label="Autopsy the Receipt"
                    value={itemsValue}
                    placeholder={
                      values.splitMethod === "itemized"
                        ? "Required — add the evidence"
                        : "Optional line items"
                    }
                    hasError={hasErrorFor(["items"])}
                  />
                }
                title="Autopsy the Receipt"
                description={
                  values.splitMethod === "itemized"
                    ? "Required for itemized splits. Assign every unit to a suspect."
                    : "Optional. If you add items, the total is calculated from them."
                }
              >
                <form.Field name="items">
                  {(field) => (
                    <SplitItemsField
                      value={field.state.value}
                      onChange={field.handleChange}
                      error={getFieldDisplayError(
                        "items",
                        field.state.meta.errors,
                        fieldMeta,
                      )}
                      rowErrors={getItemRowErrors(fieldMeta)}
                    />
                  )}
                </form.Field>
              </SplitBottomSheet>
            ) : null}

            {values.splitMethod === "itemized" ? (
              <SplitBottomSheet
                trigger={
                  <SplitSummaryRow
                    label="Assign the Guilt"
                    value={assignmentsValue}
                    placeholder="Who ate what?"
                    hasError={hasErrorFor(["itemAssignments"])}
                  />
                }
                title="Assign the Guilt"
                description="Distribute every item's quantity across the accomplices."
              >
                <form.Field name="itemAssignments">
                  {(field) => (
                    <SplitItemAssignmentsField
                      items={values.items}
                      friendIds={values.friendIds}
                      currency={values.currency}
                      value={field.state.value}
                      onChange={field.handleChange}
                      error={getFieldDisplayError(
                        "itemAssignments",
                        field.state.meta.errors,
                        fieldMeta,
                      )}
                    />
                  )}
                </form.Field>
              </SplitBottomSheet>
            ) : null}

            {values.splitMethod === "percentage" ? (
              <SplitBottomSheet
                trigger={
                  <SplitSummaryRow
                    label="Slice the Pie"
                    value={percentageValue}
                    placeholder="Assign shares"
                    hasError={hasErrorFor(["percentageSplits"])}
                  />
                }
                title="Slice the Pie"
                description="Assign a percentage share to each accomplice."
              >
                <form.Field name="percentageSplits">
                  {(field) => (
                    <SplitPercentageField
                      friendIds={values.friendIds}
                      value={field.state.value}
                      onChange={field.handleChange}
                      error={getFieldDisplayError(
                        "percentageSplits",
                        field.state.meta.errors,
                        fieldMeta,
                      )}
                    />
                  )}
                </form.Field>
              </SplitBottomSheet>
            ) : null}

            {values.splitMethod === "custom" ? (
              <SplitBottomSheet
                trigger={
                  <SplitSummaryRow
                    label="Name Your Price"
                    value={customValue}
                    placeholder="Type exact amounts"
                    hasError={hasErrorFor(["customSplits"])}
                  />
                }
                title="Name Your Price"
                description="Set exact amounts manually. They must add up to the total."
              >
                <form.Field name="customSplits">
                  {(field) => (
                    <SplitCustomAmountField
                      friendIds={values.friendIds}
                      currency={values.currency}
                      totalCents={netTotalCents}
                      value={field.state.value}
                      onChange={field.handleChange}
                      error={getFieldDisplayError(
                        "customSplits",
                        field.state.meta.errors,
                        fieldMeta,
                      )}
                    />
                  )}
                </form.Field>
              </SplitBottomSheet>
            ) : null}

            <form.Field name="receiptImage">
              {(field) => (
                <SplitReceiptImageField
                  label="Exhibit A"
                  description="Optional. You can add this later if you do not have one yet."
                  value={field.state.value}
                  onChange={field.handleChange}
                  error={getFieldDisplayError(
                    "receiptImage",
                    field.state.meta.errors,
                    fieldMeta,
                  )}
                />
              )}
            </form.Field>

            <ShakingSubmitButton
              shakeSignal={submitShakeSignal}
              isSubmitting={isSubmitting}
              hasActiveError={
                Boolean(submitError) || (submissionAttempts > 0 && !isValid)
              }
              onPress={() => form.handleSubmit()}
            />
          </View>
        );
      }}
    </form.Subscribe>
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
          <Button.Label>Unleash the Split</Button.Label>
        )}
      </Button>
    </Animated.View>
  );
}
