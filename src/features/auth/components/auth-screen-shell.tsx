import { type ReactNode } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import KeyboardAvoidingWrapper from "@/components/layouts/KeyboardAvoidingWrapper";
import { useAppColorScheme } from "@/hooks/use-app-color-scheme";

import { Typography } from "heroui-native/text";

import AuthMeshBackground from "./auth-mesh-background";

const LIGHT_BG = "#F7F7F8";
const DARK_BG = "#1E1E20";
const LIGHT_SHEET = "#FFFFFF";
const DARK_SHEET = "#2A2A2D";

type AuthScreenShellProps = {
  title: string;
  titleLine2: string;
  description: string;
  heroRatio?: number;
  minHeroHeight?: number;
  children: ReactNode;
};

export function AuthScreenShell({
  title,
  titleLine2,
  description,
  heroRatio = 0.3,
  minHeroHeight = 180,
  children,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const scheme = useAppColorScheme();

  const background = scheme === "dark" ? DARK_BG : LIGHT_BG;
  const sheetBackground = scheme === "dark" ? DARK_SHEET : LIGHT_SHEET;
  const heroHeight = Math.max(height * heroRatio, minHeroHeight) + insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <AuthMeshBackground />

      <KeyboardAvoidingWrapper keyboardVerticalOffset={0}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: heroHeight,
              paddingTop: insets.top + 16,
              paddingHorizontal: 28,
              paddingBottom: 28,
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <View
              accessibilityRole="header"
              accessibilityLabel={`${title} ${titleLine2}`}
            >
              <Typography
                type="h1"
                weight="semibold"
                className="text-foreground"
                style={{
                  fontSize: 40,
                  lineHeight: 44,
                  letterSpacing: -0.8,
                }}
              >
                {title}
              </Typography>
              <Typography
                type="h1"
                weight="semibold"
                className="text-foreground"
                style={{
                  fontSize: 40,
                  lineHeight: 44,
                  letterSpacing: -0.8,
                }}
              >
                {titleLine2}
              </Typography>
            </View>
            {description ? (
              <Typography
                type="body-sm"
                className="text-muted mt-2"
                style={{ maxWidth: 280 }}
              >
                {description}
              </Typography>
            ) : null}
          </View>

          <View
            className="flex-1"
            style={{
              backgroundColor: sheetBackground,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              borderCurve: "continuous",
              paddingBottom: Math.max(insets.bottom, 12),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: scheme === "dark" ? 0.35 : 0.08,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <View className="items-center pt-3 pb-2">
              <View
                className="h-1 w-10 rounded-full bg-muted/40"
                accessible={false}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 8,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
}

export default AuthScreenShell;
