import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Imię musi mieć przynajmniej 2 znaki" }),
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  message: z.string().min(10, { message: "Wiadomość musi mieć minimum 10 znaków" }),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Stub: show success toast and reset
    toast.success("Wiadomość wysłana!");
    reset();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Masz pytanie?</CardTitle>
        <CardDescription>Napisz do Nas, chętnie odpowiemy</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 bg-white rounded shadow">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-medium">
            Imię
          </label>
          <input id="name" {...register("name")} className="border rounded p-2" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-medium">
            Email
          </label>
          <input id="email" type="email" {...register("email")} className="border rounded p-2" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="message" className="mb-1 font-medium">
            Wiadomość
          </label>
          <textarea id="message" rows={4} {...register("message")} className="border rounded p-2 resize-none" />
          {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
        </div>
        <CardFooter className="justify-end p-0">
          <Button type="submit" disabled={isSubmitting}>
            Wyślij
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ContactForm;
