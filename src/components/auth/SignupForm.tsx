import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthSignupSchema } from "../../lib/schemas/auth.schema";
import type { AuthSignupInput } from "../../lib/schemas/auth.schema";
import { useAuthSignup } from "../../lib/hooks/useAuthSignup";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupForm() {
  const { signup, isLoading, error } = useAuthSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthSignupInput>({
    resolver: zodResolver(AuthSignupSchema),
  });

  const onSubmit = async (data: AuthSignupInput) => {
    try {
      await signup(data);
      window.location.href = "/patient/dashboard";
    } catch {
      // błędy są ustawiane w hooku
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>Utwórz nowe konto, aby kontynuować</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <Label htmlFor="first_name">Imię</Label>
            <Input id="first_name" {...register("first_name")} />
            {errors.first_name && <p className="text-destructive text-sm">{errors.first_name.message}</p>}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="last_name">Nazwisko</Label>
            <Input id="last_name" {...register("last_name")} />
            {errors.last_name && <p className="text-destructive text-sm">{errors.last_name.message}</p>}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="date_of_birth">Data urodzenia</Label>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
            {errors.date_of_birth && <p className="text-destructive text-sm">{errors.date_of_birth.message}</p>}
          </div>

          <div className="flex flex-col">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
          </div>
        </div>

        <CardFooter className="p-0">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ładowanie..." : "Zarejestruj się"}
          </Button>
        </CardFooter>

        {error && <p className="text-destructive text-center mt-2">{error}</p>}
      </form>
    </Card>
  );
}
