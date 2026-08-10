import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ActivityIndicator, View } from "react-native";
import { useCSSVariable } from "uniwind";

import {
  useScreenBackgroundColor,
  useStackContentStyle,
} from "@/hooks/use-navigation-theme";
import { useSession } from "@/lib/auth-client";

export default function AppLayout() {
  const { data: session, isPending } = useSession();
  const backgroundColor = useScreenBackgroundColor();
  const tabContentStyle = useStackContentStyle();
  const accentColor = useCSSVariable("--color-accent");
  const mutedColor = useCSSVariable("--color-muted");

  if (isPending) {
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

  return (
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
        name="explore"
        disableTransparentOnScrollEdge
        disableAutomaticContentInsets
        contentStyle={tabContentStyle}
      >
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "sparkles", selected: "sparkles" }}
          md={{ default: "explore", selected: "explore" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
