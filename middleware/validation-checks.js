const { body } = require("express-validator");

exports.addApartmentValidate = [
  body("title").notEmpty().withMessage("Title must not be empty"),
  body("price")
    .notEmpty()
    .withMessage("Price must not be empty")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description").notEmpty().withMessage("Description must not be empty"),
];

exports.logInValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email field must not be empty.")
    .isEmail()
    .withMessage("Not a valid email."),
];

exports.signupValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email field must not be empty.")
    .isEmail()
    .withMessage("Not a valid email.")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 and 32 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
];
