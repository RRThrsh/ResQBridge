const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const convexClient = require("../config/convex");
const { anyApi } = require("convex/server");
const { logEvent } = require("../middleware/logAudit");
const { notifyAdmin } = require("../services/adminNotification");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const URGENCY_MAP = {
  Healthy: "low",
  Injured: "high",
  Sick: "high",
  Trapped: "high",
  Unknown: "high",
};

const submitReport = async (req, res) => {
  const { name, phone, category, animalType, wildlifeCondition, location, description, latitude, longitude } = req.body;

  let urgency = URGENCY_MAP[wildlifeCondition] || "high";

  if (category === "illegal_possession" || category === "human_wildlife_conflict") {
    urgency = "high";
  }

  if (!phone || !animalType || !urgency || !location || !description) {
    return res.status(400).json({ message: "Phone, animal type, urgency, location, and description are required." });
  }

  const lat = latitude ? parseFloat(latitude) : undefined;
  const lng = longitude ? parseFloat(longitude) : undefined;

  const images = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const ext = path.extname(file.originalname) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const outputPath = path.join(UPLOAD_DIR, filename);
      await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outputPath);
      images.push(`/uploads/${filename}`);
    }
  }

  const metadata = {
    name: name || "Anonymous",
    phone,
    category: category || "other",
    animalType,
    wildlifeCondition,
    urgency,
    location,
    description,
    images,
  };

  await logEvent({ req, eventType: "report_animal", metadata });

  const clientIp = req.ip || req.connection?.remoteAddress || "unknown";

  await convexClient.mutation(anyApi.reports.insertReport, {
    name: name || "Anonymous",
    phone,
    category: category || "other",
    animalType,
    urgency,
    location,
    description,
    images: images.length > 0 ? images.join(",") : undefined,
    latitude: lat,
    longitude: lng,
    status: "pending",
    reporterIp: clientIp,
  });

  await notifyAdmin({
    type: "new_report",
    message: `New ${urgency} ${animalType} report from ${name || "Anonymous"} at ${location}`,
    link: "/admin/dashboard/reports",
  });

  res.status(201).json({ message: "Report submitted successfully.", images });
};

module.exports = { submitReport };
