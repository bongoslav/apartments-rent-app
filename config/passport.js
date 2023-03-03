const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find the user with the provided email
        let user = await User.findOne({ where: { email: email } });

        // If user is not found
        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // Check if password is correct
        let passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        // If everything is fine, return the user
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await User.findByPk(id);
    return done(null, user);
  } catch (error) {
    console.error(error);
    return done(error, null);
  }
});

module.exports = passport;
