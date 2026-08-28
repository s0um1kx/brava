// Turns a cleaned transcript into the structured markdown format Brava saves.
// Kept deliberately simple for v0.1 — no AI summarization, just honest structure
// around what was actually said.

function makeTitle(cleanedText) {
  if (!cleanedText) return "Untitled idea";

  const words = cleanedText.trim().split(/\s+/);
  const titleWords = words.slice(0, 8).join(" ");
  const title = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);

  return words.length > 8 ? `${title}…` : title;
}

function formatTimestamp(date) {
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}

function slugify(text, date) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join("-");

  const stamp = date.toISOString().slice(0, 10);
  return `${stamp}-${base || "idea"}`;
}

function buildMarkdown(cleanedText, options = {}) {
  const date = options.date || new Date();
  const context = options.context || "Unspecified";
  const title = makeTitle(cleanedText);

  const lines = [
    `# ${title}`,
    "",
    `**Captured:** ${formatTimestamp(date)}`,
    `**Context:** ${context}`,
    "",
    "## The idea",
    cleanedText || "(nothing captured)",
    "",
    "## Status",
    "- [ ] Not yet reviewed",
    "",
  ];

  return {
    filename: `${slugify(cleanedText, date)}.md`,
    content: lines.join("\n"),
  };
}

window.BravaMarkdown = { buildMarkdown };
