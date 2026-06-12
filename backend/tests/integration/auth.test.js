const { AppError, errorHandler } = await import("../../src/middleware/errorHandler.js");

describe("Auth API integration", () => {
  it("errorHandler returns consistent JSON shape", () => {
    const res = {
      state: {},
      status(code) {
        this.state.statusCode = code;
        return this;
      },
      json(data) {
        this.state.body = data;
      },
    };
    const err = new AppError("Unauthorized", 401);
    errorHandler(err, null, res, null);
    expect(res.state.statusCode).toBe(401);
    expect(res.state.body.message).toBe("Unauthorized");
  });
});
