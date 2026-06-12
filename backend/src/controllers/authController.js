const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { AppError } = require("../middleware/errorHandler");
const { sendOtp } = require("../services/email");

const sendOtpHandler = async (req, res) => {
  const { email } = req.body;

  const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });
  if (existingUser) {
    throw new AppError("Email already registered.", 409);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  await convexClient.mutation(anyApi.otp.createOtp, { email, otp: code, expiresAt });
  await sendOtp(email, code);

  res.json({ message: "OTP sent to your email." });
};

const register = async (req, res) => {
  const { firstName, lastName, phoneNumber, email, password, otp } = req.body;

  const valid = await convexClient.query(anyApi.otp.getValidOtp, { email, otp });
  if (!valid) {
    throw new AppError("Invalid or expired OTP.", 400);
  }

  const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });
  if (existingUser) {
    throw new AppError("Email already registered.", 409);
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
    role: "user",
  });

  await convexClient.mutation(anyApi.otp.markOtpUsed, { id: valid._id });

  const token = jwt.sign(
    { uuid: userUuid, email, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    message: "User registered successfully.",
    token,
    user: { uuid: userUuid, firstName, lastName, email, role: "user" },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await convexClient.query(anyApi.users.getUserByEmail, { email });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = jwt.sign(
    { uuid: user.uuid, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

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

module.exports = { sendOtpHandler, register, login };
