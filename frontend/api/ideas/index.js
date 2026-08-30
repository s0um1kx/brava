const { saveIdea, listIdeas } = require("./_lib/storage");
const { checkPasscode } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (!checkPasscode(req)) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (req.method === "GET") {
    try {
      const ideas = await listIdeas();
      return res.status(200).json({ ideas });
    } catch (err) {
      console.error("Failed to list ideas:", err.message);
      return res.status(500).json({ error: "Failed to list ideas." });
    }
  }

  if (req.method === "POST") {
    const { filename, content } = req.body || {};

    if (!content) {
      return res.status(400).json({ error: "Missing markdown content." });
    }

    try {
      const savedFilename = await saveIdea(filename, content);
      return res.status(200).json({ status: "saved", filename: savedFilename });
    } catch (err) {
      console.error("Failed to save idea:", err.message);
      return res.status(500).json({ error: "Failed to save idea." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method} not allowed.` });
};
