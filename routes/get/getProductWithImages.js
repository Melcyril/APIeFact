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
          as: 'images',
          attributes: ['id_image', 'image_url', 'is_principale']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const normalizedProduct = product.toJSON();

    // 🔄 Normalisation des chemins Windows -> Unix
    if (normalizedProduct.images) {
      normalizedProduct.images = normalizedProduct.images.map(img => ({
        ...img,
        image_url: img.image_url.replace(/\\/g, '/')
      }));
    }

    // 🔥 CALCULS PRIX
    const prixHT = Number(normalizedProduct.prixHT) || 0;
    const tva = Number(normalizedProduct.tva) || 0;
    const remise = Number(normalizedProduct.remise) || 0;

    const prixTTC = prixHT * (1 + tva / 100);
    const prixTTCRemise = prixTTC * (1 - remise / 100);

    // ✅ Réponse enrichie
    res.json({
      ...normalizedProduct,
      prixTTC: +prixTTC.toFixed(2),
      prixTTCRemise: +prixTTCRemise.toFixed(2)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du produit avec images :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;