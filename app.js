const express = require("express");
const path = require("path");
const app = express();
const sequelize = require("./util/database");

// setting views/ejs
app.set("views", "views");
app.set("view engine", "ejs");
// setting static files
app.use(express.static("public"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

// routes
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

// models
const User = require("./models/user");
const Apartment = require("./models/apartment");
const Favorites = require("./models/favorites");
const ApartmentFavorites = require("./models/ApartmentFavorites");
// models' associations
User.hasMany(Apartment);
User.hasOne(Favorites);
Apartment.belongsToMany(Favorites, { through: ApartmentFavorites });

// TODO: add like button functionality + update in db
// associate apartment with user (main controller)
// add delete functionality if the apartment is user's
// add csrf token protection (or sth else)
// add login/signup functionality
// add map
// add map functionality

sequelize
  .sync()
  // .sync({ force: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
