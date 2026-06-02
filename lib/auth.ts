import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./supabase/server";
import type { Profile, Role } from "./types";

export const requireProfile = cache(async function requireProfile(role?: Role) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, payment_bank_name, payment_account_number, payment_account_name",
    )
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");
  if (role && profile.role !== role) redirect("/dashboard");

  return { supabase, profile: profile as Profile, user: session.user };
});
