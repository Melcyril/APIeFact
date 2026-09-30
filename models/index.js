require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

const sequelize = env === 'test'
  ? new Sequelize('sqlite::memory:', { logging: false })
  : require('../config/db');

// ======================
// IMPORT MODELS
// ======================
const User = require('./User')(sequelize, DataTypes);
const Statut = require('./Statut')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Product_Image = require('./Product_Image')(sequelize, DataTypes);
const Cart = require('./Cart')(sequelize, DataTypes);
const Cart_Item = require('./Cart_Item')(sequelize, DataTypes);
const Delivery = require('./Delivery')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const Order_Item = require('./Order_Item')(sequelize, DataTypes);
const Payment_Method = require('./Payment_Method')(sequelize, DataTypes);
const Favorite = require('./Favorite')(sequelize, DataTypes);
const Password_Reset = require('./Password_Reset')(sequelize, DataTypes);

// ⭐ NEW MODEL
const Review = require('./Review')(sequelize, DataTypes);

// ======================
// ASSOCIATIONS
// ======================

// 🔐 Statut → User
Statut.hasMany(User, {
  foreignKey: 'id_statut',
  as: 'users'
});

User.belongsTo(Statut, {
  foreignKey: 'id_statut',
  as: 'statut'
});

// 📦 Category → Product
Category.hasMany(Product, {
  foreignKey: 'id_category',
  as: 'products',
  onDelete: 'CASCADE'
});

Product.belongsTo(Category, {
  foreignKey: 'id_category',
  as: 'category'
});

// 🖼️ Product → Images
Product.hasMany(Product_Image, {
  foreignKey: 'id_product',
  as: 'images'
});

Product_Image.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product'
});

// 🛒 User → Cart
User.hasMany(Cart, {
  foreignKey: 'id_user',
  as: 'carts',
  onDelete: 'CASCADE'
});

Cart.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

// 🧺 Cart → Items
Cart.hasMany(Cart_Item, {
  foreignKey: 'id_cart',
  as: 'items'
});

Cart_Item.belongsTo(Cart, {
  foreignKey: 'id_cart',
  as: 'cart'
});

// 📦 Product → Cart Items
Product.hasMany(Cart_Item, {
  foreignKey: 'id_product',
  as: 'cartItems'
});

Cart_Item.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product'
});

// 💳 Payment → Orders
Payment_Method.hasMany(Order, {
  foreignKey: 'id_payment_method',
  as: 'orders'
});

Order.belongsTo(Payment_Method, {
  foreignKey: 'id_payment_method',
  as: 'payment_method'
});

// 🚚 Delivery → Orders
Delivery.hasMany(Order, {
  foreignKey: 'id_delivery',
  as: 'orders'
});

Order.belongsTo(Delivery, {
  foreignKey: 'id_delivery',
  as: 'delivery'
});

// 👤 User → Orders
User.hasMany(Order, {
  foreignKey: 'id_user',
  as: 'orders'
});

Order.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

// 📦 Order → Items
Order.hasMany(Order_Item, {
  foreignKey: 'id_order',
  as: 'items'
});

Order_Item.belongsTo(Order, {
  foreignKey: 'id_order',
  as: 'order'
});

// 📦 Product → Order Items
Product.hasMany(Order_Item, {
  foreignKey: 'id_product',
  as: 'orderItems'
});

Order_Item.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product'
});

// ❤️ Favorites
User.hasMany(Favorite, {
  foreignKey: 'id_user',
  as: 'favorites',
  onDelete: 'CASCADE'
});

Favorite.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

Product.hasMany(Favorite, {
  foreignKey: 'id_product',
  as: 'favorites'
});

Favorite.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product'
});

// 🔑 Password reset
User.hasMany(Password_Reset, {
  foreignKey: 'id_user',
  as: 'password_resets'
});

Password_Reset.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

// ⭐ REVIEWS

// 👤 User → Reviews
User.hasMany(Review, {
  foreignKey: 'id_user',
  as: 'reviews',
  onDelete: 'CASCADE'
});

Review.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user'
});

// 📦 Product → Reviews
Product.hasMany(Review, {
  foreignKey: 'id_product',
  as: 'reviews',
  onDelete: 'CASCADE'
});

Review.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product'
});

// 🧾 Order → Reviews (corrigé)
Order.hasMany(Review, {
  foreignKey: 'id_order',
  as: 'order_reviews'
});

Review.belongsTo(Order, {
  foreignKey: 'id_order',
  as: 'order'
});

// ======================
// EXPORT
// ======================
module.exports = {
  sequelize,
  User,
  Statut,
  Category,
  Product,
  Product_Image,
  Cart,
  Cart_Item,
  Delivery,
  Order,
  Order_Item,
  Payment_Method,
  Favorite,
  Password_Reset,
  Review,
};