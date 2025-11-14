require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import des modèles
const User = require('./User')(sequelize, DataTypes);
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

// Associations

// Catégories → Produits
Category.hasMany(Product, { foreignKey: 'id_category', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'id_category', as: 'category' });

// Produits → Images
Product.hasMany(Product_Image, { foreignKey: 'id_product', as: 'images' });
Product_Image.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });

// Utilisateurs → Paniers
User.hasMany(Cart, { foreignKey: 'id_user', as: 'carts', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

// Panier → Items
Cart.hasMany(Cart_Item, { foreignKey: 'id_cart', as: 'items' });
Cart_Item.belongsTo(Cart, { foreignKey: 'id_cart', as: 'cart' });

// Produits → Items
Product.hasMany(Cart_Item, { foreignKey: 'id_product', as: 'cartItems' });
Cart_Item.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });

// Paiement → Commandes
Payment_Method.hasMany(Order, { foreignKey: 'id_payment_method', as: 'orders' });
Order.belongsTo(Payment_Method, { foreignKey: 'id_payment_method', as: 'payment_method' });

// Livraison → Commandes
Delivery.hasMany(Order, { foreignKey: 'id_delivery', as: 'orders' });
Order.belongsTo(Delivery, { foreignKey: 'id_delivery', as: 'delivery' });

// Utilisateur → Commandes
User.hasMany(Order, { foreignKey: 'id_user', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

// Commande → Order_Items
Order.hasMany(Order_Item, { foreignKey: 'id_order', as: 'items' });
Order_Item.belongsTo(Order, { foreignKey: 'id_order', as: 'order' });

// Produit → Order_Items
Product.hasMany(Order_Item, { foreignKey: 'id_product', as: 'orderItems' });
Order_Item.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });


// Utilisateur → Favoris
User.hasMany(Favorite, { foreignKey: 'id_user', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

// Produit → Favoris
Product.hasMany(Favorite, { foreignKey: 'id_product', as: 'favorites' });
Favorite.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });

// Utilisateur → Password_Reset
User.hasMany(Password_Reset, { foreignKey: 'id_user', as: 'password_resets' });
Password_Reset.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

// Export
module.exports = {
  sequelize,
  User,
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
};
