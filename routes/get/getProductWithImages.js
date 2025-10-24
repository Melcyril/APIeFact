const express = require('express');
const { Product, Product_Image } = require('../../models');

const router = express.Router();

// 🔍 Récupérer un produit avec toutes ses images
router.get('/:id_product', async (req, res) => {
  try {
    const { id_product } = req.params;

    const product = await Product.findByPk(id_product, {
      include: [
        {
          model: Product_Image,
          as: 'images', // alias défini dans les associations
          attributes: ['id_image', 'image_url', 'is_principale']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit avec images :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
