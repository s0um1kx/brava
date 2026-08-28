const express = require("express");
const cors = require("cors");
const { saveIdea, listIdeas, readIdea } = require("./storage");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check — confirms the server is alive.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "brava-backend", version: "0.1.0" });
});

// Milestone 5: save a captured idea's markdown to disk.
app.post("/api/ideas", (req, res) => {
  const { filename, content } = req.body || {};

  if (!content) {
    return res.status(400).json({ error: "Missing markdown content." });
  }

  try {
    const savedFilename = saveIdea(filename, content);
    res.json({ status: "saved", filename: savedFilename });
  } catch (err) {
    console.error("Failed to save idea:", err.message);
    res.status(500).json({ error: "Failed to save idea." });
  }
});

// List saved ideas (used by the laptop review view in Milestone 6).
app.get("/api/ideas", (req, res) => {
  try {
    res.json({ ideas: listIdeas() });
  } catch (err) {
    console.error("Failed to list ideas:", err.message);
    res.status(500).json({ error: "Failed to list ideas." });
  }
});

// Read a single saved idea's content.
app.get("/api/ideas/:filename", (req, res) => {
  const content = readIdea(req.params.filename);
  if (content === null) {
    return res.status(404).json({ error: "Idea not found." });
  }
  res.json({ filename: req.params.filename, content });
});

app.listen(PORT, () => {
  console.log(`Brava backend listening on port ${PORT}`);
});
