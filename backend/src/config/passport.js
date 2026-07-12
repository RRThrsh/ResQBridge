const passport = require("passport");

const { v4: uuidv4 } = require("uuid");
const convexClient = require("./convex");
const { anyApi } = require("convex/server");

function configureSSO() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return;
  }

  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
    scope: ["profile", "email"],
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("No email returned from Google."), null);
      }

      const existingUser = await convexClient.query(anyApi.users.getUserByEmail, { email });

      if (existingUser) {
        return done(null, {
          uuid: existingUser.uuid,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          role: existingUser.role,
          isNew: false,
        });
      }

      const userUuid = uuidv4();
      await convexClient.mutation(anyApi.users.createUser, {
        uuid: userUuid,
        firstName: profile.name?.givenName || "SSO",
        lastName: profile.name?.familyName || "User",
        phoneNumber: "",
        email,
        password: `sso:google:${profile.id}`,
        role: "rescuer",
      });

      return done(null, {
        uuid: userUuid,
        firstName: profile.name?.givenName || "SSO",
        lastName: profile.name?.familyName || "User",
        email,
        role: "rescuer",
        isNew: true,
      });
    } catch (err) {
      return done(err, null);
    }
  }));
}

configureSSO();

module.exports = passport;
