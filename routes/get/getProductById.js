const express = require('express');
const { Product, Category, Product_Image, Review, User } = require('../../models');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
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
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id_user', 'nom', 'prenom']
            }
          ],
          attributes: ['id_review', 'rating', 'comment', 'createdAt']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // 🔥 calcul rating moyen
    const plain = product.toJSON();

    const ratings = plain.reviews?.map(r => r.rating) || [];
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    res.json({
      ...plain,
      avgRating: +avgRating.toFixed(1)
    });

  } catch (error) {
    console.error('Erreur récupération produit par ID :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;