require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Création de l'instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

// Importation des modèles
const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Product_Image = require('./Product_Image')(sequelize, DataTypes);


Category.hasMany(Product, { foreignKey: 'id_category' });
Product.belongsTo(Category, { foreignKey: 'id_category' });

Product.hasMany(Product_Image, { foreignKey: 'id_product', as: 'images' });
Product_Image.belongsTo(Product, { foreignKey: 'id_product', as: 'product' });

// Exportation de sequelize et des modèles
module.exports = {
  sequelize, // ✅ c’est CE qu’on veut utiliser dans server.js
  User,
  Category,
  Product,
  Product_Image,
};
