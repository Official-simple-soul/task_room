"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password."),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
});

const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(8, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

function authErrorMessage(message: string) {
  const value = message.toLowerCase();

  if (
    value.includes("already") ||
    value.includes("registered") ||
    value.includes("exists") ||
    value.includes("duplicate")
  ) {
    return "A user with this email already exists. Please sign in instead.";
  }

  if (value.includes("invalid login") || value.includes("invalid credentials")) {
    return "Invalid email or password.";
  }

  return message || "Something went wrong. Please try again.";
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your login details." };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: authErrorMessage(error.message) };
  redirect("/dashboard");
}

export async function register(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your registration details." };
  }

  const { full_name: fullName, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { error: authErrorMessage(error.message) };

  if (data.user && data.user.identities?.length === 0) {
    return { error: "A user with this email already exists. Please sign in instead." };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://127.0.0.1:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: authErrorMessage(error.message) };

  return {
    success:
      "If that email belongs to an account, a password reset link has been sent.",
  };
}

export async function resetPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your new password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: authErrorMessage(error.message) };

  return { success: "Your password has been updated. You can now sign in." };
}

export async function changePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your new password." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in to change your password." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: authErrorMessage(error.message) };

  return { success: "Your password has been changed." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
