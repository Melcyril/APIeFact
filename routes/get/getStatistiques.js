const express = require('express');
const { Order_Item, Product, Order, User } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');
const { Op, fn, col, literal } = require('sequelize');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    // Récupération de tous les Order_Items avec les produits associés
    const orderItems = await Order_Item.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['nom', 'prix_achat', 'prixHT', 'tva', 'remise'] }
      ]
    });

    let totalSales = 0;   // chiffre d'affaires TTC après remise
    let totalProfit = 0;  // bénéfice réel TTC
    let totalTVA = 0;     // TVA à reverser

    for (const item of orderItems) {
      const quantity = item.quantite || 0;
      const produit = item.product;

      // Prix TTC produit avant remise
      const prixTTCProduit = parseFloat(produit.prixHT) * (1 + parseFloat(produit.tva)/100);

      // Montant de la remise
      const remise = parseFloat(produit.remise || 0);
      const montantRemise = prixTTCProduit * (remise / 100);

      // Prix TTC final après remise
      const prixTTCfinal = prixTTCProduit - montantRemise;

      // Chiffre d'affaires
      totalSales += quantity * prixTTCfinal;

      // Bénéfice TTC = prix TTC final - prix d'achat
      totalProfit += quantity * (prixTTCfinal - parseFloat(produit.prix_achat));

      // TVA à reverser = prix TTC final / (1 + tva/100) * (tva/100)
      totalTVA += quantity * (prixTTCfinal / (1 + parseFloat(produit.tva)/100) * (parseFloat(produit.tva)/100));
    }

    // URSSAF = 15% du bénéfice
    const URSSAF = totalProfit * 0.15;

    // Produit le plus vendu
    const mostSold = await Order_Item.findOne({
      attributes: ['id_product', [fn('sum', col('quantite')), 'totalQuantity']],
      group: ['id_product'],
      order: [[literal('totalQuantity'), 'DESC']],
      include: [{ model: Product, as: 'product', attributes: ['nom'] }],
    });

    const produitLePlusVendu = mostSold?.product?.nom || 'Aucun produit';

    // Nombre total de commandes
    const totalOrders = await Order.count();

    // Nombre total de clients
    const totalClients = await User.count();

    // Nouveaux clients (30 derniers jours)
    const recentUsers = await User.count({
      where: {
        date_inscription: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
        }
      }
    });

    res.status(200).json({
      chiffreAffaire: totalSales.toFixed(2),
      benefice: totalProfit.toFixed(2),
      tvaAVerser: totalTVA.toFixed(2),
      urssaf: URSSAF.toFixed(2),
      produitLePlusVendu,
      nombreTotalCommandes: totalOrders,
      nombreClients: totalClients,
      nouveauxClients: recentUsers,
    });

  } catch (err) {
    console.error('Erreur récupération statistiques :', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;
