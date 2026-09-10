import { NextRequest, NextResponse } from "next/server";
import { decodeIdToken } from "arctic";
import { google } from "@/lib/oauth";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const claims = decodeIdToken(tokens.idToken()) as {
    sub: string;
    email: string;
    name: string;
  };

  const [user] = await sql`
    INSERT INTO users (google_sub, email, name)
    VALUES (${claims.sub}, ${claims.email}, ${claims.name})
    ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
    RETURNING id
  `;

  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${user.id}, ${expiresAt.toISOString()})
  `;

  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
  });
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_code_verifier");

  return NextResponse.redirect(new URL("/", req.url));
}