import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ActivityIndicator, View } from "react-native";
import { useCSSVariable } from "uniwind";

import { useSession } from "@/lib/auth-client";

export default function AppLayout() {
  const { data: session, isPending } = useSession();
  const backgroundColor = useCSSVariable("--color-background");
  const accentColor = useCSSVariable("--color-accent");
  const mutedColor = useCSSVariable("--color-muted");

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            typeof backgroundColor === "string" ? backgroundColor : undefined,
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
      >
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="explore"
        disableTransparentOnScrollEdge
        disableAutomaticContentInsets
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
