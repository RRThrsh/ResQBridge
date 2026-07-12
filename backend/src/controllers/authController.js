const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { AppError } = require("../middleware/errorHandler");
const { sendOtp, sendPasswordReset } = require("../services/email");
const { logEvent } = require("../middleware/logAudit");

const failedAttempts = new Map();
const otpAttempts = new Map();

const sendOtpHandler = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  const otpEnabled = await convexClient.query(anyApi.config.getConfigValue, { key: "otpEnabled" });
  if (otpEnabled === "false") {
    return res.json({ message: "Registration is open — no OTP required.", otpRequired: false });
  }

  const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });
  if (existingUser) {
    await logEvent({ req, eventType: "login_attempt", metadata: { email, reason: "already_registered" } });
    throw new AppError("Email already registered.", 409);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 60 * 1000;

  await convexClient.mutation(anyApi.otp.createOtp, { email, otp: code, expiresAt });
  await sendOtp(email, code);

  await logEvent({ req, eventType: "login_attempt", metadata: { email, action: "otp_sent" } });

  res.json({ message: "If eligible, an OTP has been sent.", otpRequired: true });
};

const register = async (req, res) => {
  const { firstName, lastName, phoneNumber, password, otp } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });
  if (existingUser) {
    throw new AppError("Email already registered.", 409);
  }

  const otpEnabled = await convexClient.query(anyApi.config.getConfigValue, { key: "otpEnabled" });
  if (otpEnabled !== "false") {
    if (!otp) throw new AppError("OTP is required.", 400);
    const key = `otp:${email}`;
    const otpFailCount = otpAttempts.get(key) || 0;
    if (otpFailCount >= 3) {
      throw new AppError("Too many OTP attempts. Request a new code.", 429);
    }
    const valid = await convexClient.query(anyApi.otp.getValidOtp, { email, otp });
    if (!valid) {
      otpAttempts.set(key, otpFailCount + 1);
      throw new AppError("Invalid or expired OTP.", 400);
    }
    otpAttempts.delete(key);
    await convexClient.mutation(anyApi.otp.markOtpUsed, { id: valid._id });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userUuid = uuidv4();

  await convexClient.mutation(anyApi.users.createUser, {
    uuid: userUuid,
    firstName,
    lastName,
    phoneNumber,
    email,
    password: hashedPassword,
    role: "rescuer",
  });

  const token = jwt.sign(
    { uuid: userUuid, email, role: "rescuer" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  await logEvent({ req, userId: userUuid, eventType: "register", metadata: { email, role: "rescuer" } });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(201).json({
    message: "User registered successfully.",
    user: { uuid: userUuid, firstName, lastName, email, role: "rescuer" },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim();
  const emailKey = trimmedEmail.toLowerCase();

  const failKey = `login:${emailKey}`;
  const attempts = failedAttempts.get(failKey) || 0;
  if (attempts >= 5) {
    throw new AppError("Account temporarily locked. Try again later.", 429);
  }

  let user = await convexClient.query(anyApi.users.getUserByEmail, { email: trimmedEmail });

  if (!user) {
    user = await convexClient.query(anyApi.users.getUserByEmail, { email: emailKey });
  }

  if (!user) {
    failedAttempts.set(failKey, attempts + 1);
    setTimeout(() => { const c = failedAttempts.get(failKey); if (c && c <= attempts + 1) failedAttempts.delete(failKey); }, 15 * 60 * 1000);
    await logEvent({ req, eventType: "login_attempt", metadata: { email: trimmedEmail, reason: "user_not_found" } });
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    failedAttempts.set(failKey, attempts + 1);
    setTimeout(() => { const c = failedAttempts.get(failKey); if (c && c <= attempts + 1) failedAttempts.delete(failKey); }, 15 * 60 * 1000);
    await logEvent({ req, eventType: "login_attempt", metadata: { email: trimmedEmail, reason: "wrong_password" } });
    throw new AppError("Invalid email or password.", 401);
  }

  failedAttempts.delete(failKey);

  const token = jwt.sign(
    { uuid: user.uuid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  await logEvent({ req, userId: user.uuid, eventType: "login", metadata: { email: user.email, role: user.role } });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({
    message: "Login successful.",
    user: {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

const forgotPassword = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  const user = await convexClient.query(anyApi.users.getUserByEmail, { email });

  if (user) {
    const resetToken = jwt.sign(
      { uuid: user.uuid, email: user.email, type: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    await sendPasswordReset(email, resetToken);

    await logEvent({ req, userId: user.uuid, eventType: "password_reset", metadata: { email } });
  }

  res.json({ message: "If an account with that email exists, a reset link has been sent." });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError("Token and password are required.", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired reset token.", 400);
  }

  if (decoded.type !== "password-reset") {
    throw new AppError("Invalid reset token.", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await convexClient.mutation(anyApi.users.updatePassword, {
    uuid: decoded.uuid,
    password: hashedPassword,
  });

  await logEvent({ req, userId: decoded.uuid, eventType: "password_reset_completed" });

  res.json({ message: "Password reset successful." });
};

module.exports = { sendOtpHandler, register, login, forgotPassword, resetPassword };
