const express = require('express');
const { Cart, Cart_Item, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * POST /api/cart/merge
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    // 🔹 Récupérer ou créer le panier utilisateur
    let cart = await Cart.findOne({ where: { id_user: req.user.id_user } });
    if (!cart) cart = await Cart.create({ id_user: req.user.id_user });

    // 🔄 Fusion seulement si items non vide
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const { id_product, quantite } = item;
        if (!id_product || quantite < 1) continue;

        const product = await Product.findByPk(id_product);
        if (!product) continue;

        const existingItem = await Cart_Item.findOne({
          where: { id_cart: cart.id_cart, id_product }
        });

        if (existingItem) {
          existingItem.quantite += quantite;
          await existingItem.save();
        } else {
          await Cart_Item.create({
            id_cart: cart.id_cart,
            id_product,
            quantite
          });
        }
      }
    }

    // 🔁 Récupérer le panier final avec produits
    const mergedCart = await Cart_Item.findAll({
      where: { id_cart: cart.id_cart },
      include: [{ model: Product, as: 'product' }]
    });

    // Si panier vide, renvoyer tableau vide
    return res.json({
      message: 'Panier fusionné avec succès',
      cart: mergedCart || []
    });

  } catch (error) {
    console.error('❌ Erreur merge panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
