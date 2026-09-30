require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const globalLimiter = require('./middlewares/serverLimiter');
const cors = require('cors');
const path = require('path'); // ⚡ nécessaire pour le chemin absolu

// Sequelize
const { sequelize } = require('./models');

// Routes utilisateur
const loginRoutes = require('./routes/post/login');
const logoutRoutes= require('./routes/post/logout');
const registerRoutes = require('./routes/post/register');
const profileRoutes = require('./routes/get/profile');
const refreshTokenRoutes = require('./routes/post/refreshToken');
const updateUserRoutes = require('./routes/update/updateUser');
const deleteUserRoutes = require('./routes/delete/deleteUser');

// Routes catégories
const postCategoryRoutes = require('./routes/post/postCategory');
const updateCategoryRoutes = require('./routes/update/updateCategory');
const getCategoryActivesRoutes = require('./routes/get/getCategoryActives');
const getCategoryRoutes = require('./routes/get/getCategory');
const getCategoryById = require('./routes/get/getCategoryById');
const deleteCategoryRoutes = require('./routes/delete/deleteCategory');

// Routes produits
const postProductRoutes = require('./routes/post/postProduct');
const getProductRoutes = require('./routes/get/getProduct');
const updateProductRoutes = require('./routes/update/updateProduct');
const deleteProductRoutes = require('./routes/delete/deleteProduct');
//const getTri = require('./routes/get/getTri');
//const getProductsByCategory = require('./routes/get/getProductsByCategory');
//const getSearch = require('./routes/get/getSearch');
const getProductsFiltered = require('./routes/get/getProductsFiltered');
const getProductsPriceRange=require('./routes/get/getProductsPriceRange')
const getPromotions=require('./routes/get/getPromotions')
const getNews=require('./routes/get/getNews.js')

// Routes images produits
const postProduct_Image = require('./routes/post/postProduct_Image');
//const getProduct_Image = require('./routes/get/getProduct_Image');
const updateProduct_Image = require('./routes/update/updateProduct_Image');
const deleteProduct_Image = require('./routes/delete/deleteProduct_Image');
const getProductWithImages = require('./routes/get/getProductWithImages');
//const getProductMainImage = require('./routes/get/getProductMainImage');
const getProductById= require('./routes/get/getProductById');

// Routes panier
const postCart = require('./routes/post/postCart');
const postCartMerge = require('./routes/post/postCartMerge');
const getCart = require('./routes/get/getCart');
const updateCart = require('./routes/update/updateCart');
const deleteCart = require('./routes/delete/deleteCart');
const deleteCartAll = require('./routes/delete/deleteAllCart');

// Routes commandes
const postOrder = require('./routes/post/postOrder');
const getOrder = require('./routes/get/getOrder');
const getOrdersAdmin = require('./routes/get/getOrdersAdmin');

// Routes méthodes de paiement
const getPaymentMethod=require('./routes/get/getPaymentMethod');

// Routes méthodes de livraison
const getDelivery = require('./routes/get/getDelivery');


// Routes favoris
const postFavorite = require('./routes/post/postFavorite');
const getFavorite = require('./routes/get/getFavorite');
const deleteFavorite = require('./routes/delete/deleteFavorite');

// Routes mot de passe
const forgotPasswordRoutes = require('./routes/post/forgotPassword');
const resetPasswordRoutes = require('./routes/post/resetPassword');

// Routes statistiques
const getStatistiques = require('./routes/get/getStatistiques');

// Route Review(Avis)
const postReview = require('./routes/post/postReview');
const getReview = require('./routes/get/getReview');
const deleteReview = require('./routes/delete/deleteReview');
const canReview = require('./routes/get/getCanReview');

const app = express();

// 🔐 Sécurité & middlewares globaux
app.use(helmet());

// 🌐 CORS global pour Angular
// 🌐 CORS global pour Angular
app.use(cors({
  origin: 'http://localhost:4200', // ton frontend exact
  credentials: true               // 🔑 permet l'envoi des cookies
}));

app.use(globalLimiter);
app.use(bodyParser.json());
app.use(cookieParser());

// 📁 Servir le dossier uploads avec chemin absolu et CORS
app.use('/uploads',(req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // 🔥 OBLIGATOIRE
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// 🌐 Routes API
app.use('/api/login', loginRoutes);
app.use('/api/logout',logoutRoutes)
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);

app.use('/api/refresh-token', refreshTokenRoutes);
app.use('/api/updateUser', updateUserRoutes);
app.use('/api/deleteUser', deleteUserRoutes);

app.use('/api/category/actives', getCategoryActivesRoutes);
app.use('/api/category/all', getCategoryRoutes);
app.use('/api/category', getCategoryById);
app.use('/api/postCategory', postCategoryRoutes);
app.use('/api/updateCategory', updateCategoryRoutes);
app.use('/api/deleteCategory', deleteCategoryRoutes);

app.use('/api/product', getProductById);
app.use('/api/postProduct', postProductRoutes);
app.use('/api/updateProduct', updateProductRoutes);
app.use('/api/deleteProduct', deleteProductRoutes);
//app.use('/api/products', getTri);
//app.use('/api/mycategory', getProductsByCategory);
//app.use('/api/search', getSearch);
app.use('/api/productsFiltered', getProductsFiltered);
app.use('/api/productsPriceRange', getProductsPriceRange);
//app.use('/api/productById', getProductById);
app.use('/api/productNews', getNews);
app.use('/api/productPromo',getPromotions);

app.use('/api/postProduct_image', postProduct_Image);
//app.use('/api/product_image', getProduct_Image);
app.use('/api/updateProduct_image', updateProduct_Image);
app.use('/api/deleteProduct_image', deleteProduct_Image);
app.use('/api/product_with_images', getProductWithImages);
//app.use('/api/product_main_image', getProductMainImage);


app.use('/api/cart', getCart);
app.use('/api/cart', postCart);
app.use('/api/cart', updateCart);
app.use('/api/cart', deleteCart);
app.use('/api/cart', deleteCartAll);
app.use('/api/cart/merge', postCartMerge);

app.use('/api/postOrder', postOrder);
app.use('/api/getOrder', getOrder);
app.use('/api/getOrders/admin', getOrdersAdmin)

app.use('/api/payment-methods',getPaymentMethod)

app.use('/api/delivery-methods', getDelivery);

app.use('/api/favorite', postFavorite);
app.use('/api/favorite', getFavorite);
app.use('/api/favorite', deleteFavorite);

app.use('/api/password/forgot', forgotPasswordRoutes);
app.use('/api/password/reset', resetPasswordRoutes);

app.use('/api/statistiques', getStatistiques);

app.use('/api/review', postReview);
app.use('/api/review', getReview);
app.use('/api/review', deleteReview);
app.use('/api/review', canReview);

// Vérification de la santé du serveur
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 🚀 Lancement du serveur
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
    process.exit(1);
  });
