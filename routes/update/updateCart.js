const express = require('express');
const { Cart_Item, Cart, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.put('/:id_cart_item', authenticateToken, async (req, res) => {
  try {
    const { id_cart_item } = req.params;
    const { quantite } = req.body;

    if (quantite == null || quantite < 1) {
      return res.status(400).json({ message: 'Quantité valide requise' });
    }

    // Récupère l'item avec son panier et le produit
    const cartItem = await Cart_Item.findByPk(id_cart_item, {
      include: [
        { model: Cart, as: 'cart', attributes: ['id_user'] },
        { model: Product, as: 'product', attributes: ['id_product', 'nom', 'prixHT', 'tva'] }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item non trouvé' });
    }

    // Vérifie que l'item appartient bien à l'utilisateur
    if (cartItem.cart.id_user !== req.user.id_user) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Met à jour la quantité
    cartItem.quantite = quantite;
    await cartItem.save();

    // Calcul du prix TTC
    const prixTTC = parseFloat(cartItem.product.prixHT) * (1 + parseFloat(cartItem.product.tva) / 100);
    const totalTTC_item = prixTTC * cartItem.quantite;

    // Prépare la réponse
    const cartItemWithProduct = {
      id_cart_item: cartItem.id_cart_item,
      id_cart: cartItem.id_cart,
      id_product: cartItem.id_product,
      quantite: cartItem.quantite,
      product: {
        id_product: cartItem.product.id_product,
        nom: cartItem.product.nom,
        prixHT: parseFloat(cartItem.product.prixHT).toFixed(2),
        prixTTC: prixTTC.toFixed(2)
      },
      totalTTC_item: totalTTC_item.toFixed(2)
    };

    res.json({ message: 'Quantité mise à jour', cartItem: cartItemWithProduct });

  } catch (error) {
    console.error('Erreur mise à jour panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;