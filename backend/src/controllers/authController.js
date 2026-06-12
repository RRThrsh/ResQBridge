const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { AppError } = require("../middleware/errorHandler");

const register = async (req, res) => {
  const { firstName, lastName, phoneNumber, email, password } = req.body;
  const userRole = "user";

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
    role: userRole,
  });

  const token = jwt.sign(
    { uuid: userUuid, email, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    message: "User registered successfully.",
    token,
    user: { uuid: userUuid, firstName, lastName, email, role: userRole },
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

module.exports = { register, login };
