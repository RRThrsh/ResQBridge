function honeypot(fieldName) {
  const name = fieldName || getDefaultName();
  return (req, res, next) => {
    if (req.body && typeof req.body === "object" && req.body[name]) {
      return res.status(400).json({ message: "Invalid request." });
    }
    next();
  };
}

function getDefaultName() {
  return process.env.HONEYPOT_FIELD || "website";
}

module.exports = { honeypot };
