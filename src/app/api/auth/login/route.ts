import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { google } from "@/lib/oauth";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
    sameSite: "lax" as const,
  };

  cookieStore.set("google_oauth_state", state, cookieOpts);
  cookieStore.set("google_code_verifier", codeVerifier, cookieOpts);

  return NextResponse.redirect(url);
}