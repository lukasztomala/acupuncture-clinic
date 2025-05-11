// src/pages/api/visits.ts
import { VisitCreateSchema, VisitListQuerySchema } from "../../lib/schemas/visit.schema";
import VisitService from "../../lib/services/visit.service";
import { PATIENT_LOCALS, WORKER_LOCALS } from "../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";

// API route for creating visits
export async function POST(context: { request: Request }): Promise<Response> {
  const { request } = context;
  const locals = PATIENT_LOCALS;
  // Parse and validate request body
  let payload;
  try {
    const body = await request.json();
    const result = VisitCreateSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // Authorization: only patients can schedule visits
  const { user, supabase } = locals;
  if (user.role !== "patient") {
    return new Response(null, { status: 403 });
  }

  try {
    const visit = await VisitService.create(supabase, user.user_id, payload);
    return new Response(JSON.stringify(visit), { status: 201 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    // Manual conflict
    if (err.code === "TIME_CONFLICT") {
      return new Response(JSON.stringify({ error: err.message }), { status: 409 });
    }
    // DB unique exclusion conflict
    if (err.code === "23505") {
      return new Response(JSON.stringify({ error: "Time conflict" }), { status: 409 });
    }
    // Fallback
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}

// API route for listing visits
export async function GET(context: { request: Request }): Promise<Response> {
  const { request } = context;
  const locals = WORKER_LOCALS;
  const url = new URL(request.url);
  const rawQuery = {
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    sort_by: url.searchParams.get("sort_by"),
    status: url.searchParams.get("status"),
  };
  const parsed = VisitListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error.errors }), { status: 400 });
  }
  const params = parsed.data;
  try {
    const result = await VisitService.list(locals.supabase, locals.user.user_id, locals.user.role, params);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}
