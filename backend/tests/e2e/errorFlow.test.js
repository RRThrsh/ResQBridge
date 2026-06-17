const { AppError, errorHandler, asyncHandler } = await import("../../src/middleware/errorHandler.js");

describe("Error flow E2E", () => {
  it("AppError → errorHandler produces correct HTTP response", () => {
    const err = new AppError("Custom error", 422);
    const res = {
      _status: 0,
      _body: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(data) {
        this._body = data;
      },
    };
    errorHandler(err, null, res, null);
    expect(res._status).toBe(422);
    expect(res._body).toEqual({ message: "Custom error" });
  });
});
