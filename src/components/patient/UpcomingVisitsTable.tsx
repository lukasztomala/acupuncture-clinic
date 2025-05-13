import React from "react";
import type { VisitVM } from "../../types";

interface UpcomingVisitsTableProps {
  visits: VisitVM[];
}

export default function UpcomingVisitsTable({ visits }: UpcomingVisitsTableProps) {
  if (visits.length === 0) {
    return <p className="text-center py-4">Brak nadchodzących wizyt</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Data startu
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data końca</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cel wizyty</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {visits.map((visit) => (
          <tr key={visit.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{visit.formattedStart}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{visit.formattedEnd}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{visit.purpose}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
