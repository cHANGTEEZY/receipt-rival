import { Redirect, useFocusEffect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { SwipeMenuShell } from "@/features/swipe-menu";
import {
  useScreenBackgroundColor,
  useStackContentStyle,
} from "@/hooks/use-navigation-theme";
import { useSession } from "@/lib/auth-client";
import {
  isOnboardingComplete,
  type OnboardingStatus,
} from "@/lib/onboarding";

export default function AppLayout() {
  const { data: session, isPending } = useSession();
  const backgroundColor = useScreenBackgroundColor();
  const tabContentStyle = useStackContentStyle();
  const accentColor = useCSSVariable("--color-accent");
  const mutedColor = useCSSVariable("--color-muted");

  // First-launch onboarding gate: re-checked on mount and every refocus so
  // completing the carousel (which flips the persisted flag) lets the app in.
  const [onboarding, setOnboarding] = useState<OnboardingStatus>({
    checked: false,
    complete: true,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void isOnboardingComplete().then((complete) => {
        if (active) setOnboarding({ checked: true, complete });
      });

      return () => {
        active = false;
      };
    }, []),
  );

  if (isPending || !onboarding.checked) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  if (!onboarding.complete) {
    return <Redirect href="/(screens)/onboarding" />;
  }

  return (
    <SwipeMenuShell>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        disableTransparentOnScrollEdge
        backgroundColor={backgroundColor}
        unstable_nativeProps={
          backgroundColor
            ? { nativeContainerStyle: { backgroundColor } }
            : undefined
        }
        tintColor={typeof accentColor === "string" ? accentColor : undefined}
        iconColor={
          typeof mutedColor === "string"
            ? { default: mutedColor, selected: accentColor as string }
            : undefined
        }
        labelStyle={
          typeof mutedColor === "string"
            ? {
                default: { color: mutedColor },
                selected: {
                  color:
                    typeof accentColor === "string" ? accentColor : mutedColor,
                },
              }
            : undefined
        }
      >
        <NativeTabs.Trigger
          name="home"
          disableTransparentOnScrollEdge
          disableAutomaticContentInsets
          contentStyle={tabContentStyle}
        >
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md={{ default: "home", selected: "home" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="friends"
          disableTransparentOnScrollEdge
          disableAutomaticContentInsets
          contentStyle={tabContentStyle}
        >
          <NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
            md={{ default: "person", selected: "person_2" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="splits"
          disableTransparentOnScrollEdge
          disableAutomaticContentInsets
          contentStyle={tabContentStyle}
        >
          <NativeTabs.Trigger.Label>Splits</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "doc.text", selected: "doc.text.fill" }}
            md={{ default: "receipt", selected: "receipt" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="ranks"
          disableTransparentOnScrollEdge
          disableAutomaticContentInsets
          contentStyle={tabContentStyle}
        >
          <NativeTabs.Trigger.Label>Ranks</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "trophy", selected: "trophy.fill" }}
            md={{ default: "emoji_events", selected: "emoji_events" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SwipeMenuShell>
  );
}
