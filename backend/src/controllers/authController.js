const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

async function register(req, res) {
  try {
    const { firstName, lastName, phoneNumber, email, password, confirmPassword, role } = req.body;

    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const allowedRoles = ["superadmin", "admin", "domestic", "rescuer", "user"];
    const userRole = role || "user";
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
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
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await convexClient.query(anyApi.users.getUserByEmail, { email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = { register, login };
