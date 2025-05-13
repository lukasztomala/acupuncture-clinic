import type { PostgrestError } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { WorkScheduleCreateSchema } from "../../lib/schemas/work-schedule.schema";
import WorkScheduleService from "../../lib/services/work-schedule.service";

// GET /work-schedule
export const GET: APIRoute = async ({ locals }) => {
  if (locals.user.role !== "worker") {
    return new Response(null, { status: 403 });
  }
  try {
    const data = await WorkScheduleService.list(locals.supabase);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
};

// POST /work-schedule
export const POST: APIRoute = async ({ request, locals }) => {
  const { user, supabase } = locals;
  if (user.role !== "worker") {
    return new Response(null, { status: 403 });
  }
  let payload;
  try {
    const body = await request.json();
    const result = WorkScheduleCreateSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }
  try {
    const entry = await WorkScheduleService.create(supabase, payload);
    return new Response(JSON.stringify(entry), { status: 201 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    // Unique constraint error
    if (err.code === "23505") {
      return new Response(JSON.stringify({ error: "Duplicate schedule entry" }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
};
