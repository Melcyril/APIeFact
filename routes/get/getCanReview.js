const express = require('express');
const router = express.Router();

const authenticateToken = require('../../middlewares/auth');

const {
  Review,
  Product,
  Order,
  Order_Item
} = require('../../models');

router.get('/can-review/:id_product', authenticateToken, async (req, res) => {

  try {

    const id_user = req.user.id_user;
    const id_product = Number(req.params.id_product);

    // =========================
    // CHECK PRODUCT EXIST
    // =========================
    const product = await Product.findByPk(id_product);

    if (!product) {
      return res.status(404).json({
        canReview: false,
        message: 'Produit introuvable'
      });
    }

    // =========================
    // CHECK IF BOUGHT
    // =========================
    const hasBought = await Order_Item.findOne({
      include: [
        {
          model: Order,
          as: 'order',
          where: { id_user }
        }
      ],
      where: { id_product }
    });

    if (!hasBought) {
      return res.json({
        canReview: false,
        reason: 'NOT_BOUGHT'
      });
    }

    // =========================
    // CHECK IF ALREADY REVIEWED
    // =========================
    const existing = await Review.findOne({
      where: {
        id_user,
        id_product
      }
    });

    if (existing) {
      return res.json({
        canReview: false,
        reason: 'ALREADY_REVIEWED'
      });
    }

    // =========================
    // OK
    // =========================
    return res.json({
      canReview: true
    });

  } catch (error) {

    console.error('❌ getCanReview ERROR:', error);

    return res.status(500).json({
      canReview: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;