import jwt from "jsonwebtoken";

const SECRET = "test-secret";
process.env.JWT_SECRET = SECRET;
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "/api/v1/auth/google/callback";

describe("SSO configuration", () => {
  it("passport strategy is configured when env vars are set", async () => {
    const passport = await import("../../src/config/passport.js");
    expect(passport).toBeDefined();
    const strategies = passport._strategies ? Object.keys(passport._strategies) : [];
    expect(strategies).toContain("google");
  });

  it("ssoCallback sets token cookie and redirects", async () => {
    const { ssoCallback } = await import("../../src/controllers/ssoController.js");

    let redirectUrl;
    const req = {};

    const res = {
      cookie: vi.fn(),
      redirect(url) {
        redirectUrl = url;
      },
    };

    req.user = {
      uuid: "sso-user-uuid",
      email: "sso@example.com",
      role: "rescuer",
      isNew: false,
    };

    ssoCallback(req, res);

    expect(res.cookie).toHaveBeenCalledWith("token", expect.any(String), {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    expect(redirectUrl).toContain("login?sso=success");
  });

  it("ssoCallback redirects to register for new users", async () => {
    const { ssoCallback } = await import("../../src/controllers/ssoController.js");

    let redirectUrl;
    const req = {};

    const res = {
      cookie: vi.fn(),
      redirect(url) {
        redirectUrl = url;
      },
    };

    req.user = {
      uuid: "new-sso-user",
      email: "new@example.com",
      role: "rescuer",
      isNew: true,
    };

    ssoCallback(req, res);

    expect(redirectUrl).toContain("register?sso=success");
  });

  it("ssoCallback redirects to login on failure when no user", async () => {
    const { ssoCallback } = await import("../../src/controllers/ssoController.js");

    let redirectUrl;
    const req = { user: null };

    const res = {
      cookie: vi.fn(),
      redirect(url) {
        redirectUrl = url;
      },
    };

    ssoCallback(req, res);

    expect(redirectUrl).toContain("login?error=sso_failed");
  });

  it("SSO routes are registered on the auth router", async () => {
    const authRoutes = await import("../../src/routes/auth.js");
    expect(authRoutes).toBeDefined();

    const stack = authRoutes.stack || [];
    const paths = stack
      .filter((r) => r.route)
      .map((r) => r.route.path);

    expect(paths).toContain("/google");
    expect(paths).toContain("/google/callback");
  });
});
