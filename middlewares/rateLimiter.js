const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 tentatives par IP
    message: 'Trop de tentatives de connexion, réessayez plus tard.'
});
// ✅ Limiteur pour la route /register
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10,
    message: 'Trop de tentatives d’inscription. Réessayez plus tard.'
});
module.exports = {loginLimiter,registerLimiter};
