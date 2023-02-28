const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Favorites = sequelize.define('favorites', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
});

module.exports = Favorites;
