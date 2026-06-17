import jwt from "jsonwebtoken";

const SECRET = "test-secret";
process.env.JWT_SECRET = SECRET;

const { authenticate, authorize, checkOwnership } = await import("../../src/middleware/auth.js");

function mockReq(token, role) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    user: role ? { uuid: "user-uuid", role } : undefined,
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

describe("authenticate", () => {
  it("returns 401 when no token is provided", () => {
    const req = mockReq(null);
    const res = mockRes();
    authenticate(req, res, () => {});
    expect(res.state.statusCode).toBe(401);
    expect(res.state.body.message).toBe("Access denied. No token provided.");
  });

  it("returns 401 when token is invalid", () => {
    const req = mockReq("Bearer invalid-token");
    const res = mockRes();
    authenticate(req, res, () => {});
    expect(res.state.statusCode).toBe(401);
    expect(res.state.body.message).toBe("Invalid or expired token.");
  });

  it("calls next when token is valid", () => {
    const token = jwt.sign({ uuid: "abc", role: "user" }, SECRET);
    const req = mockReq(token);
    const res = mockRes();
    let called = false;
    authenticate(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
    expect(req.user.uuid).toBe("abc");
  });
});

describe("authorize", () => {
  it("returns 403 when role is not allowed", () => {
    const req = mockReq(null, "user");
    const res = mockRes();
    authorize("admin")(req, res, () => {});
    expect(res.state.statusCode).toBe(403);
  });

  it("calls next when role is allowed", () => {
    const req = mockReq(null, "admin");
    const res = mockRes();
    let called = false;
    authorize("admin", "superadmin")(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});

describe("checkOwnership", () => {
  it("returns 403 when uuid does not match", () => {
    const req = { user: { uuid: "user-1" }, params: { uuid: "user-2" } };
    const res = mockRes();
    checkOwnership((r) => r.params.uuid)(req, res, () => {});
    expect(res.state.statusCode).toBe(403);
  });

  it("calls next when uuid matches", () => {
    const req = { user: { uuid: "user-1" }, params: { uuid: "user-1" } };
    const res = mockRes();
    let called = false;
    checkOwnership((r) => r.params.uuid)(req, res, () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});
