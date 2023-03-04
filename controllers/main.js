const Apartment = require("../models/apartment");
const FavoritesList = require("../models/favorites");

exports.getIndex = async (req, res, next) => {
  const apartments = await Apartment.findAll();
  res.render("main/index", {
    pageTitle: "Home",
    path: "/home",
    apartments: apartments,
    user: req.user,  // TODO: pass user obj to all views for navigation to work properly
  });
};

exports.getAddApartment = async (req, res, next) => {
  res.render("main/add-edit-apartment", {
    pageTitle: "Add apartment",
    editing: false,
    path: "/add-apartment",
    errorMessage: null,
  });
};

// TODO: associate an apartment with a user (userId column)
// https://stackoverflow.com/questions/72499433/can-not-get-userid-in-sequelize
exports.postAddApartment = async (req, res, next) => {
  const title = req.body.title;
  const imagePath = req.file.path;
  const price = req.body.price;
  const description = req.body.description;
  try {
    const apartment = await Apartment.create({
      title: title,
      price: price,
      description: description,
      imagePath: imagePath,
    });
    res.redirect("/");
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

exports.postAddToFavorites = async (req, res, next) => {
  const apartmentId = req.body.id;
  const userId = req.user.id;
  const apartment = await Apartment.findByPk(apartmentId);
  const favoritesList = await FavoritesList.findOrCreate({
    where: { UserId: userId },
  });
  console.log(favoritesList);
};
