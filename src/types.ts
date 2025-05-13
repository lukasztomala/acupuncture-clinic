// Auto-generated DTO (Data Transfer Object) and Command Model definitions
// These types map API inputs/outputs to database entities.

import type { Tables, Enums } from "./db/database.types";

/**
 * Auth
 */

// Signup request payload
export interface SignupCommand {
  email: string;
  password: string;
  first_name: Tables<"profiles">["first_name"];
  last_name: Tables<"profiles">["last_name"];
  phone: Tables<"profiles">["phone"];
  date_of_birth: Tables<"profiles">["date_of_birth"];
}

// Signup successful response
export interface SignupResponse {
  user_id: Tables<"profiles">["user_id"];
  email: string;
  first_name: Tables<"profiles">["first_name"];
  last_name: Tables<"profiles">["last_name"];
}

// Login request payload
export interface LoginCommand {
  email: string;
  password: string;
}

// Login successful response
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Password reset request payload
export interface PasswordResetCommand {
  email: string;
}

/**
 * Profile
 */

// User profile data transfer object
export type ProfileDTO = Tables<"profiles">;

// Profile update payload
export type ProfileUpdateCommand = Partial<Pick<ProfileDTO, "first_name" | "last_name" | "phone">>;

/**
 * Visits
 */

// Visit data transfer object
export type VisitDTO = Tables<"visits">;

// Query parameters for listing visits
export interface VisitListQueryParams {
  page?: number;
  limit?: number;
  sort_by?: "start_time";
  status?: Enums<"status_enum">;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Response for listing visits
export type VisitListResponse = PaginatedResponse<VisitDTO>;

// Query for next available visit
export interface NextAvailableQuery {
  page?: number;
  limit?: number;
}

// Response for next available visit
export interface NextAvailableDTO {
  start_time: VisitDTO["start_time"];
  end_time: VisitDTO["end_time"];
}

// Paginated response for next available visits
export type NextAvailableResponse = PaginatedResponse<NextAvailableDTO>;

// Payload for creating a visit
export interface VisitCreateCommand extends Pick<VisitDTO, "start_time" | "end_time"> {
  purpose: NonNullable<VisitDTO["purpose"]>;
}

// Payload for updating a visit
export type VisitUpdateCommand = Partial<Pick<VisitDTO, "start_time" | "end_time" | "purpose">>;

// ViewModel dla wizyt w tabeli
export interface VisitVM {
  id: string;
  formattedStart: string; // dd.MM.yyyy HH:mm
  formattedEnd: string;
  purpose: string;
}

/**
 * Work Schedule
 */

// Work schedule entry data transfer object
export type WorkScheduleDTO = Tables<"work_schedule">;

// List response type for work schedule entries
export type WorkScheduleListResponse = WorkScheduleDTO[];

// Payload for creating a work schedule entry
export type WorkScheduleCreateCommand = Omit<WorkScheduleDTO, "id">;

// Payload for updating a work schedule entry
export type WorkScheduleUpdateCommand = Partial<Omit<WorkScheduleDTO, "id">>;

/**
 * Time Blocks
 */

// Time block data transfer object
export type TimeBlockDTO = Tables<"time_blocks">;

// List response type for time blocks
export type TimeBlockListResponse = TimeBlockDTO[];

// Payload for creating a time block
export type TimeBlockCreateCommand = Omit<TimeBlockDTO, "id" | "created_at" | "created_by">;

// Payload for updating a time block
export type TimeBlockUpdateCommand = Partial<Pick<TimeBlockDTO, "start_time" | "end_time">>;

/**
 * Notes
 */

// Note data transfer object
export type NoteDTO = Tables<"notes">;

// List response type for notes
export type NoteListResponse = NoteDTO[];

// Payload for creating a note
export type NoteCreateCommand = Pick<NoteDTO, "content">;

// Payload for updating a note
export type NoteUpdateCommand = NoteCreateCommand;

/**
 * UI View Models for Work Schedule
 */
export interface ScheduleEntryVM {
  id: string;
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
}

export type CreateScheduleVM = Omit<ScheduleEntryVM, "id" | "dayLabel">;
export type UpdateScheduleVM = Partial<Omit<ScheduleEntryVM, "dayLabel">> & { id: string };
