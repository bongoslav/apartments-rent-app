const express = require("express");
const router = express.Router();
const mainControllers = require("../controllers/main");
const upload = require("../util/multerConfig");

router.get("/", mainControllers.getIndex);
router.get("/add-apartment", mainControllers.getAddApartment);
router.post(
  "/add-apartment",
  upload.single("image"),
  mainControllers.postAddApartment
);

module.exports = router;
