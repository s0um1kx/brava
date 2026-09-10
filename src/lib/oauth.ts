import { Google } from "arctic";

const redirectURI = `${process.env.APP_URL}/api/auth/callback`;

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  redirectURI
);