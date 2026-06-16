import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "yourcard.app";
const IGNORED_SUBDOMAINS = new Set(["www", "app"]);

export async function middleware(req: NextRequest) {
  // 1. Create a response that will allow cookie setting/refreshing
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh auth session
    try {
      await supabase.auth.getUser();
    } catch (err) {
      console.error("Failed to refresh session:", err);
    }
  } else {
    console.warn("Supabase environment variables are missing. Skipping session refresh in middleware.");
  }

  // 2. Perform subdomain rewrite logic
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
    if (subdomain && !IGNORED_SUBDOMAINS.has(subdomain)) {
      const url = req.nextUrl.clone();
      url.pathname = `/card/${subdomain}${req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname}`;
      
      const rewriteRes = NextResponse.rewrite(url);
      
      // Copy cookies set by Supabase to the rewrite response
      res.cookies.getAll().forEach((cookie) => {
        rewriteRes.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          domain: cookie.domain,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
          maxAge: cookie.maxAge,
          expires: cookie.expires,
        });
      });
      
      return rewriteRes;
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - api routes
     * - _next (Next.js internals)
     * - static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
