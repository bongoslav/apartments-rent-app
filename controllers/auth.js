const bcrypr = require("bcrypt");
const User = require("../models/user");
const passport = require("../config/passport");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: req.isLoggedIn,
  });
};

exports.postLogin = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    // failureFlash: true,
  })(req, res, next);
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

// without passport:
// exports.postLogin = async (req, res, next) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ where: { email: email } });
//   if (user) {
//     const isMatch = await bcrypr.compare(password, user.password);
//     if (isMatch) {
//       req.session.user = user;
//       req.session.isLoggedIn = true;
//       return res.redirect("/");
//     }
//   } else {
//     // req.flash("error", "Invalid email or password");
//     res.redirect("/login");
//   }
// };
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    isLoggedIn: false,
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      console.log("user with such email already exists");
      res.redirect("/signup");
    }
  } catch (err) {
    console.log(err);
  }
  // should validate if passwords match
  // ...
  try {
    const hashedPassword = await bcrypr.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      favorites: { apartments: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};
