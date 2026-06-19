const { validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    console.error('Validation errors:', JSON.stringify(mapped));
    return res.status(400).json({
      message: "Validation failed.",
      errors: mapped,
    });
  }
  next();
}

module.exports = { validate };
