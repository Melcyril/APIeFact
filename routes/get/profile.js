const express = require('express');
const { User } = require('../../models'); // Import modèle Sequelize
const authenticateToken = require('../../middlewares/auth'); // middleware JWT, par ex.
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur existe dans la base de données
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ['mot_de_passe'] } // Exclure le mot de passe
    });

    if (!user) {
      // Si l'utilisateur n'existe pas, renvoyer 404
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // L'utilisateur existe, maintenant on vérifie les rôles
    authorizeRoles(2, 3)(req, res, () => {
      // Si tout est ok, renvoyer les infos de l'utilisateur
      res.json(user);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
