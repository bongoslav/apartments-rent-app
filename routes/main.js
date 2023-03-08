const express = require("express");
const router = express.Router();
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
router.post("/favorites", authMiddleware, mainControllers.postAddToFavorites);
router.get("/favorites", authMiddleware, mainControllers.getFavorites);
router.get("/my-apartments", authMiddleware, mainControllers.getMyApartments);
router.get("/apartments/:id", mainControllers.getApartment);
router.post(
  "/remove-favorite/:id",
  authMiddleware,
  mainControllers.postRemoveFromFavorites
);
router.post(
  "/delete-apartment/:id",
  authMiddleware,
  mainControllers.postDeleteApartment
);

module.exports = router;
