module.exports = function (req, res, next) {
  if (req.session.isLoggedIn) {
    console.log("You are logged in (auth middleware)");
    return next();
  }
  res.status(401).redirect("/login");
};
