import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthPasswordResetSchema, AuthPasswordResetInput } from "../../lib/schemas/auth.schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordResetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthPasswordResetInput>({
    resolver: zodResolver(AuthPasswordResetSchema),
  });

  const onSubmit = async (data: AuthPasswordResetInput) => {
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Nie udało się wysłać emaila");
      }
      toast.success("Email z resetem hasła został wysłany");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wystąpił błąd";
      toast.error(message);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Odzyskiwanie konta</CardTitle>
        <CardDescription>Wprowadź swój email, aby otrzymać link do resetu hasła</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
        <div className="flex flex-col">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>
        <CardFooter className="p-0">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Wysyłanie..." : "Wyślij link"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
