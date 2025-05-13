import React from "react";
import BookAppointmentForm from "./BookAppointmentForm";

const BookAppointmentPage: React.FC = () => {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Rezerwacja wizyty</h1>
      <BookAppointmentForm />
    </div>
  );
};

export default BookAppointmentPage;
