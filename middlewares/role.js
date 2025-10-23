// role.js
module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.id_statut; // Récupéré depuis le token JWT dans req.user

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Accès refusé : rôle non autorisé.' });
    }

    next();
  };
};
