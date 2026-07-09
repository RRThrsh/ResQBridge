const webPush = require("web-push");

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webPush.setVapidDetails(
    "mailto:resqbridge@example.com",
    publicVapidKey,
    privateVapidKey
  );
}

const subscriptions = new Map();

function addSubscription(userId, subscription) {
  subscriptions.set(userId, subscription);
}

function removeSubscription(userId) {
  subscriptions.delete(userId);
}

async function sendPush(userId, title, body, url) {
  const sub = subscriptions.get(userId);
  if (!sub) return;
  try {
    await webPush.sendNotification(sub, JSON.stringify({ title, body, url }));
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      subscriptions.delete(userId);
    }
  }
}

async function sendPushToAll(userIds, title, body, url) {
  return Promise.allSettled(userIds.map((uid) => sendPush(uid, title, body, url)));
}

module.exports = { addSubscription, removeSubscription, sendPush, sendPushToAll };
