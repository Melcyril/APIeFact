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
const postCategoryRoutes = require('./routes/post/postCategory');
const updateCategoryRoutes = require('./routes/update/updateCategory');
const getCategoryRoutes = require('./routes/get/getCategory');
const postProductRoutes = require('./routes/post/postProduct');
const getProductRoutes = require('./routes/get/getProduct');
const updateProductRoutes = require('./routes/update/updateProduct');
const deleteProductRoutes = require('./routes/delete/deleteProduct');
const postProduct_Image = require('./routes/post/postProduct_Image');
const getProduct_Image = require('./routes/get/getProduct_Image');
const updateProduct_Image = require('./routes/update/updateProduct_Image');
const deleteProduct_Image = require('./routes/delete/deleteProduct_Image');
const getProductWithImages = require('./routes/get/getProductWithImages');

const app = express();

// Middleware de sécurité et parsing
app.use(helmet());
app.use(globalLimiter);
app.use(bodyParser.json());
app.use(cookieParser());

// Routes API
app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/token/refresh', refreshTokenRoutes);
app.use('/api/updateUser', updateUserRoutes);
app.use('/api/deleteUser', deleteUserRoutes);
app.use('/api/category', getCategoryRoutes);
app.use('/api/postCategory', postCategoryRoutes);
app.use('/api/updateCategory', updateCategoryRoutes);
app.use('/api/product', getProductRoutes);
app.use('/api/postProduct', postProductRoutes);
app.use('/api/updateProduct', updateProductRoutes);
app.use('/api/deleteProduct', deleteProductRoutes);
app.use('/api/postProduct_image', postProduct_Image);
app.use('/api/product_image', getProduct_Image);
app.use('/api/updateProduct_image', updateProduct_Image);
app.use('/api/deleteProduct_image', deleteProduct_Image);
app.use('/api/product_with_images', getProductWithImages);

// Serveur
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
