require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const globalLimiter = require('./middlewares/serverLimiter');

// Sequelize
const { sequelize } = require('./models');

// Routes
const loginRoutes = require('./routes/post/login');
const registerRoutes = require('./routes/post/register');
const profileRoutes = require('./routes/get/profile');
const refreshTokenRoutes = require('./routes/post/refreshToken');
const updateUserRoutes = require('./routes/update/updateUser');
const deleteUserRoutes = require('./routes/delete/deleteUser');

// Catégories
const postCategoryRoutes = require('./routes/post/postCategory');
const updateCategoryRoutes = require('./routes/update/updateCategory');
const getCategoryRoutes = require('./routes/get/getCategory');

// Produits
const postProductRoutes = require('./routes/post/postProduct');
const getProductRoutes = require('./routes/get/getProduct');
const updateProductRoutes = require('./routes/update/updateProduct');
const deleteProductRoutes = require('./routes/delete/deleteProduct');
const getTri = require('./routes/get/getTri');

//Produit par category
const getProductsByCategory = require('./routes/get/getProductsByCategory');

//Recherche par nom de produit, nom de categorie et marque
const getSearch = require('./routes/get/getSearch');

// Images produits
const postProduct_Image = require('./routes/post/postProduct_Image');
const getProduct_Image = require('./routes/get/getProduct_Image');
const updateProduct_Image = require('./routes/update/updateProduct_Image');
const deleteProduct_Image = require('./routes/delete/deleteProduct_Image');
const getProductWithImages = require('./routes/get/getProductWithImages');



// Panier
const postCart = require('./routes/post/postCart');
const getCart = require('./routes/get/getCart');
const updateCart = require('./routes/update/updateCart');
const deleteCart = require('./routes/delete/deleteCart');

// Commandes
const postOrder = require('./routes/post/postOrder');

// ❤️ Favoris
const postFavorite = require('./routes/post/postFavorite');
const getFavorite = require('./routes/get/getFavorite');
const deleteFavorite = require('./routes/delete/deleteFavorite');

//Mot de passe oublié
const forgotPasswordRoutes = require('./routes/post/forgotPassword');
const resetPasswordRoutes = require('./routes/post/resetPassword');

const app = express();

// 🔐 Middlewares de sécurité et parsing
app.use(helmet());
app.use(globalLimiter);
app.use(bodyParser.json());
app.use(cookieParser());

// 🌐 Routes API
app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/token/refresh', refreshTokenRoutes);
app.use('/api/updateUser', updateUserRoutes);
app.use('/api/deleteUser', deleteUserRoutes);

// Catégories
app.use('/api/category', getCategoryRoutes);
app.use('/api/postCategory', postCategoryRoutes);
app.use('/api/updateCategory', updateCategoryRoutes);

// Produits
app.use('/api/product', getProductRoutes);
app.use('/api/postProduct', postProductRoutes);
app.use('/api/updateProduct', updateProductRoutes);
app.use('/api/deleteProduct', deleteProductRoutes);

// Produits par categorie
app.use('/api/mycategory', getProductsByCategory);

//Search
app.use('/api/search', getSearch);

app.use('/api/products', getTri); // accès via /api/products?sort=prixHT&order=desc

// Images
app.use('/api/postProduct_image', postProduct_Image);
app.use('/api/product_image', getProduct_Image);
app.use('/api/updateProduct_image', updateProduct_Image);
app.use('/api/deleteProduct_image', deleteProduct_Image);
app.use('/api/product_with_images', getProductWithImages);

// Panier
app.use('/api/cart', postCart);
app.use('/api/cart', getCart);
app.use('/api/cart', updateCart);
app.use('/api/cart', deleteCart);

// Commandes
app.use('/api/order', postOrder);

// Favoris ❤️
app.use('/api/favorite', postFavorite);
app.use('/api/favorite', getFavorite);
app.use('/api/favorite', deleteFavorite);

//Mot de passe
app.use('/api/password/forgot', forgotPasswordRoutes);
app.use('/api/password/reset', resetPasswordRoutes);

// 🚀 Serveur
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion Sequelize réussie');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion Sequelize:', err);
  });
