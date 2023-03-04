const express = require("express");
const router = express.Router();
const passport = require("passport");
const mainControllers = require("../controllers/main");
const upload = require("../util/multerConfig");
const authMiddleware = require("../middleware/auth");

router.get("/", mainControllers.getIndex);
router.get("/add-apartment", authMiddleware, mainControllers.getAddApartment);
router.post(
  "/add-apartment",
  authMiddleware,
  upload.single("image"),
  mainControllers.postAddApartment
);
router.post(
  "/add-to-favorites",
  authMiddleware,
  mainControllers.postAddToFavorites
);

module.exports = router;
