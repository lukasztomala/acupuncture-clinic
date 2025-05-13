import React from "react";
import type { ScheduleEntryVM } from "../../../types";
import ScheduleEntryRow from "./ScheduleEntryRow";

interface WorkScheduleTableProps {
  entries: ScheduleEntryVM[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkScheduleTable: React.FC<WorkScheduleTableProps> = ({ entries, onEdit, onDelete }) => (
  <table className="min-w-[600px] w-full table-auto border-collapse">
    <thead>
      <tr>
        <th className="px-4 py-2 whitespace-nowrap">Dzień</th>
        <th className="px-4 py-2 whitespace-nowrap">Od</th>
        <th className="px-4 py-2 whitespace-nowrap">Do</th>
        <th className="px-4 py-2 whitespace-nowrap">Akcje</th>
      </tr>
    </thead>
    <tbody>
      {entries.map((entry) => (
        <ScheduleEntryRow key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </tbody>
  </table>
);

export default WorkScheduleTable;
