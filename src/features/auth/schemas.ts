import { z } from "zod";

const MIN_PASSWORD = 8;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email.")
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(1, "Create a password.")
      .min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

export { MIN_PASSWORD };
