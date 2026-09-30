const express = require('express');
const { Product, Category, Product_Image, Review } = require('../../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id_category', 'nom']
        },
        {
          model: Product_Image,
          as: 'images',
          attributes: ['id_image', 'image_url', 'is_principale']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['rating']
        }
      ]
    });

    // 🔥 calcul rating moyen
    const enriched = products.map(p => {
      const plain = p.toJSON();

      const ratings = plain.reviews?.map(r => r.rating) || [];
      const avgRating = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return {
        ...plain,
        avgRating: +avgRating.toFixed(1)
      };
    });

    res.json(enriched);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});