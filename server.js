require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const globalLimiter = require('./middlewares/serverLimiter');

// Sequelize
const { sequelize } = require('./models');

// Routes
const loginRoutes = require('./routes/post/login');
const registerRoutes = require('./routes/post/register');
const profileRoutes = require('./routes/get/profile');

const cookieParser = require('cookie-parser');
const refreshTokenRoutes = require('./routes/post/refreshToken');

const app = express();
app.use(helmet());
app.use(globalLimiter);
app.use(bodyParser.json());


// Middleware pour parser les cookies (obligatoire pour lire les cookies)
app.use(cookieParser());

app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/token/refresh', refreshTokenRoutes);

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
