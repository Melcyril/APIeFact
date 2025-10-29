const express = require('express');
const { Cart, Cart_Item, Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id_product, quantite } = req.body;

    if (!id_product || !quantite) {
      return res.status(400).json({ message: 'id_product et quantite valides requis' });
    }

    const product = await Product.findByPk(id_product);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    let cart = await Cart.findOne({ where: { id_user: req.user.id_user } });
    if (!cart) cart = await Cart.create({ id_user: req.user.id_user });

    let cartItem = await Cart_Item.findOne({ where: { id_cart: cart.id_cart, id_product } });

    if (cartItem) {
      cartItem.quantite += quantite;
      await cartItem.save();
    } else {
      cartItem = await Cart_Item.create({ id_cart: cart.id_cart, id_product, quantite });
    }

    // Construction de l'objet à renvoyer avec prixTTC et totalTTC
    const cartItemWithProduct = {
      ...cartItem.toJSON(),
      product: {
        id_product: product.id_product,
        nom: product.nom,
        prixHT: parseFloat(product.prixHT),
        prixTTC: product.prixTTC
      },
      totalTTC_item: +(product.prixTTC * cartItem.quantite).toFixed(2)
    };

    res.json({ message: 'Produit ajouté au panier', cartItem: cartItemWithProduct });
  } catch (error) {
    console.error('Erreur ajout au panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;

