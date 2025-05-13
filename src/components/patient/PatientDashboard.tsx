import React, { useState } from "react";
import { useVisits } from "../../lib/hooks/useVisits";
import UpcomingVisitsTable from "./UpcomingVisitsTable";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";

export default function PatientDashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { visits, totalPages, isLoading, error } = useVisits({ status: "upcoming", page, limit });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <a href="/patient/book">Zarezerwuj wizytę</a>
        </Button>
      </div>
      {error && <p className="text-destructive text-center">{error}</p>}
      {isLoading ? <p className="text-center">Ładowanie...</p> : <UpcomingVisitsTable visits={visits} />}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
