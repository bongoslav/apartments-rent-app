const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Apartment = sequelize.define("apartment", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imagePath: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  imageThumbnailPath: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  latitude: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
});

module.exports = Apartment;
