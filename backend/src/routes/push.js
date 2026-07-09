const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { addSubscription, removeSubscription } = require("../services/pushNotification");

router.post("/subscribe", authenticate, (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ message: "Subscription is required." });
  addSubscription(req.user.uuid, subscription);
  res.json({ message: "Subscribed." });
});

router.post("/unsubscribe", authenticate, (req, res) => {
  removeSubscription(req.user.uuid);
  res.json({ message: "Unsubscribed." });
});

module.exports = router;
