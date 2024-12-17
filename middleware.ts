import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the user is on the root route
  if (request.nextUrl.pathname === "/") {
    // Redirect the user to the '/webcam' route
    return NextResponse.redirect(new URL("/heatmap/image-map", request.url));
  }

  return NextResponse.next(); // Allow other routes to proceed
}

export const config = {
  matcher: ["/"], // Apply middleware only to the root route
};
