import type { APIRoute } from "astro";
import type { PostgrestError } from "@supabase/supabase-js";
import { AuthSignupSchema } from "../../../lib/schemas/auth.schema";
import AuthService from "../../../lib/services/auth.service";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Parse and validate JSON body
  let payload;
  try {
    const body = await request.json();
    const result = AuthSignupSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // Execute signup logic
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const response = await AuthService.signup(supabase, payload);
    return new Response(JSON.stringify(response), { status: 201 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    if (err.code === "DUPLICATE_EMAIL") {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
