import type { APIRoute } from "astro";
import type { AuthError } from "@supabase/supabase-js";
import { AuthLoginSchema } from "../../../lib/schemas/auth.schema";
import AuthService from "../../../lib/services/auth.service";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Parse and validate JSON body
  let payload;
  try {
    const body = await request.json();
    const result = AuthLoginSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // Execute login logic
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const response = await AuthService.login(supabase, payload);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: unknown) {
    const err = error as AuthError;
    if (err.status === 403) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
