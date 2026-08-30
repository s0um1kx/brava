const { readIdea } = require("../_lib/storage");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { filename } = req.query;

  try {
    const content = await readIdea(filename);
    if (content === null) {
      return res.status(404).json({ error: "Idea not found." });
    }
    res.status(200).json({ filename, content });
  } catch (err) {
    console.error("Failed to read idea:", err.message);
    res.status(500).json({ error: "Failed to read idea." });
  }
};
