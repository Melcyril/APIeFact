const express = require('express');
const { Cart, Cart_Item, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { id_user: req.user.id_user },
      attributes: ['id_cart', 'id_user', 'date_creation'],
      include: [
        {
          model: Cart_Item,
          as: 'items',
          attributes: ['id_cart_item', 'quantite', 'id_product'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id_product', 'nom', 'prixHT', 'tva', 'prixTTC']
            }
          ]
        }
      ]
    });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Panier vide' });
    }

    // Calcul totalTTC_item et TotalPanierTTC
    const itemsWithTotal = cart.items.map(item => {
      const totalTTC_item = parseFloat(
        (item.product.prixTTC * item.quantite).toFixed(2)
      );
      return {
        id_cart_item: item.id_cart_item,
        id_product: item.id_product,
        quantite: item.quantite,
        product: item.product,
        totalTTC_item
      };
    });

    const TotalPanierTTC = parseFloat(
      itemsWithTotal.reduce((sum, item) => sum + item.totalTTC_item, 0).toFixed(2)
    );

    res.json({
      id_cart: cart.id_cart,
      id_user: cart.id_user,
      date_creation: cart.date_creation,
      items: itemsWithTotal,
      TotalPanierTTC
    });
  } catch (error) {
    console.error('Erreur récupération panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
