const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");

function toCSV(headers, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.map(esc).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => esc(row[h] ?? row[h.toLowerCase()] ?? "")).join(","));
  }
  return lines.join("\n");
}

const EXPORT_STATUS_MAP = {
  pending: "pending",
  accepted: "assigned",
  en_route: "en_route",
  rescue_success: "resolved",
  rescue_failed: "failed",
};

const exportReports = async (_req, res) => {
  const reports = await convexClient.query(anyApi.reports.listReports);
  const headers = ["id", "name", "phone", "category", "animalType", "urgency", "location", "description", "status", "assignedTo", "latitude", "longitude", "createdAt"];
  const rows = reports.map((r) => ({
    id: r._id,
    name: r.name || r.reporterEmail || "Anonymous",
    phone: r.phone || "",
    category: r.category || "other",
    animalType: r.animalType || r.animalName || "Unknown",
    urgency: r.urgency || "medium",
    location: r.location,
    description: r.description || "",
    status: EXPORT_STATUS_MAP[r.status] || r.status,
    assignedTo: r.assignedTo || "",
    latitude: r.latitude ?? "",
    longitude: r.longitude ?? "",
    createdAt: new Date(r.createdAt).toISOString(),
  }));
  const csv = toCSV(headers, rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
  res.send(csv);
};

const exportUsers = async (_req, res) => {
  const users = await convexClient.query(anyApi.users.getAllUsers);
  const headers = ["uuid", "firstName", "lastName", "email", "phoneNumber", "role"];
  const rows = users.map((u) => ({
    uuid: u.uuid,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber,
    role: u.role,
  }));
  const csv = toCSV(headers, rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.send(csv);
};

const exportLogs = async (req, res) => {
  const { limit } = req.query;
  const result = await convexClient.query(anyApi.logs.getLogs, {
    limit: limit ? parseInt(limit, 10) : 1000,
  });
  const logs = result.logs || result || [];
  const headers = ["id", "eventType", "section", "ipAddress", "userId", "userAgent", "metadata", "sessionDuration", "createdAt"];
  const rows = (Array.isArray(logs) ? logs : []).map((l) => ({
    id: l._id,
    eventType: l.eventType,
    section: l.section || "",
    ipAddress: l.ipAddress,
    userId: l.userId || "",
    userAgent: l.userAgent || "",
    metadata: typeof l.metadata === "object" ? JSON.stringify(l.metadata) : (l.metadata || ""),
    sessionDuration: l.sessionDuration ?? "",
    createdAt: new Date(l.createdAt).toISOString(),
  }));
  const csv = toCSV(headers, rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=logs.csv");
  res.send(csv);
};

module.exports = { exportReports, exportUsers, exportLogs };
