const express = require('express');
const { Order, Order_Item, Cart, Cart_Item, Product, Payment_Method, Delivery } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(2,3), async (req, res) => {
  const {
    id_payment_method,
    id_delivery,
    nom_livraison,
    prenom_livraison,
    adresse_livraison,
    ville,
    code_postal,
    telephone
  } = req.body;

  try {
    const userId = req.user?.id_user;

    // Vérifie la méthode de paiement
    const paymentMethod = await Payment_Method.findByPk(id_payment_method);
    if (!paymentMethod || !paymentMethod.actif) {
      return res.status(400).json({ message: 'Méthode de paiement invalide.' });
    }

    // Vérifie la livraison
    const delivery = await Delivery.findByPk(id_delivery);
    if (!delivery) {
      return res.status(400).json({ message: 'Livraison invalide.' });
    }

    // Récupère le panier de l’utilisateur
    const cart = await Cart.findOne({ where: { id_user: userId } });
    if (!cart) return res.status(404).json({ message: 'Aucun panier trouvé pour cet utilisateur.' });

    const cartItems = await Cart_Item.findAll({
      where: { id_cart: cart.id_cart },
      include: [{ model: Product, as: 'product' }],
    });
    if (!cartItems.length) return res.status(400).json({ message: 'Votre panier est vide.' });

    // Création de la commande
    const order = await Order.create({
      id_user: userId,
      id_payment_method,
      id_delivery,
      nom_livraison,
      prenom_livraison,
      adresse_livraison,
      ville,
      code_postal,
      telephone,
      frais_livraison: delivery.frais,
      statut_commande: 'en cours',
      date_commande: new Date(),
    });

    let totalProduits = 0;

    // Création des lignes de commande
    for (const item of cartItems) {
      const produit = item.product;
      const prixHT = parseFloat(produit.prixHT);
      const tva = parseFloat(produit.tva) || 0;
      const prixTTC = prixHT * (1 + tva / 100);

      await Order_Item.create({
        id_order: order.id_order,
        id_product: produit.id_product,
        quantite: item.quantite,
        prixTTC: prixTTC.toFixed(2),
      });

      // Mise à jour du stock
      const newStock = produit.stock - item.quantite;
      await produit.update({ stock: newStock >= 0 ? newStock : 0 });

      totalProduits += prixTTC * item.quantite;
    }

    // ✅ On inverse la logique ici
    const totalTTC = totalProduits; // total des produits seulement
    const totalAPayer = totalProduits + parseFloat(delivery.frais); // produits + frais livraison

    // Vide le panier
    await Cart_Item.destroy({ where: { id_cart: cart.id_cart } });

    // Réponse formatée
    res.status(201).json({
      message: 'Commande créée avec succès.',
      order_id: order.id_order,
      total_ttc: totalTTC.toFixed(2),
      frais_livraison: parseFloat(delivery.frais),
      total_à_payer: totalAPayer.toFixed(2)
    });

  } catch (err) {
    console.error('Erreur lors de la création de la commande :', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;
