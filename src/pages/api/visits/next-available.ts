import { NextAvailableQuerySchema } from '../../../lib/schemas/visit.schema';
import VisitService from '../../../lib/services/visit.service';
import { PATIENT_LOCALS } from '../../../db/supabase.client';
import type { PostgrestError } from '@supabase/supabase-js';

// API route for computing next available visit slot
export async function GET(context: { request: Request }): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const rawQuery = { duration: url.searchParams.get('duration') };

  // Validate query params
  const parsed = NextAvailableQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return new Response(JSON.stringify({ errors: parsed.error.errors }), { status: 400 });
  }
  const { duration } = parsed.data;

  const locals = PATIENT_LOCALS;
  // Only patients can access
  if (locals.user.role !== 'patient') {
    return new Response(null, { status: 403 });
  }

  try {
    const slot = await VisitService.nextAvailable(locals.supabase, locals.user.user_id, duration);
    return new Response(JSON.stringify(slot), { status: 200 });
  } catch (error: unknown) {
    const err = error as PostgrestError;
    // Conflict unlikely here
    return new Response(JSON.stringify({ error: err.message ?? 'Internal Server Error' }), { status: 500 });
  }
} 