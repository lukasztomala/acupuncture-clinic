"use client";
import React from "react";
import { format } from "date-fns";
import LoadingSpinner from "./LoadingSpinner";
import type { NextAvailableDTO } from "@/types";

interface NextAvailableSectionProps {
  data: NextAvailableDTO | null;
  loading: boolean;
  error: string | null;
}

const NextAvailableSection: React.FC<NextAvailableSectionProps> = ({ data, loading, error }) => {
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!data) {
    return null;
  }
  return (
    <div className="p-4 bg-gray-50 rounded">
      <p className="text-sm">Najbliższy dostępny termin:</p>
      <p className="font-medium">{format(new Date(data.start_time), "dd.MM.yyyy HH:mm")}</p>
    </div>
  );
};

export default NextAvailableSection;
