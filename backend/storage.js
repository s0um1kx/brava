const fs = require("fs");
const path = require("path");

const IDEAS_DIR = path.join(__dirname, "ideas");

if (!fs.existsSync(IDEAS_DIR)) {
  fs.mkdirSync(IDEAS_DIR);
}

// Strip anything that isn't a safe filename character to prevent path
// traversal (e.g. "../../etc/passwd.md") from a malformed request.
function sanitizeFilename(name) {
  const base = path.basename(name || "idea.md");
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "-");
  return safe.endsWith(".md") ? safe : `${safe}.md`;
}

function saveIdea(filename, content) {
  const safeName = sanitizeFilename(filename);
  let finalName = safeName;
  let counter = 1;

  // Avoid silently overwriting if two ideas generate the same filename
  // (e.g. captured in the same minute with similar wording).
  while (fs.existsSync(path.join(IDEAS_DIR, finalName))) {
    finalName = safeName.replace(/\.md$/, `-${counter}.md`);
    counter += 1;
  }

  fs.writeFileSync(path.join(IDEAS_DIR, finalName), content, "utf-8");
  return finalName;
}

function listIdeas() {
  return fs
    .readdirSync(IDEAS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse(); // newest-looking filenames first (they're date-prefixed)
}

function readIdea(filename) {
  const safeName = sanitizeFilename(filename);
  const filePath = path.join(IDEAS_DIR, safeName);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

module.exports = { saveIdea, listIdeas, readIdea, IDEAS_DIR };
