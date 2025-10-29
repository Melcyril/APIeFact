//index.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// ==================== Connexion ====================
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log, // utile pour déboguer les requêtes générées
  }
);

// ==================== Import des modèles ====================
const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Product_Image = require('./Product_Image')(sequelize, DataTypes);
const Cart = require('./Cart')(sequelize, DataTypes);
const Cart_Item = require('./Cart_Item')(sequelize, DataTypes);

// ==================== Associations ====================

// ----- Catégories et Produits -----
Category.hasMany(Product, {
  foreignKey: 'id_category',
  as: 'products',
  onDelete: 'CASCADE',
});
Product.belongsTo(Category, {
  foreignKey: 'id_category',
  as: 'category',
});

// ----- Produits et Images -----
Product.hasMany(Product_Image, {
  foreignKey: 'id_product',
  as: 'images',
});
Product_Image.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product',
});

// ----- Utilisateurs et Paniers -----
User.hasMany(Cart, {
  foreignKey: 'id_user',
  as: 'carts',
  onDelete: 'CASCADE',
});
Cart.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user',
});

// ----- Panier et Items -----
Cart.hasMany(Cart_Item, {
  foreignKey: 'id_cart',
  as: 'items',
});
Cart_Item.belongsTo(Cart, {
  foreignKey: 'id_cart',
  as: 'cart',
});

// ----- Produits et Items -----
Product.hasMany(Cart_Item, {
  foreignKey: 'id_product',
  as: 'cartItems',
});
Cart_Item.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product',
});

// ==================== Export ====================
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Product_Image,
  Cart,
  Cart_Item,
};
