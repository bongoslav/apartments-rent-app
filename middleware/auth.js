module.exports = function (req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  }
  res.status(401).redirect("/login");
};
