const bcrypr = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: null,
    oldInput: { email: null },
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email },
    });
  }

  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const isMatch = await bcrypr.compare(password, user.password);
      if (isMatch) {
        req.session.user = user;
        req.session.isLoggedIn = true;
        return req.session.save((err) => {
          return res.redirect("/");
        });
      } else {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          isLoggedIn: req.session.isLoggedIn,
          errorMessage: "Invalid email or password.",
          oldInput: { email: email },
        });
      }
    } else {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: "No user with such email.",
        oldInput: { email: email },
      });
    }
  } catch (err) {
    err = new Error("Login failed.");
    return next(err);
  }
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    isLoggedIn: false,
    email: null,
    errorMessage: null,
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign up",
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      email: email,
    });
  }

  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Sign up",
      isLoggedIn: req.session.isLoggedIn,
        errorMessage: "User with such email already exists.",
        email: email,
      });
    }
  } catch (err) {
    const error = new Error(err);
    return next(error);
  }
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
    const error = new Error(err);
    return next(error);
  }
};
