const express = require('express');
const { Favorite, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * Récupérer tous les produits favoris de l’utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { id_user: req.user.id_user },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id_product', 'nom', 'reference', 'prixHT', 'tva', 'prixTTC', 'stock'],
        },
      ],
    });

    res.json({
      count: favorites.length,
      favorites: favorites.map(fav => ({
        id_favorite: fav.id_favorite,
        id_product: fav.product.id_product,
        nom: fav.product.nom,
        prixTTC: fav.product.prixTTC,
      })),
    });
  } catch (error) {
    console.error('Erreur récupération favoris :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
