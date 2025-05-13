import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import type { UserMetadata } from "@supabase/supabase-js";

// Rate limiting dla endpointów auth
const RATE_LIMIT = 3; // maksymalnie żądań
const WINDOW_SIZE = 60 * 1000; // 1 minuta w ms
const rateLimitMap = new Map<string, number[]>();

// Ścieżki publiczne: strony i endpointy auth
const PUBLIC_PATHS = [
  "/",
  "/o-nas",
  "/kontakt",
  "/login",
  "/signup",
  "/password-reset",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/password-reset",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, request, url, redirect }, next) => {
  // Rate limit tylko dla POST /api/auth/signup, /login, /password-reset
  if (
    request.method === "POST" &&
    (url.pathname === "/api/auth/signup" ||
      url.pathname === "/api/auth/login" ||
      url.pathname === "/api/auth/password-reset")
  ) {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("host") ||
      "unknown";
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const recent = timestamps.filter((ts) => now - ts <= WINDOW_SIZE);
    if (recent.length >= RATE_LIMIT) {
      return new Response(JSON.stringify({ error: "Too Many Requests" }), { status: 429 });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);
  }

  // Pomijaj autentykację dla publicznych ścieżek
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Inicjalizuj Supabase SSR z ciasteczkami i nagłówkami
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  // Pobierz sesję użytkownika
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Auth error:", error.message);
    return redirect("/login");
  }
  console.dir(user);
  // Sprawdź czy użytkownik jest zalogowany
  if (user) {
    locals.supabase = supabase;
    locals.user = {
      email: user.email || "",
      id: user.id,
      role: (user.user_metadata as UserMetadata)?.role || "patient",
    };
    return next();
  }

  // Brak sesji -> przekieruj do logowania
  return redirect("/login");
});
