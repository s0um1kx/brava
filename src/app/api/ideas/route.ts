import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { title, filename, markdown } = await req.json();
  if (!title || !filename || !markdown) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO ideas (user_id, filename, title, content)
    VALUES (${session.userId}, ${filename}, ${title}, ${markdown})
    RETURNING id, created_at
  `;

  return NextResponse.json({ id: row.id, createdAt: row.created_at });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const rows = await sql`
    SELECT id, title, content, reviewed, created_at
    FROM ideas
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
  `;

  const ideas = rows.map((row) => ({
    id: row.id,
    title: row.title,
    preview: extractPreview(row.content),
    reviewed: row.reviewed,
    createdAt: row.created_at,
  }));

  return NextResponse.json(ideas);
}

function extractPreview(markdown: string): string {
  const blocks = markdown.trim().split(/\n\s*\n/);
  const body = blocks[2] ?? "";
  return body.length > 80 ? body.slice(0, 80).trim() + "…" : body.trim();
}
