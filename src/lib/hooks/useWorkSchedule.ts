import { useState, useEffect } from "react";
import type { WorkScheduleDTO, WorkScheduleCreateCommand, WorkScheduleUpdateCommand } from "../../types";

const fetchWorkSchedules = async (): Promise<WorkScheduleDTO[]> => {
  const res = await fetch("/api/work-schedule");
  if (!res.ok) throw new Error("Błąd podczas pobierania harmonogramu");
  return res.json();
};

const createWorkSchedule = async (data: WorkScheduleCreateCommand): Promise<WorkScheduleDTO> => {
  const res = await fetch("/api/work-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd podczas tworzenia wpisu");
  return res.json();
};

const updateWorkSchedule = async ({
  id,
  ...data
}: WorkScheduleUpdateCommand & { id: string }): Promise<WorkScheduleDTO> => {
  const res = await fetch(`/api/work-schedule/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Błąd podczas aktualizacji wpisu");
  return res.json();
};

const deleteWorkSchedule = async (id: string): Promise<void> => {
  const res = await fetch(`/api/work-schedule/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Błąd podczas usuwania wpisu");
};

export function useWorkSchedules() {
  const [data, setData] = useState<WorkScheduleDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWorkSchedules();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}

export function useCreateWorkSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: WorkScheduleCreateCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createWorkSchedule(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}

export function useUpdateWorkSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (data: WorkScheduleUpdateCommand & { id: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateWorkSchedule(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading, error };
}

export function useDeleteWorkSchedule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteWorkSchedule(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteWorkSchedule: del, isLoading, error };
}
