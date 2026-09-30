const express = require('express');
const router = express.Router();

const { Review } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

// 🗑️ DELETE /api/review/:id_review
router.delete('/:id_review', authenticateToken, async (req, res) => {

  try {

    const { id_review } = req.params;

    const id_user = req.user.id_user;

    const user_role = req.user.id_statut; // admin = 3

    // =========================
    // FIND REVIEW
    // =========================
    const review = await Review.findByPk(id_review);

    if (!review) {

      return res.status(404).json({
        message: 'Avis introuvable'
      });
    }

    // =========================
    // CHECK PERMISSION
    // =========================
    const isOwner = review.id_user === id_user;

    const isAdmin = user_role === 3;

    if (!isOwner && !isAdmin) {

      return res.status(403).json({
        message: 'Accès refusé'
      });
    }

    // =========================
    // DELETE REVIEW
    // =========================
    await review.destroy();

    return res.json({
      message: 'Avis supprimé avec succès'
    });

  } catch (error) {

    console.error('❌ Erreur deleteReview:', error);

    return res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;