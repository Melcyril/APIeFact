const express = require('express');
const { Favorite, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * Ajouter un produit aux favoris de l’utilisateur connecté
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id_product } = req.body;

    if (!id_product) {
      return res.status(400).json({ message: 'id_product requis' });
    }

    // Vérifie que le produit existe
    const product = await Product.findByPk(id_product);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifie si le favori existe déjà
    const existingFavorite = await Favorite.findOne({
      where: { id_user: req.user.id_user, id_product },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Produit déjà dans vos favoris' });
    }

    // Ajoute le favori
    const favorite = await Favorite.create({
      id_user: req.user.id_user,
      id_product,
    });

    res.status(201).json({
      message: 'Produit ajouté aux favoris',
      favorite: {
        id_favorite: favorite.id_favorite,
        id_product: product.id_product,
        nom: product.nom,
      },
    });
  } catch (error) {
    console.error('Erreur ajout favori :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
