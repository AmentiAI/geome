import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/editor(.*)",
  "/admin(.*)",
  "/shop/checkout(.*)",
  "/api/levels/publish",
  "/api/levels/(.*)/like",
  "/api/levels/(.*)/comments",
  "/api/scores",
  "/api/purchase(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
