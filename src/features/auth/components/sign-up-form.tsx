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

import { MIN_PASSWORD, signUpSchema } from "../schemas";
import { AuthField, AuthPasswordField } from "./auth-field";
import { AuthFooter } from "./auth-footer";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const { refetch } = useSession();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const { error: signUpError } = await authClient.signUp.email({
          name: value.name.trim(),
          email: value.email.trim(),
          password: value.password,
        });

        if (signUpError) {
          setError(
            signUpError.message ??
              "We couldn't create your account. That email may already be in use.",
          );
          return;
        }

        await refetch();
        router.replace("/(app)/home");
      } catch (err) {
        logger.error("sign-up failed", err);
        setError(
          err instanceof Error
            ? "We couldn't create your account. That email may already be in use."
            : "Sign up failed. Please try again.",
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
              <Alert.Title>Couldn&apos;t create account</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}

        <form.Field name="name">
          {(field) => (
            <AuthField
              label="Name"
              placeholder="Your name"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <AuthField
              ref={emailRef}
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
              placeholder="Create a password"
              description={`At least ${MIN_PASSWORD} characters.`}
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <AuthPasswordField
              ref={confirmPasswordRef}
              label="Confirm password"
              placeholder="Confirm your password"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field.state.meta.errors)}
              autoComplete="new-password"
              textContentType="newPassword"
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
                <Button.Label>Create account</Button.Label>
              )}
            </Button>
          )}
        </form.Subscribe>
      </View>

      <AuthFooter
        prompt="Already have an account?"
        actionLabel="Sign in"
        href="/sign-in"
      />
    </>
  );
}
