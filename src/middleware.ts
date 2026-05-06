import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight HTTP Basic Auth gate for the entire app.
 *
 * - Username / password come from the AUTH_USERNAME / AUTH_PASSWORD env vars.
 * - Default fallback is the Greenheck team credential so a misconfigured
 *   deploy still requires a password rather than serving the data wide open.
 * - Static asset paths are excluded so the auth challenge UI can render.
 *
 * To disable auth temporarily, set AUTH_DISABLE=1.
 */
export function middleware(req: NextRequest) {
  if (process.env.AUTH_DISABLE === "1") return NextResponse.next();

  const expectedUser = process.env.AUTH_USERNAME || "greenheck";
  const expectedPass = process.env.AUTH_PASSWORD || "greenheckdatateam1";

  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
      const idx = decoded.indexOf(":");
      const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
      const pass = idx >= 0 ? decoded.slice(idx + 1) : "";
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="BuildVision Data Viewer", charset="UTF-8"',
    },
  });
}

export const config = {
  // Apply to everything except Next.js internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logos|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$|.*\\.ico$).*)",
  ],
};
