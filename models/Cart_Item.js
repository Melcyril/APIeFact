const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Cart = require('./Cart');
const Product = require('./Product');

const CartItem = sequelize.define('CartItem', {
  id_cart_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cart: { type: DataTypes.INTEGER, allowNull: false },
  id_product: { type: DataTypes.INTEGER, allowNull: false },
  quantite: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'cart_item',
  timestamps: false
});

// Associations
Cart.hasMany(CartItem, { foreignKey: 'id_cart' });
CartItem.belongsTo(Cart, { foreignKey: 'id_cart' });
Product.hasMany(CartItem, { foreignKey: 'id_product' });
CartItem.belongsTo(Product, { foreignKey: 'id_product' });

module.exports = CartItem;
