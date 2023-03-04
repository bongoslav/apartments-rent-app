const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const favList = sequelize.define("favList", {  // not the best name...mby change later
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = favList;
