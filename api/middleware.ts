// import { NextRequest, NextResponse } from "next/server";

export function middleware(request: any, response: any) {
  const token = request.cookies.get("access_token")?.value;

  // If there's no token just continue
  if (!token) return response.next();

  // Create a new Headers object based on the incoming headers and add Authorization
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("authorization", `Bearer ${token}`);

  // Return a NextResponse.next with modified request headers so downstream
  // routes/edge functions receive the Authorization header.
  return request.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/api/:path*",
};
