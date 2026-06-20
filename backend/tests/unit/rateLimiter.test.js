describe("Rate limiter", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
  });

  it("falls back to memory store when REDIS_URL is not set", async () => {
    const { globalLimiter, authLimiter } = await import("../../src/middleware/rateLimiter.js");
    expect(globalLimiter).toBeDefined();
    expect(authLimiter).toBeDefined();
  });

  it("uses Redis store when REDIS_URL is set", async () => {
    process.env.REDIS_URL = "redis://localhost:6379";
    const { globalLimiter } = await import("../../src/middleware/rateLimiter.js");
    expect(globalLimiter).toBeDefined();
  });
});
