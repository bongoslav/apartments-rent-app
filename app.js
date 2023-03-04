const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("./util/database");

// setting views/ejs
app.set("views", "views");
app.set("view engine", "ejs");
// setting static files
app.use(express.static("public"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
// /----------- passport middleware -------------/
const passport = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // fixing logout error
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(async (user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("USER ERR:", err);
      // in async code snippets we don't throw but next()
      next(new Error(err));
    });
});

// /--------------- routes -------------/
const mainRoutes = require("./routes/main");
const authRotes = require("./routes/auth");
app.use("/", mainRoutes);
app.use("/", authRotes);

// /--------------- models -------------/
const User = require("./models/user");
const favList = require("./models/favList");
const Apartment = require("./models/apartment");
const { strategies } = require("./config/passport");
// models' associations
User.hasMany(Apartment);
favList.belongsTo(User);
favList.belongsTo(Apartment, { constraints: true, onDelete: "CASCADE" });
Apartment.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// TODO: add like button functionality + update in db
// add delete functionality if the apartment is user's
// add csrf token protection (or sth else)
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
