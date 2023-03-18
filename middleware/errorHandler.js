module.exports = (error, req, res, next) => {
  console.error(error.stack);
  res.status(500).render("errors/500", {
    message: error.message,
    pageTitle: "Error",
    path: "/500",
    isLoggedIn: req.session.isLoggedIn,
  });
};
