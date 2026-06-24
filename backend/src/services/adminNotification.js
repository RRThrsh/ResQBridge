const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

async function notifyAdmin({ type, message, link }) {
  await convexClient.mutation(anyApi.adminNotifications.insertNotification, {
    type,
    message,
    link: link || undefined,
  });
}

module.exports = { notifyAdmin };
