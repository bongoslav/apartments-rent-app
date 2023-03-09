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

