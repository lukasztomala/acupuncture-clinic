import React, { useState } from "react";
import {
  useWorkSchedules,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useDeleteWorkSchedule,
} from "../../../lib/hooks/useWorkSchedule";
import { WorkScheduleTable, WorkScheduleModalForm, DeleteConfirmationModal } from ".";
import { Button } from "@/components/ui/button";
import type { ScheduleEntryVM, CreateScheduleVM, UpdateScheduleVM, WorkScheduleDTO } from "../../../types";
import { toast } from "sonner";

const DAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

const WorkSchedulePage: React.FC = () => {
  const { data, isLoading, isError, error } = useWorkSchedules();
  const createMutation = useCreateWorkSchedule();
  const updateMutation = useUpdateWorkSchedule();
  const deleteMutation = useDeleteWorkSchedule();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntryVM | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const vms: ScheduleEntryVM[] = data
    ? data.map((d: WorkScheduleDTO) => ({
        id: d.id,
        dayOfWeek: d.day_of_week,
        dayLabel: DAYS[d.day_of_week],
        startTime: d.start_time,
        endTime: d.end_time,
      }))
    : [];

  const openAdd = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const entry = vms.find((e) => e.id === id);
    if (entry) {
      setEditingEntry(entry);
      setModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleSubmit = (data: CreateScheduleVM | UpdateScheduleVM) => {
    if ("id" in data && data.id) {
      updateMutation.mutate(data, {
        onSuccess: () => toast.success("Zaktualizowano zakres"),
        onError: (err: any) => toast.error(err.message),
      });
    } else {
      createMutation.mutate(data as CreateScheduleVM, {
        onSuccess: () => toast.success("Dodano zakres"),
        onError: (err: any) => toast.error(err.message),
      });
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => toast.success("Usunięto zakres"),
        onError: (err: any) => toast.error(err.message),
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Harmonogram pracy</h1>
      <div className="mb-4">
        <Button onClick={openAdd}>Dodaj zakres</Button>
      </div>
      {isLoading && <div>Ładowanie...</div>}
      {isError && <div className="text-red-500">Błąd: {error.message}</div>}
      {!isLoading && !isError && vms.length === 0 && <div>Brak zakresów</div>}
      {!isLoading && !isError && vms.length > 0 && (
        <div className="w-full overflow-x-auto">
          <WorkScheduleTable entries={vms} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      )}
      <WorkScheduleModalForm
        isOpen={isModalOpen}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />
      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default WorkSchedulePage;
