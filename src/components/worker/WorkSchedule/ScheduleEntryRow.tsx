import React from "react";
import { Button } from "@/components/ui/button";
import type { ScheduleEntryVM } from "../../../types";

interface ScheduleEntryRowProps {
  entry: ScheduleEntryVM;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ScheduleEntryRow: React.FC<ScheduleEntryRowProps> = ({ entry, onEdit, onDelete }) => (
  <tr>
    <td className="px-4 py-2 whitespace-nowrap">{entry.dayLabel}</td>
    <td className="px-4 py-2 whitespace-nowrap">{entry.startTime}</td>
    <td className="px-4 py-2 whitespace-nowrap">{entry.endTime}</td>
    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
      <Button size="sm" variant="outline" onClick={() => onEdit(entry.id)}>
        Edytuj
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(entry.id)}>
        Usuń
      </Button>
    </td>
  </tr>
);

export default ScheduleEntryRow;
