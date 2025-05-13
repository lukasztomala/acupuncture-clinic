import type { SupabaseClient } from "../../db/supabase.client";
import type { PostgrestError } from "@supabase/supabase-js";
import type { VisitCreateCommand } from "../schemas/visit.schema";
import type { Enums, Tables } from "../../db/database.types";
import type { VisitListQueryParams } from "../schemas/visit.schema";
import type { VisitDTO, PaginatedResponse, NextAvailableDTO } from "../../types";
import type { VisitUpdateCommand } from "../schemas/visit.schema";

/**
 * Service for Visit-related database operations
 */
const VisitService = {
  /**
   * Creates a new visit for a patient.
   */
  async create(supabase: SupabaseClient, userId: string, command: VisitCreateCommand): Promise<Tables<"visits">> {
    console.info(`[VisitService] Creating visit for ${userId} from ${command.start_time} to ${command.end_time}`);
    // Manual conflict check: overlapping visits
    const { data: conflicts, error: conflictError } = await supabase
      .from("visits")
      .select("id")
      .lt("start_time", command.end_time)
      .gt("end_time", command.start_time);
    if (conflictError) {
      throw conflictError;
    }
    if (conflicts && conflicts.length > 0) {
      const err = { code: "TIME_CONFLICT", message: "Time conflict" } as PostgrestError;
      throw err;
    }

    // Pobierz typ wizyty (first_time/follow_up) z funkcji RPC
    const { data: visitType, error: visitTypeError } = await supabase.rpc("get_visit_type", { p_patient_id: userId });
    if (visitTypeError) throw visitTypeError;

    const insertObj = {
      patient_id: userId,
      start_time: command.start_time,
      end_time: command.end_time,
      purpose: command.purpose,
      visit_type: visitType as Enums<"visit_type_enum">,
    };
    const { data, error } = await supabase.from("visits").insert(insertObj).select().single();

    if (error) {
      throw error;
    }
    return data;
  },
  /**
   * Lists visits with pagination, filtering by user or worker.
   */
  async list(
    supabase: SupabaseClient,
    userId: string,
    role: "patient" | "worker",
    params: VisitListQueryParams
  ): Promise<PaginatedResponse<VisitDTO>> {
    const { page, limit, sort_by, status } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase.from("visits").select("*", { count: "exact" }).range(from, to);
    if (role === "patient") query = query.eq("patient_id", userId);
    if (status) query = query.eq("status", status);
    if (sort_by) query = query.order(sort_by, { ascending: true });
    const { data, count, error } = await query;
    if (error) throw error;
    return {
      data: data as VisitDTO[],
      meta: {
        total: count ?? 0,
        page,
        limit,
      },
    };
  },
  /**
   * Retrieves a single visit by ID, enforcing RLS and ownership.
   */
  async getById(
    supabase: SupabaseClient,
    userId: string,
    role: "patient" | "worker",
    id: string
  ): Promise<Tables<"visits">> {
    const { data, error } = await supabase.from("visits").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) {
      const err = { code: "NOT_FOUND", message: "Visit not found" } as PostgrestError;
      throw err;
    }
    if (role === "patient" && data.patient_id !== userId) {
      const err = { code: "FORBIDDEN", message: "Forbidden" } as PostgrestError;
      throw err;
    }
    return data;
  },
  /**
   * Retrieves paginated next available appointment slots via RPC.
   */
  async nextAvailable(
    supabase: SupabaseClient,
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<NextAvailableDTO>> {
    const { data, error } = await supabase.rpc("get_next_available_slots", {
      p_patient_id: userId,
      p_page: page,
      p_limit: limit,
    });
    if (error) throw error;
    let slots: NextAvailableDTO[] = [];
    if (data) {
      slots = (data as { start_time: string; end_time: string }[]).map((slot) => ({
        start_time: new Date(slot.start_time).toISOString(),
        end_time: new Date(slot.end_time).toISOString(),
      }));
    }
    return {
      data: slots,
      meta: {
        total: slots.length,
        page,
        limit,
      },
    };
  },
  /**
   * Updates an existing visit.
   */
  async update(
    supabase: SupabaseClient,
    userId: string,
    role: "patient" | "worker",
    id: string,
    command: VisitUpdateCommand
  ): Promise<Tables<"visits">> {
    // Fetch existing
    const visit = await this.getById(supabase, userId, role, id);
    // Patient restrictions
    if (role === "patient") {
      const startOrig = new Date(visit.start_time).getTime();
      if (Date.now() + 24 * 60 * 60000 >= startOrig) {
        const err = { code: "FORBIDDEN", message: "Cannot modify within 24 hours" } as PostgrestError;
        throw err;
      }
    }
    // Conflict check if times changed
    if (command.start_time && command.end_time) {
      const { data: conflicts, error: conflictErr } = await supabase
        .from("visits")
        .select("id")
        .neq("id", id)
        .lt("start_time", command.end_time)
        .gt("end_time", command.start_time);
      if (conflictErr) throw conflictErr;
      if (conflicts && conflicts.length > 0) {
        const err = { code: "TIME_CONFLICT", message: "Time conflict" } as PostgrestError;
        throw err;
      }
    }
    // Perform update
    const { data, error } = await supabase.from("visits").update(command).eq("id", id).single();
    if (error) throw error;
    return data;
  },
  /**
   * Deletes (cancels) a visit.
   */
  async delete(supabase: SupabaseClient, userId: string, role: "patient" | "worker", id: string): Promise<void> {
    const visit = await this.getById(supabase, userId, role, id);
    if (role === "patient") {
      const startOrig = new Date(visit.start_time).getTime();
      if (Date.now() + 24 * 60 * 60000 >= startOrig) {
        const err = { code: "FORBIDDEN", message: "Cannot cancel within 24 hours" } as PostgrestError;
        throw err;
      }
    }
    const { error } = await supabase.from("visits").delete().eq("id", id);
    if (error) throw error;
  },
};

export default VisitService;
