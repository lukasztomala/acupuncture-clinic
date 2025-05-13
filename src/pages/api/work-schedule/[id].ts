import type { PostgrestError } from "@supabase/supabase-js";
import { WorkScheduleIdParamSchema, WorkScheduleUpdateSchema } from "../../../lib/schemas/work-schedule.schema";
import WorkScheduleService from "../../../lib/services/work-schedule.service";
import type { APIRoute } from "astro";

// API route for updating a work schedule entry
export const PATCH: APIRoute = async ({ request, locals }) => {
  // Extract ID from URL
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  // Validate ID
  const idParsed = WorkScheduleIdParamSchema.safeParse({ id });
  if (!idParsed.success) {
    return new Response(JSON.stringify({ errors: idParsed.error.errors }), { status: 400 });
  }
  const { id: entryId } = idParsed.data;

  // Parse and validate body
  let payload;
  try {
    const body = await request.json();
    const result = WorkScheduleUpdateSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // Authorization: only workers
  const { supabase, user } = locals;
  if (user.role !== "worker") {
    return new Response(null, { status: 403 });
  }

  try {
    const updated = await WorkScheduleService.update(supabase, entryId, payload);
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    // If entry not found or conflict
    if (err.code === "23503" || err.code === "NOT_FOUND") {
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
};

// API route for deleting a work schedule entry
export const DELETE: APIRoute = async ({ request, locals }) => {
  // Extract ID
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  // Validate ID
  const idParsed = WorkScheduleIdParamSchema.safeParse({ id });
  if (!idParsed.success) {
    return new Response(JSON.stringify({ errors: idParsed.error.errors }), { status: 400 });
  }
  const { id: entryId } = idParsed.data;

  // Authorization: only workers
  const { supabase, user } = locals;
  if (user.role !== "worker") {
    return new Response(null, { status: 403 });
  }

  try {
    await WorkScheduleService.delete(supabase, entryId);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    if (err.code === "23503" || err.code === "NOT_FOUND") {
      return new Response(null, { status: 404 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}
