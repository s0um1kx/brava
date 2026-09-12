import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    cookieStore.delete("session");
  }

  return NextResponse.redirect(new URL("/", req.url));
}