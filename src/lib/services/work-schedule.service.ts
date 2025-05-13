import type { SupabaseClient } from "../../db/supabase.client";
import type { Tables } from "../../db/database.types";
import type { WorkScheduleCreateCommand, WorkScheduleUpdateCommand } from "../schemas/work-schedule.schema";

/** Service for Work Schedule operations */
const WorkScheduleService = {
  /** List all schedule entries for worker */
  async list(supabase: SupabaseClient): Promise<Tables<"work_schedule">[]> {
    const { data, error } = await supabase.from("work_schedule").select("*");
    if (error) throw error;
    return data;
  },

  /** Create a new schedule entry */
  async create(supabase: SupabaseClient, command: WorkScheduleCreateCommand): Promise<Tables<"work_schedule">> {
    const insertObj = { ...command };
    const { data, error } = await supabase.from("work_schedule").insert(insertObj).select().single();
    if (error) throw error;
    return data;
  },

  /** Update existing schedule entry */
  async update(
    supabase: SupabaseClient,
    id: string,
    command: WorkScheduleUpdateCommand
  ): Promise<Tables<"work_schedule">> {
    const { data, error } = await supabase.from("work_schedule").update(command).eq("id", id).single();
    if (error) throw error;
    return data;
  },

  /** Delete schedule entry */
  async delete(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase.from("work_schedule").delete().eq("id", id);
    if (error) throw error;
  },
};

export default WorkScheduleService;
