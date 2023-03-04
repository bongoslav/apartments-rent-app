const bcrypr = require("bcrypt");
const Favorites = require("../models/favList");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: req.isAuthenticated(),
  });
};

// exports.postLogin = async (req, res, next) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email: email });
//   if (user) {
//     const isMatch = await bcrypr.compare(password, user.password);
//     if (isMatch) {
//       req.session.user = user;
//       return res.redirect("/");
//     }
//   } else {
//     req.flash("error", "Invalid email or password");
//     res.redirect("/login");
//   }
// };

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    isLoggedIn: req.isAuthenticated(),
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
    console.log(user);
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};
