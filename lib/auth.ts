import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Profile, Role } from "./types";

export async function requireProfile(role?: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, payment_bank_name, payment_account_number, payment_account_name",
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (role && profile.role !== role) redirect("/dashboard");

  return { supabase, profile: profile as Profile, user };
}
