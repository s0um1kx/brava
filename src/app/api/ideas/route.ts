import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { title, filename, markdown } = await req.json();

  if (!title || !filename || !markdown) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO ideas (filename, title, content)
    VALUES (${filename}, ${title}, ${markdown})
    RETURNING id, created_at
  `;

  return NextResponse.json({ id: row.id, createdAt: row.created_at });
}