const express = require('express');
const router = express.Router();

const { Review, Product, Order_Item, Order } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

// ⭐ POST /api/review
router.post('/', authenticateToken, async (req, res) => {

  try {

    const id_user = req.user.id_user;

    const {
      id_product,
      rating,
      comment
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!id_product || !rating) {
      return res.status(400).json({
        message: 'Produit et note obligatoires'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'La note doit être entre 1 et 5'
      });
    }

    // =========================
    // CHECK PRODUIT
    // =========================
    const product = await Product.findByPk(id_product);

    if (!product) {
      return res.status(404).json({
        message: 'Produit introuvable'
      });
    }

    // =========================
    // 🔥 VERIFICATION ACHAT
    // =========================
    const hasBought = await Order_Item.findOne({
      include: [
        {
          model: Order,
          as: 'order',
          where: { id_user }
        }
      ],
      where: {
        id_product
      }
    });

    if (!hasBought) {
      return res.status(403).json({
        message: "Vous devez avoir acheté ce produit pour laisser un avis"
      });
    }

    // =========================
    // DOUBLE REVIEW CHECK
    // =========================
    const existing = await Review.findOne({
      where: {
        id_user,
        id_product
      }
    });

    if (existing) {
      return res.status(400).json({
        message: 'Vous avez déjà donné un avis sur ce produit'
      });
    }

    // =========================
    // CREATE REVIEW
    // =========================
    const review = await Review.create({
      id_user,
      id_product,
      rating,
      comment: comment || null,
      id_order: hasBought.id_order // ⭐ liaison commande réelle
    });

    return res.status(201).json({
      message: 'Avis ajouté avec succès',
      review
    });

  } catch (error) {

    console.error('❌ postReview ERROR:', error);

    return res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;