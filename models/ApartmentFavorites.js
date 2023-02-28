const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ApartmentFavorites = sequelize.define("apartmentFavorites", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = ApartmentFavorites;
