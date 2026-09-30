const express = require('express');
const { Cart, Cart_Item, sequelize } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.delete('/', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ Trouver le panier de l'utilisateur
    const cart = await Cart.findOne({
      where: { id_user: req.user.id_user },
      transaction
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Panier introuvable' });
    }

    // 2️⃣ Supprimer TOUS les items du panier
    await Cart_Item.destroy({
      where: { id_cart: cart.id_cart },
      transaction
    });

    // 3️⃣ Commit
    await transaction.commit();

    res.status(200).json({
      message: 'Panier vidé avec succès',
      items: [],
      TotalPanierTTC: 0
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur suppression panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
