import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useScreenBackgroundColor } from "@/hooks/use-navigation-theme";
import { useSession } from "@/lib/auth-client";
import { logger } from "@/utils/logger";

const SESSION_BOOT_TIMEOUT_MS = 3000;

export default function Index() {
  const { data: session, isPending } = useSession();
  const [bootTimedOut, setBootTimedOut] = useState(false);
  const backgroundColor = useScreenBackgroundColor();

  useEffect(() => {
    const timer = setTimeout(
      () => setBootTimedOut(true),
      SESSION_BOOT_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  logger.info("Checking session", session);

  const waitingForSession = isPending && !bootTimedOut;

  if (waitingForSession) {
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

  return <Redirect href="/(app)/home" />;
}
