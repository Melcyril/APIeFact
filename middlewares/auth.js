const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Extraire le token depuis l'en-tête Authorization
    const token = req.header('Authorization')?.split(' ')[1];

    // Si aucun token n'est fourni, retourner un message d'erreur
    if (!token) {
        return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    // Vérifier si le token est valide
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Si le token est invalide ou expiré, retourner un message d'erreur
            return res.status(401).json({ message: 'Token expiré ou invalide' });
        }

        // Si le token est valide, ajouter les informations de l'utilisateur à la requête
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
