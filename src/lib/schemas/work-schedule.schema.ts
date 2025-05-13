import { z } from "zod";

// Base schema for work schedule entries
const WorkScheduleBaseSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6, { message: "day_of_week must be between 0 and 6" }),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "start_time must be in HH:MM format" }),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "end_time must be in HH:MM format" }),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "end_time must be after start_time",
    path: ["end_time"],
  });

// Schema for creating a work schedule entry
export const WorkScheduleCreateSchema = WorkScheduleBaseSchema;

type WorkScheduleCreateCommand = z.infer<typeof WorkScheduleCreateSchema>;
export type { WorkScheduleCreateCommand };

// Schema for updating a work schedule entry (all fields optional)
export const WorkScheduleUpdateSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6).optional(),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: "start_time must be in HH:MM format" })
      .optional(),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: "end_time must be in HH:MM format" })
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      return data.start_time < data.end_time;
    },
    { message: "end_time must be after start_time", path: ["end_time"] }
  );

type WorkScheduleUpdateCommand = z.infer<typeof WorkScheduleUpdateSchema>;
export type { WorkScheduleUpdateCommand };

// Schema for path parameter ID
export const WorkScheduleIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid work schedule ID" }),
});

type WorkScheduleIdParam = z.infer<typeof WorkScheduleIdParamSchema>;
export type { WorkScheduleIdParam };
