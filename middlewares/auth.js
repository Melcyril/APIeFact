const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'Accès interdit, token manquant.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré.' });
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
