const express = require('express');
const { Order_Item, Product, Order, User } = require('../../models'); // Importer aussi User
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');
const sequelize = require('sequelize');
const router = express.Router();

router.get('/',authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    // Calcul du chiffre d'affaire total (prixTTC * quantité)
    const totalSalesResult = await Order_Item.findAll({
      attributes: [
        'id_product',
        [sequelize.fn('sum', sequelize.col('quantite')), 'totalQuantity'], // Somme des quantités
      ],
      group: ['Order_Item.id_product'], // Grouper par produit
    });

    let totalSales = 0;
    for (const item of totalSalesResult) {
      const totalQuantity = item.dataValues.totalQuantity;
      const product = await Product.findByPk(item.dataValues.id_product); // On récupère le prixTTC du produit
      const prixTTC = parseFloat(product.prixTTC); // Assurez-vous que 'prixTTC' existe dans la table 'Product'
      totalSales += totalQuantity * prixTTC; // Chiffre d'affaire = quantité * prixTTC
    }

    console.log('Chiffre d\'affaire total:', totalSales); // Affichage du chiffre d'affaire

    // Calcul du bénéfice total basé sur la différence entre le prixTTC et le prixAchat (prix TTC - prix Achat) * quantité
    const totalProfitResult = await Order_Item.findAll({
      attributes: [
        'id_product',
        [sequelize.fn('sum', sequelize.col('quantite')), 'totalQuantity'], // Somme des quantités
      ],
      group: ['Order_Item.id_product'],
    });

    let totalProfit = 0;
    for (const item of totalProfitResult) {
      const totalQuantity = item.dataValues.totalQuantity;
      const product = await Product.findByPk(item.dataValues.id_product);
      const prixTTC = parseFloat(product.prixTTC); // Prix TTC
      const prixAchat = parseFloat(product.prix_achat); // Prix d'achat
      totalProfit += (prixTTC - prixAchat) * totalQuantity; // Bénéfice = (prixTTC - prixAchat) * quantité
    }

    console.log('Bénéfice total:', totalProfit); // Affichage du bénéfice

    // Calcul de la TVA à verser (prixTTC - prixHT) * quantité
    const totalTVAResult = await Order_Item.findAll({
      attributes: [
        'id_product',
        [sequelize.fn('sum', sequelize.col('quantite')), 'totalQuantity'], // Somme des quantités
      ],
      group: ['Order_Item.id_product'],
    });

    let totalTVA = 0;
    for (const item of totalTVAResult) {
      const totalQuantity = item.dataValues.totalQuantity;
      const product = await Product.findByPk(item.dataValues.id_product);
      const prixTTC = parseFloat(product.prixTTC);
      const prixHT = parseFloat(product.prixHT); // Assurez-vous que 'prixHT' est dans la table 'Product'
      totalTVA += (prixTTC - prixHT) * totalQuantity; // TVA = (prixTTC - prixHT) * quantité
    }

    console.log('TVA à verser:', totalTVA); // Affichage de la TVA

    // Calcul de l'URSSAF (par exemple 15% du bénéfice brut)
    const URSSAF = totalProfit * 0.15;

    // Produit le plus vendu
    const mostSoldProduct = await Order_Item.findAll({
      attributes: [
        'id_product',
        [sequelize.fn('sum', sequelize.col('quantite')), 'totalQuantity'], // Somme des quantités
      ],
      group: ['Order_Item.id_product'], // Grouper par produit
      order: [[sequelize.literal('totalQuantity'), 'DESC']], // Trier par quantité décroissante
      limit: 1, // Limiter à un seul produit
      include: [{
        model: Product,
        as: 'product',
        attributes: ['nom'], // Inclure le nom du produit
      }],
    });

    const produitLePlusVendu = mostSoldProduct[0] ? mostSoldProduct[0].product.nom : 'Aucun produit';

    // Nombre total de commandes
    const totalOrders = await Order.count();

    // Nombre total de clients (utilisateurs)
    const totalClients = await User.count(); // Récupère le nombre total d'utilisateurs

    // Nombre d'utilisateurs inscrits récemment (par exemple, inscrits dans les 30 derniers jours)
    const recentUsers = await User.count({
      where: {
        date_inscription: {
          [sequelize.Op.gte]: sequelize.fn('DATE_SUB', sequelize.fn('NOW'), sequelize.literal('INTERVAL 30 DAY')),
        }
      }
    });

    // Réponse formatée
    res.status(200).json({
      chiffreAffaire: totalSales.toFixed(2), // Chiffre d'affaire total
      benefice: totalProfit.toFixed(2), // Bénéfice total
      tvaAVerser: totalTVA.toFixed(2), // TVA à verser
      urssaf: URSSAF.toFixed(2), // URSSAF à verser
      produitLePlusVendu, // Produit le plus vendu
      nombreTotalCommandes: totalOrders, // Nombre total de commandes
      nombreClients: totalClients, // Nombre total de clients
      nouveauxClients: recentUsers, // Nombre de nouveaux clients (inscrits dans les 30 derniers jours)
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques :', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;
