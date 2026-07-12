const { honeypot } = require("../../src/middleware/honeypot");

describe("Honeypot middleware", () => {
  function mockReq(body) {
    return { body };
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

  it("passes when honeypot field is not present", () => {
    const req = mockReq({ email: "test@example.com", password: "secret" });
    const res = mockRes();
    let called = false;
    honeypot("website")(req, res, () => (called = true));
    expect(called).toBe(true);
  });

  it("passes when honeypot field is empty string", () => {
    const req = mockReq({ website: "", email: "test@example.com" });
    const res = mockRes();
    let called = false;
    honeypot("website")(req, res, () => (called = true));
    expect(called).toBe(true);
  });

  it("rejects when honeypot field is non-empty", () => {
    const req = mockReq({ website: "spam", email: "bot@example.com" });
    const res = mockRes();
    honeypot("website")(req, res, () => {});
    expect(res.state.statusCode).toBe(400);
    expect(res.state.body).toEqual({ message: "Invalid request." });
  });

  it("passes when body is undefined", () => {
    const req = mockReq(undefined);
    const res = mockRes();
    let called = false;
    honeypot("website")(req, res, () => (called = true));
    expect(called).toBe(true);
  });

  it("uses default field name from env", () => {
    process.env.HONEYPOT_FIELD = "url";
    const mw = honeypot();
    const req = mockReq({ url: "spam" });
    const res = mockRes();
    mw(req, res, () => {});
    expect(res.state.statusCode).toBe(400);
    delete process.env.HONEYPOT_FIELD;
  });

  it("uses custom field name when provided", () => {
    const req = mockReq({ homepage: "spam" });
    const res = mockRes();
    let called = false;
    honeypot("homepage")(req, res, () => {});
    expect(res.state.statusCode).toBe(400);
  });
});
