import type { APIRoute } from "astro";
import type { AuthError } from "@supabase/supabase-js";
import { AuthPasswordResetSchema } from "../../../lib/schemas/auth.schema";
import AuthService from "../../../lib/services/auth.service";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

// Add JSDoc for password reset endpoint
/**
 * POST /api/auth/password-reset
 * Sends a password reset email to the user with the specified email address.
 *
 * Request body:
 *  - email (string): user's email address
 *
 * Responses:
 *  - 200: Password reset email sent successfully
 *  - 400: Invalid JSON or validation errors
 *  - 404: Email not found
 *  - 429: Too many requests (rate limit exceeded)
 *  - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  // Parse and validate JSON body
  let payload;
  try {
    const body = await request.json();
    const result = AuthPasswordResetSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // Execute password reset logic
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    await AuthService.passwordReset(supabase, payload);
    return new Response(JSON.stringify({ message: "Password reset email sent" }), { status: 200 });
  } catch (error: unknown) {
    const err = error as AuthError;
    if (err.status === 404) {
      return new Response(JSON.stringify({ error: "Email not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
