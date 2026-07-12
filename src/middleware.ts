import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPlatformAdminRoute } from "@/lib/auth/admin-routes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

function redirectToLogin(
  request: NextRequest,
  response: NextResponse,
  error?: string
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/admin/login";
  redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  if (error) redirectUrl.searchParams.set("error", error);
  return copyResponseCookies(response, NextResponse.redirect(redirectUrl));
}

function redirectAwayFromAdmin(request: NextRequest, response: NextResponse) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  return copyResponseCookies(response, NextResponse.redirect(redirectUrl));
}

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabasePublishableKey) {
    return {
      response,
      supabase: null,
      user: null,
      unavailable: true,
    };
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const authResult = await supabase.auth.getUser();
    return {
      response,
      supabase,
      user: authResult.error ? null : authResult.data.user,
      unavailable: false,
    };
  } catch {
    return {
      response,
      supabase,
      user: null,
      unavailable: true,
    };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/admin") ||
    pathname === "/admin/login" ||
    isPlatformAdminRoute(pathname)
  ) {
    return NextResponse.next({ request });
  }

  const session = await updateSession(request);

  if (session.unavailable || !session.supabase) {
    return redirectToLogin(request, session.response, "supabase_unavailable");
  }

  if (!session.user) {
    return redirectToLogin(request, session.response);
  }

  let adminProfile;

  try {
    const adminResult = await session.supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminResult.error) {
      return redirectToLogin(request, session.response, "supabase_unavailable");
    }

    adminProfile = adminResult.data;
  } catch {
    return redirectToLogin(request, session.response, "supabase_unavailable");
  }

  if (!adminProfile) {
    return redirectAwayFromAdmin(request, session.response);
  }

  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
