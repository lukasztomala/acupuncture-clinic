"use client";
import { useState, useEffect } from "react";
import type { NextAvailableDTO } from "@/types";
// Slot view model for UI with label
type SlotVM = NextAvailableDTO & { label: string };

/**
 * Custom hook to fetch paginated next available appointment slots
 */
export function useNextAvailable(page: number, limit: number) {
  const [data, setData] = useState<SlotVM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/visits/next-available?page=${page}&limit=${limit}`)
      .then(async (res) => {
        if (res.status === 404) {
          setData([]);
          setError("Brak dostępnych terminów");
        } else if (!res.ok) {
          const json = await res.json();
          setError(json.error || "Błąd serwera");
        } else {
          const json: NextAvailableDTO[] = await res.json();
          setData(
            json.map((slot) => ({
              ...slot,
              label: `${new Date(slot.start_time).toLocaleDateString("pl-PL")} ${new Date(slot.start_time).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} - ${new Date(slot.end_time).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`,
            }))
          );
        }
      })
      .catch(() => setError("Błąd sieci"))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return { data, loading, error };
}
