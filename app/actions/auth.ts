"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
