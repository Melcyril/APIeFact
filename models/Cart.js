const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Cart = sequelize.define('Cart', {
  id_cart: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_user: { type: DataTypes.INTEGER, allowNull: false },
  date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'cart',
  timestamps: false
});

module.exports = Cart;
