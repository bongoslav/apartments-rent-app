const Apartment = require("../models/apartment");
const favList = require("../models/favList");
const fs = require("fs");
const { validationResult } = require("express-validator");
const ExifImage = require("exif").ExifImage;

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
    path: "/home",
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
    errorMessage: null,
    validationErrorsArray: [],
    hasError: false,
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
    console.log(err);
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
      console.log(err);
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
    throw err;
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
    console.log("NO favList");
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
    throw err;
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
    throw err;
  }

  res.redirect("/my-apartments");
};
