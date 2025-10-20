const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP. Réessayez plus tard.'
});

module.exports = globalLimiter;

//pour les tests   windowMs: 60 * 1000 (equivalent a 1 minute), max :5
// au bout de 5 tentatives il faut attendre 1 minute pour pouvour faire une requete
