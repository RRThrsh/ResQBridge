const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { addSubscription, removeSubscription } = require("../services/pushNotification");

const subscribeRules = [
  body("subscription").notEmpty().withMessage("Subscription is required."),
  body("subscription.endpoint").isURL({ protocols: ["https"] }).withMessage("Valid HTTPS endpoint is required."),
];

router.post("/subscribe", authenticate, subscribeRules, validate, (req, res) => {
  addSubscription(req.user.uuid, req.body.subscription);
  res.json({ message: "Subscribed." });
});

router.post("/unsubscribe", authenticate, (req, res) => {
  removeSubscription(req.user.uuid);
  res.json({ message: "Unsubscribed." });
});

module.exports = router;
