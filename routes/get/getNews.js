const express = require('express');
const router = express.Router();

const { Product, Product_Image, Category } = require('../../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {

  try {

    const productsRaw = await Product.findAll({

      where: {
        stock: { [Op.gt]: 0 }
      },

      order: [
        ['id_product', 'DESC']
      ],

      limit: 3,

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

      const mainImage =
        product.images?.find(i => i.is_principale) ||
        product.images?.[0] ||
        null;

      return {
        ...product,
        main_image_url: mainImage?.image_url || null
      };
    });

    res.json(products);

  } catch (err) {

    console.error('❌ getNews error:', err);
    res.status(500).json({ message: 'Erreur serveur' });

  }
});

module.exports = router;