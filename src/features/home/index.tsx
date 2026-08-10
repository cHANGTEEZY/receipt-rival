import { router } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

import { usePaymentsList } from "@/api/hooks/use-payments";
import CollapsingLargeHeader from "@/components/layouts/CollapsingLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import ProfileButton from "@/components/ProfileButton";
import SplitFab from "@/components/SplitFab";
import { useSession } from "@/lib/auth-client";
import { hapticSelection } from "@/lib/haptics";

import { Typography } from "heroui-native/text";

import { SplitListEmpty } from "../split/components/SplitListEmpty";
import { SplitListItem } from "../split/components/SplitListItem";
import { SplitListSkeleton } from "../split/components/SplitListSkeleton";

export default function Home() {
  const { data: session } = useSession();
  const {
    data: payments,
    isLoading,
    isError,
    isFetching,
  } = usePaymentsList();

  const sortedPayments = useMemo(() => {
    const list = payments ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [payments]);

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsingLargeHeader
        title="Splits"
        trailing={
          <ProfileButton onPress={() => router.push("/(screens)/settings")} />
        }
      >
        <View className="gap-5 px-4 pb-8">
          <View className="gap-1">
            <Typography type="body" weight="semibold">
              Hey {session?.user.name?.split(" ")[0] ?? "there"}
            </Typography>
            <Typography type="body-sm" color="muted">
              Your recent receipt splits and balances.
            </Typography>
          </View>

          {isLoading ? <SplitListSkeleton /> : null}

          {!isLoading && isError ? (
            <Typography type="body-sm" className="text-danger">
              Couldn’t load your splits{isFetching ? " — retrying…" : "."}
            </Typography>
          ) : null}

          {!isLoading && !isError && sortedPayments.length === 0 ? (
            <SplitListEmpty />
          ) : null}

          {!isLoading && !isError && sortedPayments.length > 0 ? (
            <View className="gap-3">
              {sortedPayments.map((payment) => (
                <SplitListItem
                  key={payment.id}
                  payment={payment}
                  onPress={() => {
                    hapticSelection();
                    router.push(`/(screens)/split/${payment.id}`);
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
      </CollapsingLargeHeader>

      <SplitFab />
    </View>
  );
}
