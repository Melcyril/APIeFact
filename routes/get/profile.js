const express = require('express');
const { User } = require('../../models'); // Import modèle Sequelize
const authenticateToken = require('../../middlewares/auth'); // middleware JWT, par ex.

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    // req.user.id_user est extrait du token par ton middleware d'authentification
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ['mot_de_passe'] } // Exclure le mot de passe
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
