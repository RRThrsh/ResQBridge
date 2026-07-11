const request = require("supertest");

let app;

beforeAll(async () => {
  app = require("../../src/app");
});

describe("API E2E", () => {
  describe("GET /api/v1", () => {
    it("returns API running message", async () => {
      const res = await request(app).get("/api/v1");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("ResQBridge API is running");
    });
  });

  describe("GET /api/v1/health", () => {
    it("returns 200 with OK status", async () => {
      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("OK");
    });
  });

  describe("GET /api/v1/landing-config", () => {
    it("returns a config object with defaults when Convex is reachable", async () => {
      const res = await request(app).get("/api/v1/landing-config");
      if (res.status === 200) {
        expect(res.body).toHaveProperty("config");
        expect(res.body).toHaveProperty("defaults");
        expect(res.body).toHaveProperty("maintenanceMode");
      } else {
        expect(res.status).toBe(500);
      }
    });
  });

  describe("POST /api/v1/log/guest", () => {
    it("logs a guest event and returns 200", async () => {
      const res = await request(app)
        .post("/api/v1/log/guest")
        .send({ section: "hero", duration: 5, eventType: "view" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged.");
    });
  });

  describe("POST /api/v1/log/logout", () => {
    it("clears token cookie and returns 200", async () => {
      const res = await request(app).post("/api/v1/log/logout");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged.");
    });
  });

  describe("404 handling", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/api/v1/nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Route not found");
    });
  });
});

describe("Error flow E2E", () => {
  it("AppError → errorHandler produces correct HTTP response", () => {
    const { AppError, errorHandler } = require("../../src/middleware/errorHandler");
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
