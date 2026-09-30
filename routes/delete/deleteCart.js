const express = require('express');
const { Cart_Item, Cart, Product, Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.delete('/:id_cart_item', authenticateToken, async (req, res) => {
  try {
    const { id_cart_item } = req.params;

    const cartItem = await Cart_Item.findByPk(id_cart_item, {
      include: [
        {
          model: Cart,
          as: 'cart',
          attributes: ['id_cart', 'id_user']
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item non trouvé dans le panier' });
    }

    // 🔐 Sécurité utilisateur
    if (cartItem.cart.id_user !== req.user.id_user) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const id_cart = cartItem.cart.id_cart;

    // 🗑️ Suppression
    await cartItem.destroy();

    // ==========================
    // 🔄 Recharge panier
    // ==========================
    const cart = await Cart.findByPk(id_cart, {
      include: [
        {
          model: Cart_Item,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: Product_Image,
                  as: 'images',
                  attributes: ['image_url', 'is_principale']
                }
              ]
            }
          ]
        }
      ]
    });

    // Panier vide
    if (!cart || cart.items.length === 0) {
      return res.json({
        message: 'Panier vide',
        items: [],
        TotalPanierTTC: 0
      });
    }

    // ==========================
    // 🧮 Recalcul panier
    // ==========================
    const items = cart.items.map(item => {
      const prixHT = parseFloat(item.product.prixHT) || 0;
      const tva = parseFloat(item.product.tva) || 0;
      const remise = parseFloat(item.product.remise) || 0;

      const ttcAvantRemise = prixHT * (1 + tva / 100);
      const prixTTC = +(ttcAvantRemise * (1 - remise / 100)).toFixed(2);
      const totalTTC_item = +(prixTTC * item.quantite).toFixed(2);

      let mainImage = null;
      if (item.product.images?.length) {
        const principale = item.product.images.find(img => img.is_principale);
        mainImage = (principale || item.product.images[0]).image_url.replace(/\\/g, '/');
      }

      return {
        id_cart_item: item.id_cart_item,
        id_product: item.id_product,
        quantite: item.quantite,
        product: {
          id_product: item.product.id_product,
          nom: item.product.nom,
          prixHT,
          tva,
          remise,
          prixTTC,
          main_image_url: mainImage
        },
        totalTTC_item
      };
    });

    const TotalPanierTTC = +items.reduce((sum, i) => sum + i.totalTTC_item, 0).toFixed(2);

    res.json({
      message: 'Item supprimé du panier',
      items,
      TotalPanierTTC
    });

  } catch (error) {
    console.error('❌ Erreur suppression panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
