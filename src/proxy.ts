import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas — siempre accesibles
  const publicPaths = ["/", "/auth/callback"];
  if (publicPaths.includes(pathname)) {
    // Si ya tiene sesión y va a /, redirigir a /fixture
    if (user && pathname === "/") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias")
        .eq("id", user.id)
        .single();

      if (!profile?.alias) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return NextResponse.redirect(new URL("/fixture", request.url));
    }
    return supabaseResponse;
  }

  // Sin sesión → redirigir a home
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("alias, is_admin")
    .eq("id", user.id)
    .single();

  // Sin alias → solo puede ir a /onboarding
  if (!profile?.alias && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Con alias → no puede volver a /onboarding
  if (profile?.alias && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/fixture", request.url));
  }

  // /admin → solo admins
  if (pathname.startsWith("/admin") && !profile?.is_admin) {
    return NextResponse.redirect(new URL("/fixture", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
