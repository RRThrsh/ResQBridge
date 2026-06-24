const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const app = require("./app");
const { subscribe } = require("./services/notification");

const PORT = process.env.PORT || 3000;

subscribe((event) => {
  console.log("[Notification]", event.type, event.reportId);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
