function csrfCheck(req, res, next) {
  const origin = req.get("origin");
  const referer = req.get("referer");
  const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({ message: "Forbidden." });
  }
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin !== allowedOrigin) {
        return res.status(403).json({ message: "Forbidden." });
      }
    } catch {
      return res.status(403).json({ message: "Forbidden." });
    }
  }
  next();
}

module.exports = { csrfCheck };
