const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { sendOtpHandler, register, login, forgotPassword } = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");

const sendOtpRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required."),
];

const registerRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required."),
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
    .isLength({ min: 6, max: 6 })
    .withMessage("Valid 6-digit OTP is required."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/send-otp", sendOtpRules, validate, asyncHandler(sendOtpHandler));
router.post("/register", registerRules, validate, asyncHandler(register));
router.post("/login", loginRules, validate, asyncHandler(login));

const forgotPasswordRules = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required."),
];

router.post("/forgot-password", forgotPasswordRules, validate, asyncHandler(forgotPassword));

module.exports = router;
