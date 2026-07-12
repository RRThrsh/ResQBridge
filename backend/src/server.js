const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const app = require("./app");
const { subscribe } = require("./services/notification");

const PORT = process.env.PORT || 3000;

subscribe(() => {});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
