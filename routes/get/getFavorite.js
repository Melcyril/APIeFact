const express = require('express');
const { Favorite, Product, Category, Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * Récupérer les favoris de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { id_user: req.user.id_user },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            { model: Category, as: 'category', attributes: ['nom'] },
            {
              model: Product_Image,
              as: 'images',
              where: { is_principale: true },
              required: false
            }
          ]
        }
      ]
    });

    const formatted = favorites.map(fav => {
      const p = fav.product;

      const prixHT = parseFloat(p.prixHT || 0);
      const tva = parseFloat(p.tva || 0);
      const remise = parseFloat(p.remise || 0);

      // ✅ Prix TTC avant remise
      const prixTTCOriginal = prixHT * (1 + tva / 100);
      // ✅ Prix TTC après remise
      const prixTTC = prixTTCOriginal * (1 - remise / 100);

      return {
        id_favorite: fav.id_favorite,
        id_product: p.id_product,
        nom: p.nom,
        marque: p.marque,
        reference: p.reference,
        stock: p.stock,
        category: p.category?.nom || null,
        main_image_url: p.images?.[0]?.image_url || null,
        remise,
        prixTTCOriginal: +prixTTCOriginal.toFixed(2), // TTC avant remise
        prixTTC: +prixTTC.toFixed(2)                  // TTC après remise
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Erreur récupération favoris :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;