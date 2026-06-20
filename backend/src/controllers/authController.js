const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { AppError } = require("../middleware/errorHandler");
const { sendOtp, sendPasswordReset } = require("../services/email");
const { logEvent } = require("../middleware/logAudit");

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

  res.json({ message: "OTP sent to your email.", otpRequired: true });
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
    const valid = await convexClient.query(anyApi.otp.getValidOtp, { email, otp });
    if (!valid) {
      throw new AppError("Invalid or expired OTP.", 400);
    }
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
    token,
    user: { uuid: userUuid, firstName, lastName, email, role: "rescuer" },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim();

  console.log(`[LOGIN] email="${trimmedEmail}" lower="${trimmedEmail.toLowerCase()}"`);

  let user = await convexClient.query(anyApi.users.getUserByEmail, { email: trimmedEmail });
  console.log(`[LOGIN] exact match: ${user ? 'FOUND' : 'NOT FOUND'}`);

  if (!user) {
    user = await convexClient.query(anyApi.users.getUserByEmail, { email: trimmedEmail.toLowerCase() });
    console.log(`[LOGIN] lower match: ${user ? 'FOUND' : 'NOT FOUND'}`);
  }

  if (!user) {
    console.log(`[LOGIN] user NOT FOUND for "${trimmedEmail}"`);
    await logEvent({ req, eventType: "login_attempt", metadata: { email: trimmedEmail, reason: "user_not_found" } });
    throw new AppError("Invalid email or password.", 401);
  }

  console.log(`[LOGIN] user FOUND: uuid=${user.uuid} role=${user.role} storedEmail="${user.email}"`);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await logEvent({ req, eventType: "login_attempt", metadata: { email: trimmedEmail, reason: "wrong_password" } });
    throw new AppError("Invalid email or password.", 401);
  }

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
    token,
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
  if (!user) {
    throw new AppError("No account found with that email.", 404);
  }

  const resetToken = jwt.sign(
    { uuid: user.uuid, email: user.email, type: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  await sendPasswordReset(email, resetToken);

  await logEvent({ req, userId: user.uuid, eventType: "password_reset", metadata: { email } });

  res.json({ message: "Password reset link sent to your email." });
};

module.exports = { sendOtpHandler, register, login, forgotPassword };
