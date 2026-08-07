import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { type TextInput, View } from "react-native";

import { authClient, useSession } from "@/lib/auth-client";
import { logger } from "@/utils/logger";
import { getFieldError } from "@/utils/errors";

import { Alert } from "heroui-native/alert";
import { Button } from "heroui-native/button";
import { Spinner } from "heroui-native/spinner";

import { signInSchema } from "../schemas";
import { AuthField, AuthPasswordField } from "./auth-field";
import { AuthFooter } from "./auth-footer";

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const { refetch } = useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const { error: signInError } = await authClient.signIn.email({
          email: value.email.trim(),
          password: value.password,
        });

        if (signInError) {
          setError(
            signInError.message ??
              "That email or password doesn't match. Try again.",
          );
          return;
        }

        await refetch();
        router.replace("/(app)/home");
      } catch (err) {
        logger.error("sign-in failed", err);
        setError(
          err instanceof Error
            ? "That email or password doesn't match. Try again."
            : "Sign in failed. Please try again.",
        );
      }
    },
  });

  return (
    <>
      <View className="gap-5">
        {error ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Couldn&apos;t sign in</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <form.Field name="email">
          {(field) => (
            <AuthField
              label="Email"
              placeholder="you@example.com"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <AuthPasswordField
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => form.handleSubmit()}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              variant="primary"
              size="md"
              className="mt-1"
              isDisabled={isSubmitting}
              onPress={() => form.handleSubmit()}
            >
              {isSubmitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Button.Label>Sign in</Button.Label>
              )}
            </Button>
          )}
        </form.Subscribe>
      </View>

      <AuthFooter
        prompt="New here?"
        actionLabel="Create an account"
        href="/sign-up"
      />
    </>
  );
}
