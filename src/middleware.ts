import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/onboarding", "/api"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  const res = NextResponse.next();

  if (path === "/sign-in" || path === "/sign-up") {
    res.cookies.delete("activeTeamId");
    res.cookies.delete("activeMode");
    return res;
  }

  if (userId && !PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    const checkUrl = new URL("/api/onboarding-check", req.url);
    const check = await fetch(checkUrl, { headers: req.headers });
    const { onboarded } = await check.json();

    if (!onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};