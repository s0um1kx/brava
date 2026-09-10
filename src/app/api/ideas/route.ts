import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT id, title, content, reviewed, created_at
    FROM ideas
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
  // body sits between the "# Title" heading and the trailing checkbox —
  // it's the third block once split on blank lines (frontmatter, heading, body)
  const blocks = markdown.trim().split(/\n\s*\n/);
  const body = blocks[2] ?? "";
  return body.length > 80 ? body.slice(0, 80).trim() + "…" : body.trim();
}

  ;
