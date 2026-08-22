import { useForm } from "@tanstack/react-form";
import { useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

import { useFriendsList } from "@/api/hooks/use-friends";
import { getAcceptedFriends } from "@/features/friends/lib/friendship-status";
import {
  hapticError,
  hapticProcessing,
  hapticSelection,
  hapticSuccess,
} from "@/lib/haptics";
import { useSession } from "@/lib/auth-client";
import {
  collectValidationMessages,
  fieldHasError,
  getFirstErroredGroupIndex,
  getItemRowErrors,
  resolveFieldError,
} from "@/utils/errors";
import { logger } from "@/utils/logger";
import { formatMoney, formatShortDate } from "@/utils/money";

import { Alert } from "heroui-native/alert";
import { FieldError } from "heroui-native/field-error";
import { ListGroup } from "heroui-native/list-group";
import { Select } from "heroui-native/select";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useToast } from "heroui-native/toast";

import {
  CURRENCY_OPTIONS,
  SPLIT_METHODS,
  getSplitFormDefaults,
  splitFormSchema,
  type SplitFormSchema,
  type SplitMethod,
} from "../data/split-form";
import { SplitCustomAmountField } from "./split-custom-amount-field";
import { SplitDateField } from "./split-date-field";
import { SplitField, SplitTextAreaField } from "./split-form-field";
import { SplitFriendsField } from "./split-friends-field";
import { SplitItemAssignmentsField } from "./split-item-assignments-field";
import { SplitItemsField } from "./split-items-field";
import { SplitMoneyField } from "./split-money-field";
import { SplitPercentageField } from "./split-percentage-field";
import { SplitReceiptImageField } from "./split-receipt-image-field";
import { SplitMethodField } from "./split-method-field";
import {
  getHumorousErrorToast,
  getStepValidationError,
  type StepId,
} from "../lib/split-form-validation";
import {
  SplitStepFooter,
  SplitStepHeader,
  type SplitStep,
} from "./split-stepper";

type SplitFormProps = {
  initialFriendIds?: string[];
  onSubmit?: (values: SplitFormSchema) => void | Promise<void>;
};

type FormStep = SplitStep & { id: StepId; fields: string[] };

function buildSteps(splitMethod: SplitMethod): FormStep[] {
  const steps: FormStep[] = [
    {
      id: "details",
      title: "Split basics",
      description: "Give the bill a name and add any helpful details.",
      fields: ["title", "description", "locationName"],
    },
    {
      id: "friends",
      title: "Who's in",
      description: "Choose who should be included in this split.",
      fields: ["friendIds"],
    },
    {
      id: "amounts",
      title: "Amounts",
      description:
        "Choose how to split, then enter the bill total and payment details.",
      fields: [
        "splitMethod",
        "currency",
        "totalAmountCents",
        "discountAmountCents",
        "dueAt",
      ],
    },
  ];

  if (splitMethod === "equal" || splitMethod === "itemized") {
    steps.push({
      id: "items",
      title: "Items",
      description:
        splitMethod === "itemized"
          ? "Add the lines you care about. Dump the rest as Others instead of typing the whole receipt."
          : "Optional. If you add items, they must match the bill total.",
      fields: ["items"],
    });
  }

  if (splitMethod === "itemized") {
    steps.push({
      id: "assignments",
      title: "Assign items",
      description:
        "Assign the lines you itemized. Send leftover units or Others to everyone else in one tap.",
      fields: ["itemAssignments"],
    });
  }

  if (splitMethod === "percentage") {
    steps.push({
      id: "percentage",
      title: "Percentage split",
      description: "Assign a percentage share to everyone, including you.",
      fields: ["percentageSplits"],
    });
  }

  if (splitMethod === "custom") {
    steps.push({
      id: "custom",
      title: "Custom split",
      description: "Set exact amounts manually. They must add up to the total.",
      fields: ["customSplits"],
    });
  }

  steps.push({
    id: "review",
    title: "Receipt & review",
    description:
      "Add a receipt photo, double check the details, then create the split.",
    fields: ["receiptImage"],
  });

  return steps;
}

function FormSection({ children }: { children: ReactNode }) {
  return (
    <View
      className="gap-4 rounded-3xl bg-surface px-4 py-5"
      style={{ borderCurve: "continuous" }}
    >
      {children}
    </View>
  );
}

function SplitReviewSummary({
  values,
  friendNameById,
  netTotalCents,
  currencyLabel,
}: {
  values: SplitFormSchema;
  friendNameById: Map<string, string>;
  netTotalCents: number;
  currencyLabel: string;
}) {
  const methodLabel =
    SPLIT_METHODS.find((method) => method.value === values.splitMethod)
      ?.label ?? values.splitMethod;
  const friendNames = values.friendIds
    .map((id) => friendNameById.get(id) ?? "Friend")
    .join(", ");

  return (
    <ListGroup className="overflow-hidden rounded-3xl">
      <ListGroup.Item disabled>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>
            {values.title.trim() || "Untitled split"}
          </ListGroup.ItemTitle>
          <ListGroup.ItemDescription numberOfLines={1}>
            {values.locationName.trim() || "No location set"}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <Typography type="body-sm" weight="semibold">
            {methodLabel}
          </Typography>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>

      <Separator />

      <ListGroup.Item disabled>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>Friends</ListGroup.ItemTitle>
          <ListGroup.ItemDescription numberOfLines={1}>
            {friendNames || "None selected"}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <Typography type="body-sm" weight="semibold">
            {values.friendIds.length}
          </Typography>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>

      <Separator />

      <ListGroup.Item disabled>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>Total due</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            {currencyLabel} · Due {formatShortDate(values.dueAt)}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix>
          <Typography type="body-sm" weight="bold">
            {formatMoney(netTotalCents, values.currency)}
          </Typography>
        </ListGroup.ItemSuffix>
      </ListGroup.Item>
    </ListGroup>
  );
}

export default function SplitForm({
  initialFriendIds,
  onSubmit,
}: SplitFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepFieldErrors, setStepFieldErrors] = useState<Record<string, string>>(
    {},
  );
  const [shakeSignal, setShakeSignal] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const showFieldErrorToast = (field: string, message: string) => {
    const humorous = getHumorousErrorToast(field, message);
    toast.show({
      variant: "danger",
      label: humorous.label,
      description: humorous.description,
    });
  };

  const { data: friendsData } = useFriendsList();
  const friends = getAcceptedFriends(friendsData?.data ?? []);
  const friendNameById = useMemo(
    () => new Map(friends.map((friend) => [friend.id, friend.name])),
    [friends],
  );

  const form = useForm({
    defaultValues: {
      ...getSplitFormDefaults(),
      friendIds: initialFriendIds ?? [],
    },
    validators: {
      onSubmit: splitFormSchema,
    },
    listeners: {
      onChange: () => {
        setSubmitError(null);
        setStepFieldErrors({});
      },
    },
    onSubmitInvalid: ({ formApi }) => {
      const messages = collectValidationMessages(formApi);
      const summary =
        messages[0] ?? "Fix the highlighted fields and try again.";

      logger.warn("split form validation failed", {
        messages,
        errors: formApi.getAllErrors(),
      });

      const errorSteps = buildSteps(formApi.state.values.splitMethod);
      const erroredIndex = getFirstErroredGroupIndex(
        errorSteps.map((step) => step.fields),
        formApi.state.fieldMeta,
      );

      const erroredField =
        erroredIndex >= 0
          ? errorSteps[erroredIndex]?.fields.find((fieldName) =>
              fieldHasError(fieldName, formApi.state.fieldMeta),
            )
          : undefined;

      if (erroredIndex >= 0 && erroredIndex !== currentIndex) {
        setDirection(erroredIndex < currentIndex ? "backward" : "forward");
        setCurrentIndex(erroredIndex);
      }

      showFieldErrorToast(erroredField ?? "title", summary);
      hapticError();
      setShakeSignal((count) => count + 1);
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      setStepFieldErrors({});

      hapticProcessing();

      try {
        await onSubmit?.(value);
        hapticSuccess();
      } catch (error) {
        logger.error("split form submit failed", error);
        hapticError();
        setShakeSignal((count) => count + 1);
        const message =
          error instanceof Error
            ? error.message
            : "Could not create this split. Try again.";
        setSubmitError(message);
        showFieldErrorToast("submit", message);
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
        isSubmitting: state.isSubmitting,
        values: state.values,
      })}
    >
      {({ fieldMeta, isSubmitting, values }) => {
        const steps = buildSteps(values.splitMethod);
        const clampedIndex = Math.min(currentIndex, steps.length - 1);
        const currentStep = steps[clampedIndex];
        const isFirstStep = clampedIndex === 0;
        const isLastStep = clampedIndex === steps.length - 1;

        const netTotalCents = Math.max(
          0,
          values.totalAmountCents - values.discountAmountCents,
        );
        const currentUserId = session?.user?.id;
        const participantIds = currentUserId
          ? [currentUserId, ...values.friendIds.filter((id) => id !== currentUserId)]
          : values.friendIds;

        const fieldError = (fieldName: string, fieldErrors: unknown[]) =>
          resolveFieldError(
            fieldName,
            fieldErrors,
            fieldMeta,
            stepFieldErrors,
          );

        const hasActiveError = currentStep.fields.some((fieldName) =>
          Boolean(fieldError(fieldName, [])),
        );

        const handleNext = () => {
          if (isLastStep) {
            form.handleSubmit();
            return;
          }

          const validationError = getStepValidationError(currentStep.id, values);

          if (validationError) {
            setStepFieldErrors({ [validationError.field]: validationError.message });
            showFieldErrorToast(
              validationError.field,
              validationError.message,
            );
            hapticError();
            setShakeSignal((count) => count + 1);
            return;
          }

          hapticSelection();
          setDirection("forward");
          setCurrentIndex(clampedIndex + 1);
          setStepFieldErrors({});
        };

        const handleBack = () => {
          if (isFirstStep) return;
          hapticSelection();
          setDirection("backward");
          setCurrentIndex(clampedIndex - 1);
          setStepFieldErrors({});
        };

        return (
          <View className="gap-6">
            <SplitStepHeader steps={steps} currentIndex={clampedIndex} />

            <Animated.View
              key={currentStep.id}
              entering={
                direction === "forward"
                  ? SlideInRight.duration(240)
                  : SlideInLeft.duration(240)
              }
              exiting={
                direction === "forward"
                  ? SlideOutLeft.duration(180)
                  : SlideOutRight.duration(180)
              }
              className="gap-6"
            >
              {submitError && isLastStep ? (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Couldn&apos;t create split</Alert.Title>
                    <Alert.Description>{submitError}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}

              {currentStep.id === "details" ? (
                <FormSection>
                    <form.Field name="title">
                      {(field) => (
                        <SplitField
                          label="Title"
                          placeholder="Dinner at Mario's"
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          error={fieldError("title", field.state.meta.errors)}
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
                          error={fieldError(
                            "description",
                            field.state.meta.errors,
                          )}
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
                          error={fieldError(
                            "locationName",
                            field.state.meta.errors,
                          )}
                          autoCapitalize="words"
                          returnKeyType="next"
                        />
                      )}
                    </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "friends" ? (
                <FormSection>
                  <form.Field name="friendIds">
                    {(field) => (
                      <SplitFriendsField
                        value={field.state.value}
                        onChange={field.handleChange}
                        error={fieldError("friendIds", field.state.meta.errors)}
                      />
                    )}
                  </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "amounts" ? (
                <>
                  <form.Field name="splitMethod">
                    {(field) => (
                      <SplitMethodField
                        value={field.state.value}
                        onChange={field.handleChange}
                        error={fieldError(
                          "splitMethod",
                          field.state.meta.errors,
                        )}
                      />
                    )}
                  </form.Field>

                  <FormSection>
                  <form.Field name="currency">
                    {(field) => {
                      const currencyError = fieldError(
                        "currency",
                        field.state.meta.errors,
                      );

                      return (
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
                          <Select.Trigger
                            className={`w-full ${currencyError ? "border border-danger" : ""}`}
                          >
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
                        {currencyError ? (
                          <FieldError>{currencyError}</FieldError>
                        ) : null}
                      </View>
                      );
                    }}
                  </form.Field>

                  <form.Field name="totalAmountCents">
                    {(field) => (
                      <SplitMoneyField
                        label="Total Amount"
                        placeholder="0.00"
                        description="Bill total before discount. Added items must match it."
                        valueCents={field.state.value}
                        onChangeCents={field.handleChange}
                        onBlur={field.handleBlur}
                        error={fieldError(
                          "totalAmountCents",
                          field.state.meta.errors,
                        )}
                        isRequired
                        returnKeyType="next"
                      />
                    )}
                  </form.Field>

                  <form.Field name="discountAmountCents">
                    {(field) => (
                      <SplitMoneyField
                        label="Discount"
                        placeholder="0.00"
                        description="Optional amount to subtract before splitting."
                        valueCents={field.state.value}
                        onChangeCents={field.handleChange}
                        onBlur={field.handleBlur}
                        error={fieldError(
                          "discountAmountCents",
                          field.state.meta.errors,
                        )}
                        returnKeyType="next"
                      />
                    )}
                  </form.Field>

                  <form.Field name="dueAt">
                    {(field) => (
                      <SplitDateField
                        label="Due Date"
                        description="The date the payment is due."
                        value={field.state.value}
                        onChange={field.handleChange}
                        error={fieldError("dueAt", field.state.meta.errors)}
                        isRequired
                      />
                    )}
                  </form.Field>
                  </FormSection>
                </>
              ) : null}

              {currentStep.id === "items" ? (
                <FormSection>
                  <form.Field name="items">
                    {(field) => (
                      <SplitItemsField
                        value={field.state.value}
                        onChange={field.handleChange}
                        totalAmountCents={values.totalAmountCents}
                        currency={values.currency}
                        allowRemainderShare={values.splitMethod === "itemized"}
                        error={fieldError("items", field.state.meta.errors)}
                        rowErrors={getItemRowErrors(fieldMeta)}
                      />
                    )}
                  </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "assignments" ? (
                <FormSection>
                  <form.Field name="itemAssignments">
                    {(field) => (
                      <SplitItemAssignmentsField
                        items={values.items}
                        friendIds={participantIds}
                        currentUserId={currentUserId}
                        currency={values.currency}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onChangeItems={(nextItems) => {
                          form.setFieldValue("items", nextItems);
                        }}
                        error={fieldError(
                          "itemAssignments",
                          field.state.meta.errors,
                        )}
                      />
                    )}
                  </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "percentage" ? (
                <FormSection>
                  <form.Field name="percentageSplits">
                    {(field) => (
                      <SplitPercentageField
                        friendIds={participantIds}
                        currentUserId={currentUserId}
                        value={field.state.value}
                        onChange={field.handleChange}
                        error={fieldError(
                          "percentageSplits",
                          field.state.meta.errors,
                        )}
                      />
                    )}
                  </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "custom" ? (
                <FormSection>
                  <form.Field name="customSplits">
                    {(field) => (
                      <SplitCustomAmountField
                        friendIds={participantIds}
                        currentUserId={currentUserId}
                        currency={values.currency}
                        totalCents={netTotalCents}
                        value={field.state.value}
                        onChange={field.handleChange}
                        error={fieldError(
                          "customSplits",
                          field.state.meta.errors,
                        )}
                      />
                    )}
                  </form.Field>
                </FormSection>
              ) : null}

              {currentStep.id === "review" ? (
                <>
                  <SplitReviewSummary
                    values={values}
                    friendNameById={friendNameById}
                    netTotalCents={netTotalCents}
                    currencyLabel={
                      currencyLabels[values.currency] ?? values.currency
                    }
                  />

                  <FormSection>
                    <form.Field name="receiptImage">
                      {(field) => (
                        <SplitReceiptImageField
                          label="Receipt Image"
                          value={field.state.value}
                          onChange={field.handleChange}
                          error={fieldError(
                            "receiptImage",
                            field.state.meta.errors,
                          )}
                          description="Optional. You can add this later if you do not have one yet."
                        />
                      )}
                    </form.Field>
                  </FormSection>
                </>
              ) : null}
            </Animated.View>

            <SplitStepFooter
              stepId={currentStep.id}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              isSubmitting={isSubmitting}
              hasActiveError={hasActiveError || Boolean(submitError)}
              shakeSignal={shakeSignal}
              onBack={handleBack}
              onNext={handleNext}
            />
          </View>
        );
      }}
    </form.Subscribe>
  );
}
