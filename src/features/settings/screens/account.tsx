import { Camera01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useForm } from "@tanstack/react-form";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";
import { z } from "zod";

import { usePaymentsList } from "@/api/hooks/use-payments";
import { useMe, useUpdateMe, useUploadAvatar } from "@/api/hooks/use-users";
import { publicImageUrl } from "@/api/users";
import GoBackButton from "@/components/GoBackButton";
import HapticPressable from "@/components/HapticButton";
import CollapsedLargeHeader from "@/components/layouts/CollapsedLargeHeader";
import { GlassControl } from "@/components/layouts/GlassControl";
import MeshBackground from "@/components/MeshBackground";
import {
  AuthField,
  AuthPasswordField,
} from "@/features/auth/components/auth-field";
import { getInitials } from "@/features/friends/lib/friendship-status";
import { useImagePicker, type PickedImage } from "@/hooks/use-image-picker";
import { authClient, useSession } from "@/lib/auth-client";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { getFieldError } from "@/utils/errors";

import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";
import { Typography } from "heroui-native/text";
import { useToast } from "heroui-native/toast";

import { NativeBottomSheet } from "@/components/native-bottom-sheet";
import { AccountSettingRow } from "../components/account-setting-row";
import { AccountSplitsGrid } from "../components/account-splits-grid";
import { SettingsSection } from "../components/settings-section";

const nameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(80, "Keep it under 80 characters."),
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

const AVATAR_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

const AVATAR_SIZE = 128;
const CARD_STYLE = { borderCurve: "continuous" as const };

type EditingField = "name" | "password" | null;

export default function Account() {
  const { data: session, refetch } = useSession();
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<EditingField>(null);
  const foreground = useCSSVariable("--color-foreground");
  const foregroundColor =
    typeof foreground === "string" ? foreground : "#111827";

  const meQuery = useMe();
  const paymentsQuery = usePaymentsList();
  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();
  const { isPicking, showPickerSheet } = useImagePicker({
    pickerOptions: AVATAR_PICKER_OPTIONS,
    cameraPermissionMessage:
      "Enable camera access in Settings to take a profile photo.",
    libraryPermissionMessage:
      "Enable photo library access in Settings to choose a profile photo.",
    errorTitle: "Couldn’t update photo",
    errorMessage: "Try again in a moment.",
    onError: () => hapticError(),
  });

  const user = meQuery.data ?? session?.user;
  const avatarUri = publicImageUrl(user?.image);
  const initials = getInitials(user?.name);
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
        setEditingField(null);
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
        setEditingField(null);
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

  const handleAvatarPicked = async (image: PickedImage) => {
    try {
      const updated = await uploadAvatar.mutateAsync({
        uri: image.uri,
        fileName: image.fileName ?? "avatar.jpg",
        mimeType: image.mimeType ?? "image/jpeg",
      });

      if (updated.image) {
        await authClient.updateUser({ image: updated.image });
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
    }
  };

  const openAvatarSheet = () => {
    setEditingField(null);
    showPickerSheet({
      title: "Profile photo",
      message: "Choose a new photo",
      onPick: handleAvatarPicked,
    });
  };

  const startEditingName = () => {
    passwordForm.reset();
    nameForm.setFieldValue("name", user?.name ?? "");
    setEditingField("name");
  };

  const cancelEditingName = () => {
    nameForm.setFieldValue("name", user?.name ?? "");
    setEditingField(null);
  };

  const startEditingPassword = () => {
    passwordForm.reset();
    setEditingField("password");
  };

  const cancelEditingPassword = () => {
    passwordForm.reset();
    setEditingField(null);
  };

  return (
    <View className="flex-1 bg-background">
      <MeshBackground />
      <CollapsedLargeHeader title="Account" leading={<GoBackButton />}>
        <View className="gap-6 px-4 pb-10 pt-2">
          <View className="items-center gap-3 pt-2">
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
              <HapticPressable
                onPress={openAvatarSheet}
                className="absolute bottom-0.5 right-0.5 size-9"
              >
                <GlassControl>
                  <View>
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
                </GlassControl>
              </HapticPressable>
            </View>

            <View className="items-center gap-1">
              <Typography type="h3" weight="bold">
                {user?.name?.trim() || "Your profile"}
              </Typography>
              <Typography type="body-sm" color="muted">
                {user?.email ?? ""}
              </Typography>
            </View>
          </View>

          <SettingsSection title="Basic info">
            <AccountSettingRow
              label="Name"
              value={user?.name}
              onPress={startEditingName}
            />
            <AccountSettingRow label="Email" value={user?.email} />
            <AccountSettingRow
              label="Password"
              value="••••••••"
              onPress={startEditingPassword}
            />
          </SettingsSection>

          <AccountSplitsGrid payments={payments} />
        </View>
      </CollapsedLargeHeader>

      <nameForm.Subscribe
        selector={(state) => [state.values.name, updateMe.isPending] as const}
      >
        {([name, isSubmitting]) => (
          <NativeBottomSheet
            isPresented={editingField === "name"}
            onDismiss={cancelEditingName}
            snapPoints={["half"]}
          >
            <Typography type="h4" weight="semibold">
              Update name
            </Typography>
            <Typography type="body-sm" color="muted">
              This is how friends will see you.
            </Typography>
            <View className="flex-1 gap-3">
              <nameForm.Field name="name">
                {(field) => (
                  <AuthField
                    label="Full name"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field.state.meta.errors)}
                    autoCapitalize="words"
                    autoFocus
                  />
                )}
              </nameForm.Field>
            </View>
            <Button
              variant="primary"
              className="w-full rounded-full"
              isDisabled={
                isSubmitting || !nameSchema.safeParse({ name }).success
              }
              onPress={() => void nameForm.handleSubmit()}
            >
              {isSubmitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Button.Label>Save</Button.Label>
              )}
            </Button>
          </NativeBottomSheet>
        )}
      </nameForm.Subscribe>

      <passwordForm.Subscribe
        selector={(state) => [state.isSubmitting, state.values] as const}
      >
        {([isSubmitting, values]) => (
          <NativeBottomSheet
            isPresented={editingField === "password"}
            onDismiss={cancelEditingPassword}
            snapPoints={["half"]}
          >
            <Typography type="h4" weight="semibold">
              Update password
            </Typography>
            <Typography type="body-sm" color="muted">
              Use a new password next time you sign in.
            </Typography>
            <View className="flex-1 gap-3">
              <passwordForm.Field name="currentPassword">
                {(field) => (
                  <AuthPasswordField
                    label="Current password"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field.state.meta.errors)}
                    autoFocus
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
                    error={getFieldError(field.state.meta.errors)}
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
                    error={getFieldError(field.state.meta.errors)}
                  />
                )}
              </passwordForm.Field>
            </View>
            <Button
              variant="primary"
              className="w-full rounded-full"
              isDisabled={
                isSubmitting || !passwordSchema.safeParse(values).success
              }
              onPress={() => void passwordForm.handleSubmit()}
            >
              {isSubmitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Button.Label>Update password</Button.Label>
              )}
            </Button>
          </NativeBottomSheet>
        )}
      </passwordForm.Subscribe>
    </View>
  );
}
