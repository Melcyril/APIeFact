const express = require('express');
const { Product, Product_Image } = require('../../models');

const router = express.Router();

// 🔍 Récupérer l'image principale d'un produit
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
  
      if (!normalizedProduct.images || normalizedProduct.images.length === 0) {
        return res.json({ main_image_url: null });
      }
  
      const principale = normalizedProduct.images.find(img => img.is_principale);
      const main_image_url = (principale || normalizedProduct.images[0]).image_url.replace(/\\/g, '/');
  
      res.json({ main_image_url });
  
    } catch (error) {
      console.error('Erreur lors de la récupération de l’image principale :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  });

module.exports = router;
