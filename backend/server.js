const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check — confirms the server is alive before Milestone 5 adds real storage endpoints.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "brava-backend", version: "0.1.0" });
});

app.listen(PORT, () => {
  console.log(`Brava backend listening on port ${PORT}`);
});
