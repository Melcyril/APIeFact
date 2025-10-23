const express = require('express');
const { User } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.delete('/:id', authenticateToken, authorizeRoles(2, 3), async (req, res) => {
  try {
    const userId = req.params.id;

    // Si abonné, il ne peut supprimer que son compte
    if (req.user.id_statut === 2 && req.user.id_user.toString() !== userId) {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer un autre utilisateur." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    await user.destroy();

    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});


module.exports = router;
