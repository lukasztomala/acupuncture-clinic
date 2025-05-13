"use client";
import { useState } from "react";
import type { VisitCreateCommand, VisitDTO } from "@/types";

/**
 * Custom hook to create a new visit
 */
export function useCreateVisit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Clear the current error */
  const clearError = () => setError(null);
  const [success, setSuccess] = useState(false);

  const createVisit = async (payload: VisitCreateCommand): Promise<VisitDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 400) {
        // Validation error: full hour or <24h before
        const json = await res.json();
        setError(json.error || "Nieprawidłowy termin: wizyta musi być pełną godziną i min. 24h w przyszłość");
        return null;
      }
      if (res.status === 409) {
        const json = await res.json();
        setError(json.error || "Termin już zajęty");
        return null;
      }
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Błąd serwera");
        return null;
      }
      const json: VisitDTO = await res.json();
      setSuccess(true);
      return json;
    } catch {
      setError("Błąd sieci");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createVisit, loading, error, success, clearError };
}
