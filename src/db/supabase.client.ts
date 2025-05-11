import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(url, key);

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_WORKER_USER_ID = "083a3ea6-56d6-4531-9b72-4a0d643b6299";
export const DEFAULT_PATIENT_USER_ID = "6d926500-8d73-425a-b59c-dee61060fea9";

interface Locals {
  supabase: SupabaseClient;
  user: { user_id: string; role: "patient" | "worker" };
}

export const PATIENT_LOCALS = {
  supabase: supabaseClient,
  user: { user_id: DEFAULT_PATIENT_USER_ID, role: "patient" as const },
};

export const WORKER_LOCALS: Locals = {
  supabase: supabaseClient,
  user: { user_id: DEFAULT_WORKER_USER_ID, role: "worker" },
};
