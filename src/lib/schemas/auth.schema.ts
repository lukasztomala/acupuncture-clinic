import { z } from "zod";

export const AuthSignupSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().min(1, { message: "Last name is required" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  })
  .refine(
    (data) => {
      const dob = new Date(data.date_of_birth);
      const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      return age >= 18;
    },
    { message: "User must be at least 18 years old", path: ["date_of_birth"] }
  );

export type AuthSignupInput = z.infer<typeof AuthSignupSchema>;

// FIRST_EDIT: Define login schema and input type
export const AuthLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;

// Define password reset schema and input type
export const AuthPasswordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export type AuthPasswordResetInput = z.infer<typeof AuthPasswordResetSchema>;
