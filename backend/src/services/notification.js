const { getRedis } = require("../config/redis");
const { sendPush } = require("./pushNotification");

const CHANNEL = "report:updates";

const sseClients = new Set();

async function publish(event) {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.publish(CHANNEL, JSON.stringify(event));
    } catch {}
  }
  for (const client of sseClients) {
    try {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }

  if (event.type === "report:claimed" && event.userId) {
    sendPush(event.userId, "Report Claimed", `Report assigned to ${event.assignedByName || "a rescuer"}`, "/rescuer/assignments");
  }
  if (event.type === "report:status" && event.userId) {
    sendPush(event.userId, "Status Update", `Report updated to ${event.status?.replace("_", " ")}`, "/rescuer/assignments");
  }
}

function addSSEClient(res) {
  sseClients.add(res);
  res.on("close", () => sseClients.delete(res));
}

async function subscribe(callback) {
  const redis = await getRedis();
  if (!redis) return null;
  const sub = redis.duplicate();
  try {
    await sub.subscribe(CHANNEL);
    sub.on("message", (_channel, message) => {
      try {
        callback(JSON.parse(message));
      } catch {}
    });
  } catch {
    console.warn("[Notifications] Redis subscribe failed");
  }
  return sub;
}

module.exports = { publish, addSSEClient, subscribe };
