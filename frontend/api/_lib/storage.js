const { supabase } = require("./supabaseClient");

function sanitizeFilename(name) {
  const base = (name || "idea.md").replace(/[^a-zA-Z0-9._-]/g, "-");
  return base.endsWith(".md") ? base : `${base}.md`;
}

async function saveIdea(filename, content) {
  const safeName = sanitizeFilename(filename);
  let finalName = safeName;
  let counter = 1;

  // Avoid overwriting if two ideas land with the same generated filename.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await supabase
      .from("ideas")
      .select("filename")
      .eq("filename", finalName)
      .maybeSingle();

    if (!data) break;
    finalName = safeName.replace(/\.md$/, `-${counter}.md`);
    counter += 1;
  }

  const { error } = await supabase
    .from("ideas")
    .insert({ filename: finalName, content });

  if (error) throw new Error(error.message);
  return finalName;
}

async function listIdeas() {
  const { data, error } = await supabase
    .from("ideas")
    .select("filename")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map((row) => row.filename);
}

async function readIdea(filename) {
  const safeName = sanitizeFilename(filename);
  const { data, error } = await supabase
    .from("ideas")
    .select("content")
    .eq("filename", safeName)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? data.content : null;
}

module.exports = { saveIdea, listIdeas, readIdea };
