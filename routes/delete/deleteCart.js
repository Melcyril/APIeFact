const express = require('express');
const { Cart_Item, Cart } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.delete('/:id_cart_item', authenticateToken, async (req, res) => {
  try {
    const { id_cart_item } = req.params;

    const cartItem = await Cart_Item.findByPk(id_cart_item, {
      include: [{ model: Cart, as: 'cart', attributes: ['id_user'] }] // <--- as: 'cart'
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item non trouvé dans le panier' });
    }

    // Vérifie que l'item appartient bien à l'utilisateur
    if (cartItem.cart.id_user !== req.user.id_user) { // <--- cart au lieu de Cart
      return res.status(403).json({ message: "Accès refusé" });
    }

    await cartItem.destroy();

    res.json({ message: 'Item supprimé du panier' });
  } catch (error) {
    console.error('Erreur suppression panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
