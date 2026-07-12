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
  pending: "Pending",
  assigned: "Assigned",
  en_route: "En Route",
  in_progress: "In Progress",
  resolved: "Successful",
  failed: "Failed",
};

const REPORT_TYPE_MAP = {
  wildlife_sighting: "Wildlife Sighting",
  illegal_possession: "Illegal Wildlife Possession",
  human_wildlife_conflict: "Human–Wildlife Conflict",
};

const exportReports = async (_req, res) => {
  const reports = await convexClient.query(anyApi.reports.listReports);
  const assignedUuids = [...new Set(reports.map((r) => r.assignedTo).filter(Boolean))];
  const userMap = {};
  if (assignedUuids.length > 0) {
    const users = await Promise.all(
      assignedUuids.map((uuid) =>
        convexClient.query(anyApi.users.getUserByUuid, { uuid }).catch(() => null)
      )
    );
    for (const u of users) {
      if (u) userMap[u.uuid] = u;
    }
  }
  const headers = ["Report ID", "Name", "Phone Number", "Report Type", "Animal Type", "Landmark", "Description", "Status", "Assigned To", "Google Maps Link", "Created At", "Resolved At"];
  const rows = reports.map((r) => {
    const assignedUser = r.assignedTo ? userMap[r.assignedTo] : null;
    return {
      "Report ID": r._id,
      "Name": r.reporterEmail || "Anonymous",
      "Phone Number": r.phone ? `\t${r.phone}` : "",
      "Report Type": REPORT_TYPE_MAP[r.category] || r.category || "Other",
      "Animal Type": r.animalType,
      "Landmark": r.location,
      "Description": r.description || "",
      "Status": EXPORT_STATUS_MAP[r.status] || r.status,
      "Assigned To": assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName} (${assignedUser.phoneNumber})` : "",
      "Google Maps Link": r.latitude && r.longitude ? `=HYPERLINK("https://www.google.com/maps?q=${r.latitude},${r.longitude}","Click to Open in Google Maps")` : "",
      "Created At": new Date(r.createdAt).toISOString(),
      "Resolved At": r.resolvedAt ? new Date(r.resolvedAt).toISOString() : "",
    };
  });
  const csv = toCSV(headers, rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
  res.send(csv);
};

const exportUsers = async (_req, res) => {
  const users = await convexClient.query(anyApi.users.getAllUsers);
  const filtered = users.filter((u) => u.role !== "superadmin");
  const headers = ["uuid", "firstName", "lastName", "email", "phoneNumber", "role"];
  const rows = filtered.map((u) => ({
    uuid: u.uuid,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phoneNumber: u.phoneNumber ? `\t${u.phoneNumber}` : "",
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
  const logs = result.items || result || [];
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
