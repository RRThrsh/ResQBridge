describe("CSRF check middleware", () => {
  let csrfCheck;

  beforeAll(async () => {
    process.env.FRONTEND_URL = "http://localhost:5173";
    csrfCheck = (await import("../../src/routes/report.js")).csrfCheck;
  });

  function mockReq(origin, referer) {
    return {
      get: (h) => (h === "origin" ? origin : h === "referer" ? referer : null),
    };
  }

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

  it("allows request with matching origin", () => {
    const req = mockReq("http://localhost:5173", null);
    const res = mockRes();
    let called = false;
    csrfCheck(req, res, () => (called = true));
    expect(called).toBe(true);
  });

  it("allows request with matching referer", () => {
    const req = mockReq(null, "http://localhost:5173/some-page");
    const res = mockRes();
    let called = false;
    csrfCheck(req, res, () => (called = true));
    expect(called).toBe(true);
  });

  it("blocks request with unknown origin", () => {
    const req = mockReq("https://evil.com", null);
    const res = mockRes();
    csrfCheck(req, res, () => {});
    expect(res.state.statusCode).toBe(403);
  });

  it("allows request without origin or referer", () => {
    const req = mockReq(null, null);
    const res = mockRes();
    let called = false;
    csrfCheck(req, res, () => (called = true));
    expect(called).toBe(true);
  });
});
