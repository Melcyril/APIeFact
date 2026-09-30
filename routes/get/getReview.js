const express = require('express');
const router = express.Router();

const { Review, User } = require('../../models');

// 🔍 GET /api/review/:id_product
router.get('/:id_product', async (req, res) => {

  try {

    const { id_product } = req.params;

    const reviews = await Review.findAll({

      where: { id_product },

      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id_user', 'nom', 'prenom']
        }
      ],

      order: [['id_review', 'DESC']]
    });

    // =========================
    // MOYENNE DES NOTES
    // =========================
    const total = reviews.length;

    const avg =
      total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    return res.json({

      total,

      average: Number(avg.toFixed(2)),

      reviews
    });

  } catch (error) {

    console.error('❌ Erreur getReview:', error);

    return res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;