// Single shared-secret check — appropriate for a personal, single-user tool.
// The passcode lives only in an environment variable on the server; it's
// never present in any frontend JS bundle.
function checkPasscode(req) {
  const provided = req.headers["x-brava-passcode"];
  return Boolean(provided) && provided === process.env.BRAVA_PASSCODE;
}

module.exports = { checkPasscode };
