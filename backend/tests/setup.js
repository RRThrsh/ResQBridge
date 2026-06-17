require("dotenv").config({ path: ".env.test" });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CONVEX_URL = process.env.CONVEX_URL || "https://test.convex.cloud";
