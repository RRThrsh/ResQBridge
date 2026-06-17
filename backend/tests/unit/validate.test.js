const { validate } = await import("../../src/middleware/validate.js");

describe("validate", () => {
  function mockRes() {
    const state = { statusCode: null, body: null };
    return {
      state,
      status(code) {
        state.statusCode = code;
        return this;
      },
      json(data) {
        state.body = data;
      },
    };
  }

  it("calls next when no validation errors", () => {
    const req = {};
    const res = mockRes();
    let nextCalled = false;
    validate(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
