import type { PostgrestError } from "@supabase/supabase-js";
import { VisitIdParamSchema, VisitUpdateSchema } from "../../../lib/schemas/visit.schema";
import VisitService from "../../../lib/services/visit.service";
import { PATIENT_LOCALS } from "../../../db/supabase.client";

// API route for retrieving a single visit by ID
export async function GET(context: { request: Request }): Promise<Response> {
  const { request } = context;
  // Extract ID from URL path
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  // Validate path param
  const parsed = VisitIdParamSchema.safeParse({ id });
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error.errors }), { status: 400 });
  }
  const { id: visitId } = parsed.data;

  // Use default patient context
  const locals = PATIENT_LOCALS;

  try {
    const visit = await VisitService.getById(locals.supabase, locals.user.user_id, locals.user.role, visitId);
    return new Response(JSON.stringify(visit), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    if (err.code === "NOT_FOUND") {
      return new Response(null, { status: 404 });
    }
    if (err.code === "FORBIDDEN") {
      return new Response(null, { status: 403 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}

// API route for updating a visit by ID
export async function PATCH(context: { request: Request }): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  // Validate ID
  const idParsed = VisitIdParamSchema.safeParse({ id });
  if (!idParsed.success) {
    return new Response(JSON.stringify({ errors: idParsed.error.errors }), { status: 400 });
  }
  const { id: visitId } = idParsed.data;

  // Parse and validate body
  let payload;
  try {
    const body = await request.json();
    const result = VisitUpdateSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), { status: 400 });
    }
    payload = result.data;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const locals = PATIENT_LOCALS;
  try {
    const updated = await VisitService.update(locals.supabase, locals.user.user_id, locals.user.role, visitId, payload);
    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    if (err.code === "NOT_FOUND") {
      return new Response(null, { status: 404 });
    }
    if (err.code === "FORBIDDEN") {
      return new Response(null, { status: 403 });
    }
    if (err.code === "TIME_CONFLICT") {
      return new Response(JSON.stringify({ error: err.message }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}

// API route for deleting a visit by ID
export async function DELETE(context: { request: Request }): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  // Validate ID
  const idParsed = VisitIdParamSchema.safeParse({ id });
  if (!idParsed.success) {
    return new Response(JSON.stringify({ errors: idParsed.error.errors }), { status: 400 });
  }
  const { id: visitId } = idParsed.data;

  const locals = PATIENT_LOCALS;
  try {
    await VisitService.delete(locals.supabase, locals.user.user_id, locals.user.role, visitId);
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    if (err.code === "NOT_FOUND") {
      return new Response(null, { status: 404 });
    }
    if (err.code === "FORBIDDEN") {
      return new Response(null, { status: 403 });
    }
    return new Response(JSON.stringify({ error: err.message ?? "Internal Server Error" }), { status: 500 });
  }
}
