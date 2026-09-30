const express = require('express');
const router = express.Router();

const { Product, Product_Image, Category } = require('../../models');
const { Op } = require('sequelize');

const TVA = 0.20;

function getFinalPrice(product) {

  let remise = product.remise || 0;

  if (remise > 1) remise = remise / 100;
  if (remise < 0) remise = 0;
  if (remise > 0.95) remise = 0.95;

  const htAfter = product.prixHT * (1 - remise);
  return htAfter * (1 + TVA);
}

router.get('/', async (req, res) => {

  try {

    const productsRaw = await Product.findAll({

      where: {
        stock: { [Op.gt]: 0 },
        remise: { [Op.gt]: 0 }
      },

      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id_category', 'nom']
        },
        {
          model: Product_Image,
          as: 'images',
          attributes: ['image_url', 'is_principale']
        }
      ]
    });

    const products = productsRaw.map(p => {

      const product = p.toJSON();

      const prixTTC = getFinalPrice(product);

      const mainImage =
        product.images?.find(i => i.is_principale) ||
        product.images?.[0] ||
        null;

      return {
        ...product,
        prixTTC: Number(prixTTC.toFixed(2)),
        main_image_url: mainImage?.image_url || null
      };
    });

    res.json(products);

  } catch (err) {

    console.error('❌ getPromotions error:', err);
    res.status(500).json({ message: 'Erreur serveur' });

  }
});

module.exports = router;