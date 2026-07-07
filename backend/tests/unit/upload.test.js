import multer from "multer";

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
});
