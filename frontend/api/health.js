module.exports = (req, res) => {
  res.status(200).json({ status: "ok", service: "brava-api", version: "0.1.0" });
};
