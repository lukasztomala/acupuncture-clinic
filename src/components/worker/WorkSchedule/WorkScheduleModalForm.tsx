import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkScheduleCreateSchema } from "../../../lib/schemas/work-schedule.schema";
import type { z } from "zod";

interface WorkScheduleModalFormProps {
  isOpen: boolean;
  initialData?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  onSubmit: (data: { dayOfWeek: number; startTime: string; endTime: string; id?: string }) => void;
  onClose: () => void;
}

const WorkScheduleModalForm: React.FC<WorkScheduleModalFormProps> = ({ isOpen, initialData, onSubmit, onClose }) => {
  type FormData = z.infer<typeof WorkScheduleCreateSchema>;
  const defaultValues: FormData = initialData
    ? { day_of_week: initialData.dayOfWeek, start_time: initialData.startTime, end_time: initialData.endTime }
    : { day_of_week: 1, start_time: "09:00", end_time: "17:00" };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(WorkScheduleCreateSchema),
    defaultValues,
  });
  useEffect(() => {
    reset(defaultValues);
  }, [initialData]);
  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen]);

  const onValid = (data: FormData) => {
    onSubmit({
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      ...(initialData?.id && { id: initialData.id }),
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edytuj zakres" : "Dodaj zakres"}</DialogTitle>
          <DialogDescription>Wprowadź dzień i przedział czasowy</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="mt-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="flex flex-col">
              <label htmlFor="day_of_week" className="mb-1">
                Dzień tygodnia
              </label>
              <select id="day_of_week" {...register("day_of_week")} className="border rounded p-2">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <option key={idx} value={idx}>
                    {["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"][idx]}
                  </option>
                ))}
              </select>
              {errors.day_of_week && <p className="text-red-500 text-sm">{errors.day_of_week.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="start_time" className="mb-1">
                Od
              </label>
              <input id="start_time" type="time" {...register("start_time")} className="border rounded p-2" />
              {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="end_time" className="mb-1">
                Do
              </label>
              <input id="end_time" type="time" {...register("end_time")} className="border rounded p-2" />
              {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time.message}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default WorkScheduleModalForm;
