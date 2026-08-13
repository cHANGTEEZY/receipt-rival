import {
  AddInvoiceIcon,
  Camera01Icon,
  Money01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useForm } from "@tanstack/react-form";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Alert, Pressable, useWindowDimensions, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { z } from "zod";

import { useFriendsList } from "@/api/hooks/use-friends";
import { usePaymentsList, useSplitsOwedByMe } from "@/api/hooks/use-payments";
import { useMe, useUpdateMe, useUploadAvatar } from "@/api/hooks/use-users";
import { publicImageUrl } from "@/api/users";
import GoBackButton from "@/components/GoBackButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import MeshBackground from "@/components/MeshBackground";
import { AuthField, AuthPasswordField } from "@/features/auth/components/auth-field";
import {
  getAcceptedFriends,
  getInitials,
} from "@/features/friends/lib/friendship-status";
import { authClient, useSession } from "@/lib/auth-client";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { formatMoney } from "@/utils/money";

import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";
import { useToast } from "heroui-native/toast";

import { SettingsIconTile } from "../components/settings-icon-tile";

const nameSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Keep it under 80 characters."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

const AVATAR_SIZE = 128;
const CARD_STYLE = { borderCurve: "continuous" as const };

type IconData = ComponentProps<typeof HugeiconsIcon>["icon"];

function StatCard({
  icon,
  iconBackground,
  label,
  value,
  onPress,
}: {
  icon: IconData;
  iconBackground: string;
  label: string;
  value: number | string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-3xl bg-surface px-4 py-4"
      style={CARD_STYLE}
    >
      <SettingsIconTile icon={icon} backgroundColor={iconBackground} size={36} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Typography type="h4" weight="bold">
          {value}
        </Typography>
        <Typography type="body-xs" color="muted">
          {label}
        </Typography>
      </View>
    </Pressable>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-3xl bg-surface p-4" style={CARD_STYLE}>
      <Typography type="h5" weight="semibold">
        {title}
      </Typography>
      {children}
    </View>
  );
}

export default function Account() {
  const { data: session, refetch } = useSession();
  const { toast } = useToast();
  const { width } = useWindowDimensions();
  const foreground = useCSSVariable("--color-foreground");
  const foregroundColor =
    typeof foreground === "string" ? foreground : "#111827";
  const tileSize = Math.floor((width - 32 - 24 - 8) / 3);

  const meQuery = useMe();
  const friendsQuery = useFriendsList();
  const paymentsQuery = usePaymentsList();
  const owedQuery = useSplitsOwedByMe();
  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();

  const user = meQuery.data ?? session?.user;
  const avatarUri = publicImageUrl(user?.image);
  const [isPicking, setIsPicking] = useState(false);

  const friendsCount = useMemo(
    () => getAcceptedFriends(friendsQuery.data?.data ?? []).length,
    [friendsQuery.data],
  );
  const splitsCount = paymentsQuery.data?.length ?? 0;
  const owedCount = owedQuery.data?.length ?? 0;
  const payments = paymentsQuery.data ?? [];

  const nameForm = useForm({
    defaultValues: { name: user?.name ?? "" },
    validators: { onSubmit: nameSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateMe.mutateAsync(value.name.trim());
        await authClient.updateUser({ name: value.name.trim() });
        await refetch();
        hapticSuccess();
        toast.show({
          variant: "success",
          label: "Name updated",
          description: "Your display name is saved.",
        });
      } catch (error) {
        hapticError();
        toast.show({
          variant: "danger",
          label: "Couldn’t update name",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      }
    },
  });

  useEffect(() => {
    if (user?.name) {
      nameForm.setFieldValue("name", user.name);
    }
  }, [nameForm, user?.name]);

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          throw new Error(error.message ?? "Couldn’t change password.");
        }
        passwordForm.reset();
        hapticSuccess();
        toast.show({
          variant: "success",
          label: "Password updated",
          description: "Use your new password next time you sign in.",
        });
      } catch (error) {
        hapticError();
        toast.show({
          variant: "danger",
          label: "Couldn’t change password",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      }
    },
  });

  const pickAvatar = async (source: "library" | "camera") => {
    setIsPicking(true);
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Camera access needed",
            "Enable camera access in Settings to take a profile photo.",
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);
        if (result.canceled || !result.assets[0]) return;
        const updated = await uploadAvatar.mutateAsync({
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName ?? "avatar.jpg",
          mimeType: result.assets[0].mimeType ?? "image/jpeg",
        });
        if (updated.image) {
          await authClient.updateUser({ image: updated.image });
        }
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Photos access needed",
            "Enable photo library access in Settings to choose a profile photo.",
          );
          return;
        }
        const result =
          await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
        if (result.canceled || !result.assets[0]) return;
        const updated = await uploadAvatar.mutateAsync({
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName ?? "avatar.jpg",
          mimeType: result.assets[0].mimeType ?? "image/jpeg",
        });
        if (updated.image) {
          await authClient.updateUser({ image: updated.image });
        }
      }
      await refetch();
      hapticSuccess();
      toast.show({
        variant: "success",
        label: "Photo updated",
        description: "Your new profile photo is live.",
      });
    } catch (error) {
      hapticError();
      toast.show({
        variant: "danger",
        label: "Couldn’t update photo",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsPicking(false);
    }
  };

  const openAvatarSheet = () => {
    Alert.alert("Profile photo", "Choose a new photo", [
      { text: "Take photo", onPress: () => void pickAvatar("camera") },
      { text: "Choose from library", onPress: () => void pickAvatar("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const initials = getInitials(user?.name);

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsedLargeHeader title="Account" leading={<GoBackButton />}>
        <View className="gap-5 px-4 pb-10 pt-2">
          <View className="items-center gap-3 pt-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={openAvatarSheet}
              disabled={isPicking || uploadAvatar.isPending}
            >
              <View className="relative">
                <View
                  className="items-center justify-center overflow-hidden rounded-full bg-accent"
                  style={[
                    CARD_STYLE,
                    { width: AVATAR_SIZE, height: AVATAR_SIZE },
                  ]}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                      contentFit="cover"
                    />
                  ) : (
                    <Typography
                      type="h3"
                      weight="bold"
                      className="text-accent-foreground"
                    >
                      {initials}
                    </Typography>
                  )}
                </View>
                <View className="absolute bottom-0.5 right-0.5 size-9 items-center justify-center rounded-full border border-border bg-surface">
                  {isPicking || uploadAvatar.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <HugeiconsIcon
                      icon={Camera01Icon}
                      size={16}
                      color={foregroundColor}
                      strokeWidth={1.75}
                    />
                  )}
                </View>
              </View>
            </Pressable>

            <View className="items-center gap-1">
              <Typography type="h3" weight="bold">
                {user?.name?.trim() || "Your profile"}
              </Typography>
              <Typography type="body-sm" color="muted">
                {user?.email ?? ""}
              </Typography>
            </View>
          </View>

          <View className="gap-2">
            <StatCard
              icon={AddInvoiceIcon}
              iconBackground="#3B82F6"
              value={splitsCount}
              label="Splits"
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <StatCard
                  icon={UserGroupIcon}
                  iconBackground="#0EA5E9"
                  value={friendsCount}
                  label="Friends"
                  onPress={() => router.push("/(screens)/add-or-find-friends")}
                />
              </View>
              <View className="flex-1">
                <StatCard
                  icon={Money01Icon}
                  iconBackground="#F59E0B"
                  value={owedCount}
                  label="Owed"
                />
              </View>
            </View>
          </View>

          <SectionCard title="Edit profile">
            <nameForm.Field name="name">
              {(field) => (
                <AuthField
                  label="Full name"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] as string | undefined}
                  autoCapitalize="words"
                />
              )}
            </nameForm.Field>
            <Button
              variant="primary"
              isDisabled={updateMe.isPending}
              onPress={() => void nameForm.handleSubmit()}
            >
              {updateMe.isPending ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Button.Label>Save name</Button.Label>
              )}
            </Button>
          </SectionCard>

          <SectionCard title="Password">
            <passwordForm.Field name="currentPassword">
              {(field) => (
                <AuthPasswordField
                  label="Current password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] as string | undefined}
                />
              )}
            </passwordForm.Field>
            <passwordForm.Field name="newPassword">
              {(field) => (
                <AuthPasswordField
                  label="New password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] as string | undefined}
                />
              )}
            </passwordForm.Field>
            <passwordForm.Field name="confirmPassword">
              {(field) => (
                <AuthPasswordField
                  label="Confirm new password"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0] as string | undefined}
                />
              )}
            </passwordForm.Field>
            <Button
              variant="secondary"
              onPress={() => void passwordForm.handleSubmit()}
            >
              <Button.Label>Update password</Button.Label>
            </Button>
          </SectionCard>

          <SectionCard title="Splits">
            {payments.length === 0 ? (
              <Typography type="body-sm" color="muted">
                No splits yet. Create one and it’ll show up here.
              </Typography>
            ) : (
              <View className="flex-row flex-wrap gap-1">
                {payments.map((payment) => (
                  <Pressable
                    key={payment.id}
                    accessibilityRole="button"
                    accessibilityLabel={payment.title}
                    onPress={() =>
                      router.push(`/(screens)/split/${payment.id}`)
                    }
                    style={{ width: tileSize, height: tileSize }}
                    className="overflow-hidden rounded-xl bg-surface-secondary"
                  >
                    {payment.receiptImageUrl ? (
                      <Image
                        source={{ uri: payment.receiptImageUrl }}
                        style={{ width: tileSize, height: tileSize }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center px-2">
                        <Typography
                          type="body-xs"
                          weight="semibold"
                          numberOfLines={2}
                          className="text-center"
                        >
                          {payment.title}
                        </Typography>
                        <Typography type="body-xs" color="muted">
                          {formatMoney(
                            payment.totalAmountCents,
                            payment.currency,
                          )}
                        </Typography>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </SectionCard>
        </View>
      </CollapsedLargeHeader>
    </View>
  );
}
