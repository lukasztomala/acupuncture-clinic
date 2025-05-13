import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLoginSchema } from "../../lib/schemas/auth.schema";
import type { AuthLoginInput } from "../../lib/schemas/auth.schema";
import { useAuthLogin } from "../../lib/hooks/useAuthLogin";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const { login, isLoading, error } = useAuthLogin();
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);

  // Perform redirect when login is successful
  useEffect(() => {
    if (redirectToDashboard) {
      window.location.href = "/patient/dashboard";
    }
  }, [redirectToDashboard]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthLoginInput>({
    resolver: zodResolver(AuthLoginSchema),
  });

  const onSubmit = async (data: AuthLoginInput) => {
    try {
      await login(data);
      setRedirectToDashboard(true);
    } catch {
      // errors are handled in hook
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>Zaloguj się, aby kontynuować</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
        <div className="flex flex-col">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>
        <CardFooter className="p-0">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ładowanie..." : "Zaloguj się"}
          </Button>
        </CardFooter>
        {error && <p className="text-destructive text-center mt-2">{error}</p>}
      </form>
    </Card>
  );
}
