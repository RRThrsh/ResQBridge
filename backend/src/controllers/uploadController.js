const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file provided." });

  const ext = path.extname(req.file.originalname) || ".jpg";
  const filename = `${uuidv4()}${ext}`;
  const outputPath = path.join(UPLOAD_DIR, filename);

  await sharp(req.file.buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outputPath);

  res.json({ url: `/uploads/${filename}` });
};

module.exports = { upload, uploadImage };
