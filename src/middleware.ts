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
    res.cookies.delete("onboardedCheck");
    return res;
  }

  if (userId && !PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    const cachedOnboarded = req.cookies.get("onboardedCheck")?.value;

    if (cachedOnboarded === "true") {
      return res;
    }

    try {
      const checkUrl = new URL("/api/onboarding-check", req.url);
      const check = await fetch(checkUrl, { headers: req.headers });
      const { onboarded } = await check.json();

      if (!onboarded) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      res.cookies.set("onboardedCheck", "true", { path: "/", maxAge: 60 * 60 * 24 });
    } catch {
      // If the check itself fails, don't punish the user with a bad redirect —
      // let the page load; individual pages already guard onboarding status server-side.
      return res;
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