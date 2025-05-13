export const prerender = false;

import type { APIRoute } from "astro";
import { NextAvailableQuerySchema } from "../../../lib/schemas/visit.schema";
import VisitService from "../../../lib/services/visit.service";

// GET /api/visits/next-available
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const rawQuery = {
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
  };

  // Validate query params
  const parsed = NextAvailableQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { page, limit } = parsed.data;

  const { user, supabase } = locals;
  if (!user) {
    return new Response(null, { status: 401 });
  }
  if (user.role !== "patient") {
    return new Response(null, { status: 403 });
  }

  try {
    const result = await VisitService.nextAvailable(supabase, user.id, page, limit);
    if (result.data.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/visits/next-available] Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
