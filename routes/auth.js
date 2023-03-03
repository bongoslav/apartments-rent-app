const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/auth");
const authMiddleware = require('../middleware/auth')

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
  res.redirect("/");
});

module.exports = router;
