import { router } from "expo-router";
import { View } from "react-native";

import { useUsers } from "@/api/hooks/use-users";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import ProfileButton from "@/components/ProfileButton";
import { authClient, useSession } from "@/lib/auth-client";
import { logger } from "@/utils/logger";

import { Alert } from "heroui-native/alert";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Surface } from "heroui-native/surface";
import { Typography } from "heroui-native/text";

export default function Home() {
  const { data: session } = useSession();
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErr,
    refetch,
  } = useUsers(undefined, { retry: false });

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (err) {
      logger.error("sign-out failed", err);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title="Home"
        trailing={
          <ProfileButton
            onPress={() => router.push("/(screens)/settings")}
          />
        }
      >
        <View className="gap-4 px-4">
          <Card>
            <Card.Header>
              <Typography type="h5" weight="semibold">
                Welcome
              </Typography>
            </Card.Header>
            <Card.Body className="gap-2">
              <Typography type="body" color="muted">
                You are signed in as{" "}
                <Typography type="body" weight="semibold">
                  {session?.user.name}
                </Typography>
              </Typography>
              <Typography type="body-xs" color="muted">
                {session?.user.email}
              </Typography>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Typography type="h5" weight="semibold">
                Users API
              </Typography>
            </Card.Header>
            <Card.Body className="gap-3">
              <Typography type="body-sm" color="muted">
                Calls GET /users with the Better Auth cookie from SecureStore.
              </Typography>

              {usersError ? (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      {usersErr?.message ??
                        "Failed to load users (is your API running?)"}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}

              {usersData?.users?.length ? (
                <View className="gap-2">
                  {usersData.users.map((user) => (
                    <Surface
                      key={user.id}
                      variant="secondary"
                      className="rounded-xl px-4 py-3"
                    >
                      <Typography type="body" weight="medium">
                        {user.name}
                      </Typography>
                      <Typography type="body-xs" color="muted">
                        {user.email}
                      </Typography>
                    </Surface>
                  ))}
                </View>
              ) : !usersLoading && !usersError ? (
                <Typography type="body-sm" color="muted">
                  No users returned.
                </Typography>
              ) : null}

              <Button
                variant="outline"
                size="md"
                onPress={() => void refetch()}
              >
                <Button.Label>Refresh users</Button.Label>
              </Button>
            </Card.Body>
          </Card>

          <Button variant="danger" size="lg" onPress={handleSignOut}>
            <Button.Label>Sign out</Button.Label>
          </Button>
        </View>
      </CollapsingLargeHeader>
    </View>
  );
}
