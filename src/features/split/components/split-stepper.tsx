import { Fragment, useEffect } from "react";
import { View } from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import { ACCENT_HEX } from "@/theme/accent";

import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";

const FOOTER_SPRING = {
  type: "spring" as const,
  damping: 18,
  stiffness: 280,
};

const BACK_BUTTON_SPRING = {
  type: "spring" as const,
  damping: 16,
  stiffness: 260,
};

type StepStatus = "done" | "active" | "upcoming";

function useThemeHex(variable: string, fallback: string): string {
  const value = useCSSVariable(variable);
  return typeof value === "string" ? value : fallback;
}

function StepNode({ status }: { status: StepStatus }) {
  const borderColor = useThemeHex("--color-border", "#e4e4e7");
  const accentColor = useThemeHex("--color-accent", ACCENT_HEX);
  const progress = useSharedValue(status === "upcoming" ? 0 : 1);

  useEffect(() => {
    progress.value = withTiming(status === "upcoming" ? 0 : 1, {
      duration: 260,
    });
  }, [status, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [borderColor, accentColor],
    ),
    transform: [{ scale: status === "active" ? 1.15 : 1 }],
  }));

  return (
    <Animated.View
      className="size-3 rounded-full"
      style={animatedStyle}
    />
  );
}

function StepLine({ filled }: { filled: boolean }) {
  const borderColor = useThemeHex("--color-border", "#e4e4e7");
  const accentColor = useThemeHex("--color-accent", ACCENT_HEX);
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, { duration: 260 });
  }, [filled, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [borderColor, accentColor],
    ),
  }));

  return (
    <Animated.View className="mx-1 h-0.5 flex-1 rounded-full" style={animatedStyle} />
  );
}

export type SplitStep = {
  id: string;
  title: string;
  description: string;
};

type SplitStepHeaderProps = {
  steps: SplitStep[];
  currentIndex: number;
};

export function SplitStepHeader({ steps, currentIndex }: SplitStepHeaderProps) {
  const currentStep = steps[currentIndex];

  return (
    <View className="gap-4">
      <View className="flex-row items-center">
        {steps.map((step, index) => {
          const status: StepStatus =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "active"
                : "upcoming";

          return (
            <Fragment key={step.id}>
              {index > 0 ? <StepLine filled={index <= currentIndex} /> : null}
              <StepNode status={status} />
            </Fragment>
          );
        })}
      </View>

      {currentStep ? (
        <View className="gap-1">
          <Typography type="h4" weight="semibold">
            {currentStep.title}
          </Typography>
          <Typography type="body-sm" color="muted">
            {currentStep.description}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

type SplitStepFooterProps = {
  stepId: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  hasActiveError: boolean;
  shakeSignal: number;
  onBack: () => void;
  onNext: () => void;
};

export function SplitStepFooter({
  stepId,
  isFirstStep,
  isLastStep,
  isSubmitting,
  hasActiveError,
  shakeSignal,
  onBack,
  onNext,
}: SplitStepFooterProps) {
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
    <EaseView
      key={stepId}
      style={{ flexDirection: "row", gap: 12 }}
      initialAnimate={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={FOOTER_SPRING}
    >
      {!isFirstStep ? (
        <EaseView
          style={{ flex: 1 }}
          initialAnimate={{ opacity: 0, translateX: -12, scale: 0.96 }}
          animate={{ opacity: 1, translateX: 0, scale: 1 }}
          transition={BACK_BUTTON_SPRING}
        >
          <Button
            variant="secondary"
            size="md"
            isDisabled={isSubmitting}
            onPress={onBack}
            className="w-full rounded-full"
          >
            <Button.Label>Back</Button.Label>
          </Button>
        </EaseView>
      ) : null}

      <Animated.View style={[{ flex: isFirstStep ? 1 : 2 }, shakeStyle]}>
        <EaseView
          initialAnimate={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={BACK_BUTTON_SPRING}
        >
          <Button
            variant={hasActiveError ? "danger" : "primary"}
            size="md"
            isDisabled={isSubmitting}
            onPress={onNext}
            className="w-full rounded-full"
          >
            {isSubmitting ? (
              <Spinner size="sm" color="white" />
            ) : (
              <Button.Label>{isLastStep ? "Create Split" : "Next"}</Button.Label>
            )}
          </Button>
        </EaseView>
      </Animated.View>
    </EaseView>
  );
}
