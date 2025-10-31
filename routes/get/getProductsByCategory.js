const express = require('express');
const { Product, Category, Product_Image } = require('../../models');

const router = express.Router();

// GET /api/mycategory/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const products = await Product.findAll({
      where: { id_category: id },
      include: [
        { model: Category, as: 'category', attributes: ['nom'] }, // alias correct
        { model: Product_Image, as: 'images', attributes: ['image_url'] } // alias correct
      ]
    });

    if (!products.length) {
      return res.status(404).json({ message: 'Aucun produit trouvé pour cette catégorie.' });
    }

    res.json({ categoryId: id, products });
  } catch (error) {
    console.error('Erreur récupération produits par catégorie :', error);
    res.status(500).json({ message: 'Erreur interne serveur.', error: error.message });
  }
});

module.exports = router;
