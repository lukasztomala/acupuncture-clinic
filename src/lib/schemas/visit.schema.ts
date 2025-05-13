import { z } from "zod";

// Schema for creating a visit
export const VisitCreateSchema = z
  .object({
    start_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
    end_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
    purpose: z.string().min(1, { message: "Purpose is required" }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      return start.getUTCMinutes() === 0 && start.getUTCSeconds() === 0;
    },
    {
      message: "start_time must be at the beginning of the hour",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      const diff = (end.getTime() - start.getTime()) / 60000;
      return diff === 60 || diff === 120;
    },
    {
      message: "Duration must be exactly 60 or 120 minutes",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      return start.getTime() >= Date.now() + 24 * 60 * 60000;
    },
    {
      message: "start_time must be at least 24 hours in the future",
      path: ["start_time"],
    }
  );

type VisitCreateCommand = z.infer<typeof VisitCreateSchema>;
export type { VisitCreateCommand };

// Schema for listing visits
export const VisitListQuerySchema = z.object({
  page: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().min(1).default(1)),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).max(100).default(20)
  ),
  sort_by: z.enum(["start_time"]).optional(),
  status: z.enum(["scheduled", "canceled", "completed"]).optional(),
});

type VisitListQueryParams = z.infer<typeof VisitListQuerySchema>;
export type { VisitListQueryParams };

// Schema for single visit ID parameter
export const VisitIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid visit ID" }),
});

type VisitIdParam = z.infer<typeof VisitIdParamSchema>;
export type { VisitIdParam };

// Schema for next available visit query
export const NextAvailableQuerySchema = z.object({
  page: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().min(1).default(1)),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).max(50).default(10)
  ),
});

type NextAvailableQuery = z.infer<typeof NextAvailableQuerySchema>;
export type { NextAvailableQuery };

// Schema for updating a visit
export const VisitUpdateSchema = z
  .object({
    start_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
    end_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
    purpose: z.string().min(1, { message: "Purpose is required" }),
  })
  .partial()
  .refine(
    (data) => {
      if (!data.start_time) return true;
      const start = new Date(data.start_time);
      return start.getUTCMinutes() === 0 && start.getUTCSeconds() === 0;
    },
    { message: "start_time must be at the beginning of the hour", path: ["start_time"] }
  )
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      const diff = (end.getTime() - start.getTime()) / 60000;
      return diff === 60 || diff === 120;
    },
    { message: "Duration must be exactly 60 or 120 minutes", path: ["end_time"] }
  )
  .refine(
    (data) => {
      if (!data.start_time) return true;
      const start = new Date(data.start_time);
      return start.getTime() >= Date.now() + 24 * 60 * 60000;
    },
    { message: "start_time must be at least 24 hours in the future", path: ["start_time"] }
  );

type VisitUpdateCommand = z.infer<typeof VisitUpdateSchema>;
export type { VisitUpdateCommand };
