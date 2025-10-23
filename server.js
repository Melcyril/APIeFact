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
