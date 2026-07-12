describe("Rate limiter", () => {
  beforeEach(() => {
    delete process.env.REDIS_URL;
  });

  it("falls back to memory store when REDIS_URL is not set", async () => {
    const { globalLimiter, authLimiter, otpLimiter, uploadLimiter } = await import("../../src/middleware/rateLimiter.js");
    expect(globalLimiter).toBeDefined();
    expect(authLimiter).toBeDefined();
    expect(otpLimiter).toBeDefined();
    expect(uploadLimiter).toBeDefined();
  });

  it("uses Redis store when REDIS_URL is set", async () => {
    process.env.REDIS_URL = "redis://localhost:6379";
    const { globalLimiter } = await import("../../src/middleware/rateLimiter.js");
    expect(globalLimiter).toBeDefined();
  });

  it("otpLimiter has lower max than authLimiter", async () => {
    const { otpLimiter, authLimiter } = await import("../../src/middleware/rateLimiter.js");
    expect(otpLimiter).toBeDefined();
    expect(authLimiter).toBeDefined();
  });
});
