const Apartment = require("../models/apartment");
const favList = require("../models/favList");
const fs = require("fs");
const ExifImage = require("exif").ExifImage;

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
  });
};

exports.postAddApartment = async (req, res, next) => {
  const title = req.body.title;
  const imagePath = req.file.path;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user.id;
  try {
    new ExifImage({ image: imagePath }, (err, exifData) => {
      if (err) console.log(err);
      else {
        console.log(exifData);
      }
    });
  } catch (err) {
    console.log(err);
  }
  try {
    await Apartment.create({
      title: title,
      price: price,
      description: description,
      imagePath: imagePath,
      userId: userId,
    });
    res.redirect("/");
  } catch (err) {
    throw err;
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
