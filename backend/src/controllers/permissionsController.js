const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");

const DEFAULT_ADMIN_PERMISSIONS = {
  users: { read: false, write: false, execute: false },
  reports: { read: false, write: false, execute: false },
  rescuerMap: { read: false, write: false, execute: false },
  monitoring: { read: false, write: false, execute: false },
  audit: { read: false, write: false, execute: false },
  landingPage: { read: false, write: false, execute: false },
  systemConfig: { read: false, write: false, execute: false },
  dashboard: { read: true, write: false, execute: false },
  archive: { read: false, write: false, execute: false },
};

const ACTIONS = ["read", "write", "execute"];

const getAdminPermissions = async (_req, res) => {
  const raw = await convexClient.query(anyApi.config.getConfigValue, { key: "adminPermissions" });
  let stored = {};
  try { stored = raw ? JSON.parse(raw) : {}; } catch { stored = {}; }

  const permissions = {};
  for (const [feature, defaults] of Object.entries(DEFAULT_ADMIN_PERMISSIONS)) {
    permissions[feature] = { ...defaults, ...(stored[feature] || {}) };
  }
  res.json({ permissions });
};

const updateAdminPermissions = async (req, res) => {
  const payload = {};
  for (const feature of Object.keys(DEFAULT_ADMIN_PERMISSIONS)) {
    const featurePayload = req.body[feature];
    if (!featurePayload || typeof featurePayload !== "object") continue;
    const cleaned = {};
    for (const action of ACTIONS) {
      if (typeof featurePayload[action] === "boolean") {
        cleaned[action] = featurePayload[action];
      }
    }
    if (Object.keys(cleaned).length > 0) {
      payload[feature] = cleaned;
    }
  }

  await convexClient.mutation(anyApi.config.upsertConfig, {
    key: "adminPermissions",
    value: JSON.stringify(payload),
  });

  await logEvent({
    req,
    userId: req.user.uuid,
    eventType: "config_update",
    metadata: { key: "adminPermissions", value: JSON.stringify(payload) },
  });

  const permissions = {};
  for (const [feature, defaults] of Object.entries(DEFAULT_ADMIN_PERMISSIONS)) {
    permissions[feature] = { ...defaults, ...(payload[feature] || {}) };
  }
  res.json({ message: "Admin permissions updated.", permissions });
};

module.exports = { getAdminPermissions, updateAdminPermissions, DEFAULT_ADMIN_PERMISSIONS };
