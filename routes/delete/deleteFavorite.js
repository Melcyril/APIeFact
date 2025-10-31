const express = require('express');
const { Favorite } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * Supprimer un produit des favoris de l’utilisateur connecté
 */
router.delete('/:id_product', authenticateToken, async (req, res) => {
  try {
    const { id_product } = req.params;

    const favorite = await Favorite.findOne({
      where: { id_user: req.user.id_user, id_product },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Produit non trouvé dans vos favoris' });
    }

    await favorite.destroy();

    res.json({ message: 'Produit retiré des favoris' });
  } catch (error) {
    console.error('Erreur suppression favori :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
