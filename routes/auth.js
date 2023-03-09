const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/validation-checks");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  authMiddleware.signupValidation,
  authController.postSignup
);
router.post("/login", authMiddleware.logInValidation, authController.postLogin);
router.post("/logout", authController.postLogout);

module.exports = router;
