import {
  Mail01Icon,
  Notification03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { router } from "expo-router";
import { View } from "react-native";

import { Fab } from "@/components/fab";
import { runHaptic } from "@/components/HapticButton";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import ProfileButton from "@/components/ProfileButton";
import { useSession } from "@/lib/auth-client";

import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";

export default function Home() {
  const { data: session } = useSession();

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title="Habibi Welcome"
        trailing={
          <ProfileButton onPress={() => router.push("/(screens)/settings")} />
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
        </View>
      </CollapsingLargeHeader>

      <Fab position="bottom-right">
        <Fab.Item
          icon={StarIcon}
          label="Star"
          onPress={() => runHaptic({ type: "selection" })}
        />
        <Fab.Item
          icon={Mail01Icon}
          label="Email"
          onPress={() => runHaptic({ type: "selection" })}
        />
        <Fab.Item
          icon={Notification03Icon}
          label="Remind"
          onPress={() => runHaptic({ type: "selection" })}
        />
      </Fab>
    </View>
  );
}
