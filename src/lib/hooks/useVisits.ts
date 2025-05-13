import { useState, useEffect } from "react";
import type { VisitDTO } from "../../types";
import type { VisitVM } from "../../types";
import { format } from "date-fns";

export interface UseVisitsParams {
  status: string;
  page: number;
  limit: number;
}

export function useVisits({ status, page, limit }: UseVisitsParams) {
  const [visits, setVisits] = useState<VisitVM[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisits() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/visits?status=${status}&page=${page}&limit=${limit}`);
        if (!res.ok) {
          throw new Error("Nie udało się pobrać wizyt");
        }
        const body = (await res.json()) as { data: VisitDTO[]; meta: { total: number; page: number; limit: number } };
        const vms: VisitVM[] = body.data.map((v) => ({
          id: v.id,
          formattedStart: format(new Date(v.start_time), "dd.MM.yyyy HH:mm"),
          formattedEnd: format(new Date(v.end_time), "dd.MM.yyyy HH:mm"),
          purpose: v.purpose,
        }));
        setVisits(vms);
        setTotalPages(Math.ceil(body.meta.total / body.meta.limit));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVisits();
  }, [status, page, limit]);

  return { visits, totalPages, isLoading, error };
}
