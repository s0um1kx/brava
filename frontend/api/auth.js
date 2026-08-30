module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { passcode } = req.body || {};

  if (passcode && passcode === process.env.BRAVA_PASSCODE) {
    return res.status(200).json({ ok: true });
  }

  res.status(401).json({ error: "Incorrect passcode." });
};
