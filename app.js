const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const csrf = require("csrf");
const flash = require('express-flash')
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("./util/database");


// setting views/ejs
app.set("views", "views");
app.set("view engine", "ejs");
// setting static files
app.use(express.static("public"));
app.use(flash())

// --------- csrf -------- //
const tokens = new csrf();

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

// /------------ user ---------------/
app.use((req, res, next) => {
  // fixing logout error
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
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

// /----------- csrf protection -----------------/
app.use((req, res, next) => {
  res.locals.csrfToken = tokens.create(req.sessionID);
  next();
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
// models' associations
User.hasMany(Apartment);
favList.belongsTo(User);
favList.belongsTo(Apartment, { constraints: true, onDelete: "CASCADE" });
Apartment.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// add map functionality - check if there is gps data. if not -> do sth - ok
// validation & proper error handling
// add edit apartment functionality
// add pdf export
// improve UX/UI :(
// add pagination
// add ability to add multiple photos and scroll them

// ----------- error page middleware ----------
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).render("errors/500", {
    message: error.message,
    pageTitle: "Error",
    path: "/500",
    isLoggedIn: req.session.isLoggedIn,
  });
});

sequelize
  .sync()
  // .sync({ force: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
