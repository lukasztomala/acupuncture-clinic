import type { SupabaseClient } from "../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import type { AuthSignupInput } from "../schemas/auth.schema";
import type { SignupResponse } from "../../types";
import { AuthSignupSchema } from "../schemas/auth.schema";
import type { AuthLoginInput } from "../schemas/auth.schema";
import { AuthLoginSchema } from "../schemas/auth.schema";
import type { LoginResponse } from "../../types";
import type { AuthPasswordResetInput } from "../schemas/auth.schema";
import { AuthPasswordResetSchema } from "../schemas/auth.schema";

/**
 * Service for authentication-related operations
 */
const AuthService = {
  /**
   * Registers a new patient user and creates a profile
   */
  async signup(supabase: SupabaseClient, command: AuthSignupInput): Promise<SignupResponse> {
    console.info(`[AuthService] Signing up ${command.email}`);
    // Validate input
    const validated = AuthSignupSchema.parse(command);

    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
    });
    if (authError) {
      if (authError.status === 400) {
        const err = { code: "DUPLICATE_EMAIL", message: "Email already exists" } as PostgrestError;
        throw err;
      }
      throw authError;
    }
    if (!data.user) {
      throw new Error("Signup failed, no user returned");
    }

    // Insert profile record
    const profileInsert = {
      user_id: data.user.id,
      first_name: validated.first_name,
      last_name: validated.last_name,
      phone: validated.phone,
      date_of_birth: validated.date_of_birth,
      role: "role_patient" as const,
    };
    const { error: profileError } = await supabase.from("profiles").insert(profileInsert).select().single();
    if (profileError) {
      // Handle unique constraint violation on profiles (duplicate user_id)
      if (profileError.code === "23505") {
        const err = { code: "DUPLICATE_EMAIL", message: "Email already exists" } as PostgrestError;
        throw err;
      }
      throw profileError;
    }

    return {
      user_id: data.user.id,
      email: validated.email,
      first_name: validated.first_name,
      last_name: validated.last_name,
    };
  },
  async login(supabase: SupabaseClient, command: AuthLoginInput): Promise<LoginResponse> {
    console.info(`[AuthService] Logging in ${command.email}`);
    // Validate input
    const validated = AuthLoginSchema.parse(command);
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });
    if (error) {
      throw error;
    }
    if (!data.session) {
      throw new Error("Login failed, no session returned");
    }
    // Return tokens
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  },
  async passwordReset(supabase: SupabaseClient, command: AuthPasswordResetInput): Promise<void> {
    console.info(`[AuthService] Resetting password for ${command.email}`);
    // Validate input
    const validated = AuthPasswordResetSchema.parse(command);

    // Send reset password email
    const { error } = await supabase.auth.resetPasswordForEmail(validated.email);
    if (error) {
      throw error;
    }
  },
};

export default AuthService;
