const { createClient } = require("@supabase/supabase-js");

// Server-side only — this file lives under api/_lib/, which Vercel does not
// expose as a route, so these credentials never reach the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
