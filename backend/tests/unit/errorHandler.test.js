const { AppError, errorHandler, asyncHandler } = await import("../../src/middleware/errorHandler.js");

describe("AppError", () => {
  it("creates an error with status code", () => {
    const err = new AppError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });
});

describe("errorHandler", () => {
  let res;

  beforeEach(() => {
    res = {
      state: {},
      status(code) {
        this.state.statusCode = code;
        return this;
      },
      json(data) {
        this.state.body = data;
      },
    };
  });

  it("returns operational error message and status", () => {
    const err = new AppError("Bad request", 400);
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(400);
    expect(res.state.body.message).toBe("Bad request");
  });

  it("returns 500 for unknown errors and hides details", () => {
    const err = new Error("Something broke");
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(500);
    expect(res.state.body.message).toBe("Internal server error.");
  });

  it("handles MulterError LIMIT_FILE_SIZE with 413", () => {
    const err = new Error("File too large");
    err.name = "MulterError";
    err.code = "LIMIT_FILE_SIZE";
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(413);
    expect(res.state.body.message).toBe("File too large.");
  });

  it("handles MulterError other codes with 400", () => {
    const err = new Error("Unexpected field");
    err.name = "MulterError";
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(400);
    expect(res.state.body.message).toBe("Unexpected field");
  });

  it("handles JWT errors with 401", () => {
    const err = new Error("jwt malformed");
    err.name = "JsonWebTokenError";
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(401);
    expect(res.state.body.message).toBe("Invalid or expired token.");
  });

  it("handles TokenExpiredError with 401", () => {
    const err = new Error("jwt expired");
    err.name = "TokenExpiredError";
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(401);
    expect(res.state.body.message).toBe("Invalid or expired token.");
  });
});

describe("asyncHandler", () => {
  it("catches errors and forwards to next", async () => {
    const fn = async () => {
      throw new Error("fail");
    };
    const wrapped = asyncHandler(fn);
    let nextCalled = false;
    await wrapped(null, null, (err) => {
      nextCalled = true;
      expect(err.message).toBe("fail");
    });
    expect(nextCalled).toBe(true);
  });

  it("passes through on success", async () => {
    const fn = async (req, res) => {
      res.success = true;
    };
    const wrapped = asyncHandler(fn);
    const req = {};
    const res = {};
    let nextCalled = false;
    await wrapped(req, res, () => {
      nextCalled = true;
    });
    expect(res.success).toBe(true);
    expect(nextCalled).toBe(false);
  });
});
