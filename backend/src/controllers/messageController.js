const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { publish } = require("../services/notification");

const sendMessage = async (req, res) => {
  const { content, reportId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Message content is required." });
  }
  const senderName = `${req.user.firstName} ${req.user.lastName}`;
  const msg = await convexClient.mutation(anyApi.messages.sendMessage, {
    senderId: req.user.uuid,
    senderName,
    senderRole: req.user.role,
    content: content.trim(),
    reportId: reportId || undefined,
  });
  await publish({
    type: "chat:message",
    senderId: req.user.uuid,
    senderName,
    senderRole: req.user.role,
    content: content.trim(),
    reportId: reportId || null,
  });
  res.json({ message: msg });
};

const getMessages = async (req, res) => {
  const { reportId, limit } = req.query;
  const messages = await convexClient.query(anyApi.messages.getMessages, {
    reportId: reportId || undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json({ messages });
};

const getConversations = async (_req, res) => {
  const conversations = await convexClient.query(anyApi.messages.getConversations);
  res.json({ conversations });
};

module.exports = { sendMessage, getMessages, getConversations };
