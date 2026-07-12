const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const passport = require("passport");
const { sendOtpHandler, register, login, forgotPassword, resetPassword } = require("../controllers/authController");
const { ssoCallback } = require("../controllers/ssoController");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { otpLimiter } = require("../middleware/rateLimiter");
const { honeypot } = require("../middleware/honeypot");
const { csrfCheck } = require("../middleware/csrf");

const sendOtpRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required."),
];

const registerRules = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required.")
    .isLength({ max: 50 }).withMessage("First name must be at most 50 characters.")
    .matches(/^[a-zA-Z\s'-]+$/).withMessage("First name contains invalid characters."),
  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required.")
    .isLength({ max: 50 }).withMessage("Last name must be at most 50 characters.")
    .matches(/^[a-zA-Z\s'-]+$/).withMessage("Last name contains invalid characters."),
  body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required.")
    .matches(/^\+?\d{7,15}$/).withMessage("Valid phone number is required (7-15 digits)."),
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required."),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
  body("otp")
    .optional({ values: "falsy" })
    .trim()
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("Valid 6-digit OTP is required."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/send-otp", csrfCheck, otpLimiter, sendOtpRules, validate, asyncHandler(sendOtpHandler));
router.post("/register", csrfCheck, honeypot(), registerRules, validate, asyncHandler(register));
router.post("/login", csrfCheck, honeypot(), loginRules, validate, asyncHandler(login));

const forgotPasswordRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required."),
];

router.post("/forgot-password", csrfCheck, forgotPasswordRules, validate, asyncHandler(forgotPassword));

const resetPasswordRules = [
  body("token").trim().notEmpty().withMessage("Token is required."),
  body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];
router.post("/reset-password", csrfCheck, resetPasswordRules, validate, asyncHandler(resetPassword));

router.get("/google", passport.authenticate("google", { session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=sso_failed` }), ssoCallback);

module.exports = router;
