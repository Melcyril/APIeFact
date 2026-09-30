const express = require('express');
const { Cart_Item, Cart, Product, Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.put('/:id_cart_item', authenticateToken, async (req, res) => {
  try {
    const { id_cart_item } = req.params;
    const { quantite } = req.body;

    // ==========================
    // 🔒 Validation quantité
    // ==========================
    if (quantite == null || quantite < 1) {
      return res.status(400).json({ message: 'Quantité valide requise' });
    }

    // ==========================
    // 🧺 Item + produit + images
    // ==========================
    const cartItem = await Cart_Item.findByPk(id_cart_item, {
      include: [
        {
          model: Cart,
          as: 'cart',
          attributes: ['id_user']
        },
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
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item non trouvé' });
    }

    // ==========================
    // 🔐 Sécurité utilisateur
    // ==========================
    if (cartItem.cart.id_user !== req.user.id_user) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // ==========================
    // 🔒 Vérification stock
    // ==========================
    if (cartItem.product.stock <= 0) {
      return res.status(409).json({
        message: 'Produit en rupture de stock'
      });
    }

    if (quantite > cartItem.product.stock) {
      return res.status(409).json({
        message: `Stock insuffisant. Stock disponible : ${cartItem.product.stock}`
      });
    }

    // ==========================
    // 🔄 Mise à jour quantité
    // ==========================
    cartItem.quantite = quantite;
    await cartItem.save();

    // ==========================
    // 💰 Calcul prix
    // ==========================
    const prixHT = parseFloat(cartItem.product.prixHT) || 0;
    const tva = parseFloat(cartItem.product.tva) || 0;
    const remise = parseFloat(cartItem.product.remise) || 0;

    const ttcAvantRemise = prixHT * (1 + tva / 100);
    const prixTTC = +(ttcAvantRemise * (1 - remise / 100)).toFixed(2);
    const totalTTC_item = +(prixTTC * cartItem.quantite).toFixed(2);

    // ==========================
    // 🖼️ Image principale
    // ==========================
    let mainImage = null;
    if (cartItem.product.images?.length) {
      const principale = cartItem.product.images.find(img => img.is_principale);
      mainImage = (principale || cartItem.product.images[0]).image_url.replace(/\\/g, '/');
    }

    // ==========================
    // 📤 Réponse finale
    // ==========================
    res.json({
      message: 'Quantité mise à jour',
      cartItem: {
        id_cart_item: cartItem.id_cart_item,
        id_cart: cartItem.id_cart,
        id_product: cartItem.id_product,
        quantite: cartItem.quantite,
        product: {
          id_product: cartItem.product.id_product,
          nom: cartItem.product.nom,
          prixHT,
          tva,
          remise,
          prixTTC,
          main_image_url: mainImage
        },
        totalTTC_item
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
