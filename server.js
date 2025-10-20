const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const globalLimiter = require('./middlewares/serverLimiter');
const rateLimit = require('express-rate-limit');
const loginRoutes = require('./routes/post/login'); // Importer le fichier login.js
const registerRoutes = require('./routes/post/register');  // Route register
const profileRoutes = require('./routes/get/profile');  // Route register
dotenv.config();

const app = express();

// Sécurise les headers
app.use(helmet()); 
// 🛡️ Limiteur de requêtes global (optionnel, tu peux le mettre sur certaines routes aussi)
app.use(globalLimiter);
// Pour pouvoir parser le corps des requêtes en JSON
app.use(bodyParser.json());  

// Déclaration des routes
app.use('/api/login', loginRoutes);  // Route login
app.use('/api/register', registerRoutes);  // Route register
app.use('/api/profile',profileRoutes)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
