const express = require('express');
const { Cart, Cart_Item, Product, Product_Image } = require('../../models');
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
              attributes: [
                'id_product',
                'nom',
                'prixHT',
                'tva',
                'remise',
                'stock'
              ],
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

    let itemsWithStatus = [];
    let canCheckout = true;

    if (cart && cart.items && cart.items.length > 0) {
      // ==========================
      // 🧮 Mapping items
      // ==========================
      itemsWithStatus = cart.items.map(item => {
        const prixHT = parseFloat(item.product.prixHT) || 0;
        const tva = parseFloat(item.product.tva) || 0;
        const remise = parseFloat(item.product.remise) || 0;

        const ttcAvantRemise = prixHT * (1 + tva / 100);
        const prixTTC = +(ttcAvantRemise * (1 - remise / 100)).toFixed(2);
        const totalTTC_item = +(prixTTC * item.quantite).toFixed(2);

        const outOfStock =
          item.product.stock <= 0 || item.quantite > item.product.stock;

        if (outOfStock) {
          canCheckout = false;
        }

        // ==========================
        // 🖼️ Image principale
        // ==========================
        let mainImage = null;
        if (item.product.images?.length) {
          const principale = item.product.images.find(img => img.is_principale);
          mainImage = (principale || item.product.images[0]).image_url.replace(/\\/g, '/');
        }

        return {
          id_cart_item: item.id_cart_item,
          id_product: item.id_product,
          quantite: item.quantite,
          out_of_stock: outOfStock,
          can_checkout_item: !outOfStock,
          product: {
            id_product: item.product.id_product,
            nom: item.product.nom,
            prixHT,
            tva,
            remise,
            prixTTC,
            stock: item.product.stock,
            main_image_url: mainImage
          },
          totalTTC_item
        };
      });
    } else {
      // Panier vide
      canCheckout = false;
    }

    // ==========================
    // 💰 Total panier (items valides uniquement)
    // ==========================
    const TotalPanierTTC = +itemsWithStatus
      .filter(item => item.can_checkout_item)
      .reduce((sum, item) => sum + item.totalTTC_item, 0)
      .toFixed(2);

    // ==========================
    // 📤 Réponse finale
    // ==========================
    res.json({
      id_cart: cart?.id_cart ?? null,
      id_user: cart?.id_user ?? req.user.id_user,
      date_creation: cart?.date_creation ?? null,
      can_checkout: canCheckout,
      items: itemsWithStatus,
      TotalPanierTTC
    });

  } catch (error) {
    console.error('❌ Erreur récupération panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;