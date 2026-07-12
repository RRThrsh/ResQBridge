class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed.") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized.") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden.") {
    super(message, 403);
  }
}

function errorHandler(err, req, res, _next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large." });
    }
    return res.status(400).json({ message: err.message });
  }

  const { logEvent } = require("./logAudit");
  logEvent({
    req,
    eventType: "error",
    metadata: {
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      path: req?.originalUrl,
      method: req?.method,
    },
  });

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
  asyncHandler,
};
