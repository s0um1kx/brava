import { cookies } from "next/headers";
import { sql } from "./db";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  const [session] = await sql`
    SELECT sessions.user_id, sessions.expires_at, users.email, users.name
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ${sessionId}
  `;

  if (!session || new Date(session.expires_at) < new Date()) return null;

  return { userId: session.user_id, email: session.email, name: session.name };
}