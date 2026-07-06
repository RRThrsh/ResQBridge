const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const ALLOWED_AUDIO = new Set([".webm", ".mp3", ".ogg", ".wav"]);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext) || ALLOWED_AUDIO.has(ext)) cb(null, true);
  else cb(new Error("Only images and audio files are allowed."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided." });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isAudio = ALLOWED_AUDIO.has(ext);

  if (isAudio) {
    const filename = `${uuidv4()}${ext}`;
    const outputPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(outputPath, req.file.buffer);
    return res.json({ url: `/uploads/${filename}` });
  }

  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
  const filename = `${uuidv4()}${safeExt}`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  try {
    await sharp(req.file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);
  } catch {
    return res.status(400).json({ message: "Invalid or corrupt image file." });
  }

  res.json({ url: `/uploads/${filename}` });
};

module.exports = { upload, uploadImage, fileFilter, ALLOWED_EXTENSIONS };
