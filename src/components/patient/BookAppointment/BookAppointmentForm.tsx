"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNextAvailable } from "./hooks/useNextAvailable";
import { useCreateVisit } from "./hooks/useCreateVisit";
import SlotList from "./SlotList";
import type { SlotVM } from "./SlotList";
import PaginationControls from "./PaginationControls";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LoadingSpinner from "./LoadingSpinner";

// Wewnętrzny typ formularza
interface BookFormValues {
  purpose: string;
}

const BookAppointmentForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormValues>({ defaultValues: { purpose: "" } });

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const { data: slots, loading: slotsLoading, error: slotsError } = useNextAvailable(page, limit);
  const [selectedSlot, setSelectedSlot] = React.useState<SlotVM | null>(null);
  const { createVisit, loading: creating, error: createError, success } = useCreateVisit();

  const onSubmit = async (formData: BookFormValues) => {
    if (!selectedSlot) {
      toast.error("Wybierz termin");
      return;
    }
    const payload = {
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      purpose: formData.purpose,
    };
    await createVisit(payload);
  };

  // Handle success: show toast and redirect
  useEffect(() => {
    if (success) {
      toast.success("Rezerwacja potwierdzona");
      window.location.href = "/patient/dashboard";
    }
  }, [success]);

  return (
    <Card className="max-w-lg mx-auto mt-6">
      <CardHeader>
        <CardTitle>Rezerwacja wizyty</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Fields grid for responsiveness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Cel wizyty
              </label>
              <Textarea id="purpose" {...register("purpose", { required: "Cel wizyty jest wymagany" })} />
              {errors.purpose && <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>}
            </div>
          </div>

          {/* Lista dostępnych slotów */}
          <div>
            {slotsLoading ? (
              <LoadingSpinner />
            ) : slotsError ? (
              <p className="text-red-600">{slotsError}</p>
            ) : (
              <SlotList slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            )}
          </div>

          {/* Paginacja */}
          <PaginationControls
            page={page}
            limit={limit}
            hasMore={slots.length === limit}
            onPageChange={(newPage) => {
              setPage(newPage);
              setSelectedSlot(null);
            }}
          />

          {/* Alert błędu walidacji */}
          {createError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Błąd walidacji</AlertTitle>
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div>
            <Button type="submit" disabled={creating || !selectedSlot || !!errors.purpose} className="w-full sm:w-auto">
              {creating ? "Rezerwacja..." : "Potwierdź"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookAppointmentForm;
