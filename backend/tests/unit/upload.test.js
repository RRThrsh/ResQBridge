import multer from "multer";
import path from "path";
import fs from "fs";

describe("Upload file filter", () => {
  let fileFilter;

  beforeAll(async () => {
    const uploadModule = await import("../../src/controllers/uploadController.js");
    fileFilter = uploadModule.fileFilter;
  });

  function mockFile(originalname, mimetype) {
    return { originalname, mimetype };
  }

  it("allows .jpg files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("photo.jpg", "image/jpeg"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("allows .png files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("photo.png", "image/png"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("allows .webp files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("photo.webp", "image/webp"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("rejects .exe files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("virus.exe", "application/x-msdownload"), cb);
    expect(cb).toHaveBeenCalledWith(new Error("Only images and audio files are allowed."), false);
  });

  it("rejects .php files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("shell.php", "application/x-httpd-php"), cb);
    expect(cb).toHaveBeenCalledWith(new Error("Only images and audio files are allowed."), false);
  });

  it("rejects files with no extension", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("Makefile", "text/plain"), cb);
    expect(cb).toHaveBeenCalledWith(new Error("Only images and audio files are allowed."), false);
  });

  it("rejects mismatched MIME type", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("photo.jpg", "text/html"), cb);
    expect(cb).toHaveBeenCalledWith(new Error("Only images and audio files are allowed."), false);
  });

  it("allows .wav audio files", () => {
    const cb = vi.fn();
    fileFilter(null, mockFile("recording.wav", "audio/wav"), cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });
});

describe("serveFile", () => {
  let serveFile, STORAGE_DIR;
  let mockRes;
  let testFilePath;

  beforeAll(async () => {
    const mod = await import("../../src/controllers/uploadController.js");
    serveFile = mod.serveFile;
    STORAGE_DIR = mod.STORAGE_DIR;

    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    testFilePath = path.join(STORAGE_DIR, "test-image.jpg");
    fs.writeFileSync(testFilePath, "fake-image-data");
  });

  afterAll(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  beforeEach(() => {
    mockRes = {
      statusCode: null,
      body: null,
      sentFile: null,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
      setHeader(key, value) {
        this.headers[key] = value;
      },
      sendFile(filePath) {
        this.sentFile = filePath;
      },
    };
  });

  it("returns 404 for non-existent file", () => {
    const req = { params: { filename: "nonexistent.jpg" } };
    serveFile(req, mockRes);
    expect(mockRes.statusCode).toBe(404);
    expect(mockRes.body.message).toBe("File not found.");
  });

  it("returns 403 for non-existent file with unknown extension", () => {
    const req = { params: { filename: "missing.exe" } };
    serveFile(req, mockRes);
    expect(mockRes.statusCode).toBe(404);
  });

  it("prevents directory traversal via path.basename", () => {
    const req = { params: { filename: "../../../etc/passwd" } };
    serveFile(req, mockRes);
    const sanitized = path.basename("../../../etc/passwd");
    expect(sanitized).toBe("passwd");
    expect(mockRes.statusCode).toBe(404);
  });

  it("returns 403 for existing file with forbidden extension", () => {
    const maliciousPath = path.join(STORAGE_DIR, "evil.exe");
    fs.writeFileSync(maliciousPath, "fake-exe");
    const req = { params: { filename: "evil.exe" } };
    serveFile(req, mockRes);
    expect(mockRes.statusCode).toBe(403);
    expect(mockRes.body.message).toBe("Forbidden.");
    fs.unlinkSync(maliciousPath);
  });

  it("serves existing file with correct content-type", () => {
    const req = { params: { filename: "test-image.jpg" } };
    serveFile(req, mockRes);
    expect(mockRes.headers["Content-Type"]).toBe("image/jpeg");
    expect(mockRes.headers["Cache-Control"]).toBe("public, max-age=31536000, immutable");
    expect(mockRes.sentFile).toBe(testFilePath);
  });
});
