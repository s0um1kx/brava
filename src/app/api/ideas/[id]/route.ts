import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

function extractBody(markdown: string): string {
  const blocks = markdown.trim().split(/\n\s*\n/);
  return (blocks[2] ?? "").trim();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await sql`
    SELECT id, title, content, reviewed, created_at
    FROM ideas
    WHERE id = ${id} AND user_id = ${session.userId}
  `;

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    title: row.title,
    body: extractBody(row.content),
    reviewed: row.reviewed,
    createdAt: row.created_at,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const { reviewed } = await req.json();

  const [row] = await sql`
    UPDATE ideas
    SET reviewed = ${reviewed}
    WHERE id = ${id} AND user_id = ${session.userId}
    RETURNING id, reviewed
  `;

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: row.id, reviewed: row.reviewed });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await sql`
    DELETE FROM ideas
    WHERE id = ${id} AND user_id = ${session.userId}
    RETURNING id
  `;

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: row.id });
}
