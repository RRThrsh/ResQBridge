const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const STORAGE_DIR = path.join(__dirname, "..", "..", "storage", "uploads");
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const ALLOWED_AUDIO = new Set([".webm", ".mp3", ".ogg", ".wav"]);

const MIME_MAP = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "audio/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
};

const ALLOWED_MIMES = new Set(Object.keys(MIME_MAP));

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIMES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.has(ext) || ALLOWED_AUDIO.has(ext);
  if (mimeOk && extOk) cb(null, true);
  else cb(new Error("Only images and audio files are allowed."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided." });

  const ext = MIME_MAP[req.file.mimetype] || path.extname(req.file.originalname).toLowerCase();
  const isAudio = ALLOWED_AUDIO.has(ext);

  if (isAudio) {
    const filename = `${uuidv4()}${ext}`;
    const outputPath = path.join(STORAGE_DIR, filename);
    fs.writeFileSync(outputPath, req.file.buffer);
    return res.json({ url: `/api/v1/public/files/${filename}` });
  }

  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
  const filename = `${uuidv4()}${safeExt}`;
  const outputPath = path.join(STORAGE_DIR, filename);

  try {
    await sharp(req.file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);
  } catch {
    return res.status(400).json({ message: "Invalid or corrupt image file." });
  }

  res.json({ url: `/api/v1/public/files/${filename}` });
};

const MIME_LOOKUP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".webm": "audio/webm",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
};

function serveFile(req, res) {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(STORAGE_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found." });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_LOOKUP[ext] || "application/octet-stream";

  if (!MIME_LOOKUP[ext]) {
    return res.status(403).json({ message: "Forbidden." });
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
}

module.exports = { upload, uploadImage, fileFilter, ALLOWED_EXTENSIONS, serveFile, STORAGE_DIR };
