const Apartment = require("../models/apartment");
const favList = require("../models/favList");
const fs = require("fs");
const { validationResult } = require("express-validator");
const ExifImage = require("exif").ExifImage;
const imageThumbnail = require("image-thumbnail");
const path = require("path");

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  }
  return dd;
}

function getLatLongDecimals(lat, long, latRef, longRef) {
  // Calculate latitude decimal
  const latMinute = lat[1];
  const latDegree = lat[0];
  const latSecond = lat[2];
  const latFinal = ConvertDMSToDD(latDegree, latMinute, latSecond, latRef);

  // Calculate longitude decimal
  const lonDegree = long[0];
  const lonMinute = long[1];
  const lonSecond = long[2];
  const lonFinal = ConvertDMSToDD(lonDegree, lonMinute, lonSecond, longRef);
  return [latFinal, lonFinal];
}

exports.getIndex = async (req, res, next) => {
  const apartments = await Apartment.findAll();
  res.render("main/index", {
    pageTitle: "Home",
    path: "/",
    apartments: apartments,
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.getAddApartment = async (req, res, next) => {
  res.render("main/add-edit-apartment", {
    pageTitle: "Add apartment",
    editing: false,
    path: "/add-apartment",
    errorMessage: null,
    isLoggedIn: req.session.isLoggedIn,
    validationErrorsArray: [],
  });
};

exports.postAddApartment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("main/add-edit-apartment", {
      pageTitle: "Add apartment",
      editing: false,
      path: "/add-apartment",
      errorMessage: errors.array()[0].msg,
      isLoggedIn: req.session.isLoggedIn,
      apartment: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
      },
    });
  }
  const title = req.body.title;
  const image = req.file;
  if (!image) {
    const error = new Error("No uploaded image.");
    error.httpStatusCode = 500;
    return next(error);
  }
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user.id;
  let decCords;
  let latitude;
  let longitude;

  const imagePath = image.path;
  let imageThumbnailPath;
  try {
    const thumbnail = await imageThumbnail(imagePath, { percentage: 5 });
    const thumbnailName = "thumb-" + req.file.filename;
    imageThumbnailPath = path.join("images", "thumbnails", thumbnailName);
    fs.writeFileSync(imageThumbnailPath, thumbnail);
  } catch (err) {
    const error = new Error("Image thumbnail error.");
    error.httpStatusCode = 500;
    return next(error);
  }

  try {
    new ExifImage({ image: imagePath }, async (err, exifData) => {
      if (err) {
        const error = new Error("No coordinates in photo found.");
        error.httpStatusCode = 500;
        return next(error);
      } else {
        const originalLatitude = exifData.gps.GPSLatitude;
        const originalLongitude = exifData.gps.GPSLongitude;
        const latRef = exifData.gps.GPSLatitudeRef;
        const longRef = exifData.gps.GPSLongitudeRef;

        decCords = getLatLongDecimals(
          originalLatitude,
          originalLongitude,
          latRef,
          longRef
        );
        latitude = decCords[0];
        longitude = decCords[1];
      }
      try {
        await Apartment.create({
          title: title,
          price: price,
          description: description,
          imagePath: imagePath,
          imageThumbnailPath: imageThumbnailPath,
          userId: userId,
          latitude: latitude,
          longitude: longitude,
        });
        res.redirect("/");
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditApartment = async (req, res, next) => {
  try {
    const apartmentId = req.params.id;
    const apartment = await Apartment.findByPk(apartmentId);
    const isLoggedIn = req.session.isLoggedIn;
    let userId;

    if (isLoggedIn) {
      userId = req.user.id;
      const favorite = await favList.findOne({
        where: { userId: userId, apartmentId: apartmentId },
      });
    }
    res.render("main/add-edit-apartment", {
      pageTitle: "Edit apartment",
      path: `/edit-apartment/${apartmentId}`,
      isLoggedIn: req.session.isLoggedIn,
      apartment: apartment,
      editing: true,
      errorMessage: null,
      validationErrorsArray: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditApartment = async (req, res, next) => {
  const apartmentId = req.body.apartmentId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("main/add-edit-apartment", {
      pageTitle: "Edit apartment",
      path: "/edit-apartment",
      editing: true,
      isLoggedIn: req.session.isLoggedIn,
      apartment: {
        id: apartmentId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  const apartment = await Apartment.findByPk(apartmentId);
  apartment.title = updatedTitle;
  apartment.price = updatedPrice;
  apartment.description = updatedDesc;
  if (image) {
    fileHelper.deleteFile(apartment.imageUrl);
    apartment.imageUrl = image.path;
  }
  try {
    return apartment.save().then((result) => {
      res.redirect("/my-apartments");
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddToFavorites = (req, res, next) => {
  const apartmentId = req.body.apartmentId;
  const userId = req.user.id;

  favList
    .create({ userId, apartmentId })
    .then((favorite) => {
      res.redirect("/favorites");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postRemoveFromFavorites = async (req, res, next) => {
  const apartmentId = req.params.id;

  try {
    await favList.destroy({
      where: {
        apartmentId: apartmentId,
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
  res.redirect("/");
};

exports.getFavorites = async (req, res, next) => {
  const user = req.user;
  const favorites = await favList.findAll({
    where: {
      userId: user.id,
    },
    include: Apartment,
  });
  if (!favorites) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
  res.render("main/favorites", {
    pageTitle: "Favorite Apartments",
    path: "/favorites",
    favorites: favorites,
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.getMyApartments = async (req, res, next) => {
  const userId = req.user.id;
  const apartments = await Apartment.findAll({
    where: { userId: userId },
  });
  res.render("main/my-apartments", {
    pageTitle: "My apartments",
    path: "/my-apartments",
    isLoggedIn: req.session.isLoggedIn,
    apartments: apartments,
  });
};

exports.getApartment = async (req, res, next) => {
  try {
    const apartmentId = req.params.id;
    const apartment = await Apartment.findByPk(apartmentId);
    const isLoggedIn = req.session.isLoggedIn;
    let isFavorite;
    let userId;

    if (isLoggedIn) {
      userId = req.user.id;
      const favorite = await favList.findOne({
        where: { userId: userId, apartmentId: apartmentId },
      });
      isFavorite = !!favorite;
    }
    res.render("main/apartment", {
      pageTitle: apartment.title,
      path: `/apartments/${apartmentId}`,
      isLoggedIn: req.session.isLoggedIn,
      apartment: apartment,
      isFavorite: isFavorite,
      userId: userId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteApartment = async (req, res, next) => {
  const apartmentId = req.params.id;
  const apartment = await Apartment.findByPk(apartmentId);
  fs.unlink(apartment.imagePath, (err) => {
    if (err) throw err;
    else {
      console.log("Deleted image.");
    }
  });

  try {
    await Apartment.destroy({
      where: { id: apartmentId },
    });
    console.log(`Apartment ${apartment.title} deleted from db.`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  res.redirect("/my-apartments");
};
