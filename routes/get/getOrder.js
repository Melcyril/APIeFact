const express = require('express');

const {
  Order,
  Order_Item,
  Product,
  Delivery,
  Payment_Method
} = require('../../models');

const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

/**
 * GET /api/getOrder
 *
 * Récupère les commandes de l'utilisateur connecté
 *
 * Rôles autorisés :
 * 2 = utilisateur
 * 3 = administrateur
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles(2, 3),
  async (req, res) => {

    try {

      // ==========================================
      // UTILISATEUR CONNECTÉ
      // ==========================================

      const userId = req.user.id_user;

      // ==========================================
      // RÉCUPÉRATION DES COMMANDES
      // ==========================================

      const orders = await Order.findAll({

        where: {
          id_user: userId
        },

        include: [

          // ========================================
          // ARTICLES DE LA COMMANDE
          // ========================================

          {
            model: Order_Item,
            as: 'items',

            required: false,

            include: [

              {
                model: Product,
                as: 'product',

                attributes: [
                  'id_product',
                  'nom',
                  'reference'
                ]
              }

            ]
          },

          // ========================================
          // LIVRAISON
          // ========================================

          {
            model: Delivery,
            as: 'delivery',

            required: false,

            attributes: [
              'nom',
              'frais'
            ]
          },

          // ========================================
          // MÉTHODE DE PAIEMENT
          // ========================================

          {
            model: Payment_Method,
            as: 'payment_method',

            required: false,

            attributes: [
              'nom'
            ]
          }

        ],

        // Les commandes les plus récentes en premier
        order: [
          ['date_commande', 'DESC']
        ]

      });

      // ==========================================
      // TOTAL DE TOUTES LES COMMANDES
      // ==========================================

      let totalCommandes = 0;

      // ==========================================
      // FORMATAGE DES COMMANDES
      // ==========================================

      const formattedOrders = orders.map(order => {

        let totalOrder = 0;

        // ========================================
        // ARTICLES
        // ========================================

        const items = (order.items || []).map(item => {

          const prixTTC = Number(item.prixTTC);
          const quantite = Number(item.quantite);

          const totalItem =
            prixTTC * quantite;

          totalOrder += totalItem;

          return {

            id_order_item:
              item.id_order_item,

            id_order:
              item.id_order,

            id_product:
              item.id_product,

            nom:
              item.product?.nom || null,

            reference:
              item.product?.reference || null,

            quantite,

            prixTTC:
              prixTTC.toFixed(2),

            total:
              totalItem.toFixed(2)

          };

        });

        // ========================================
        // FRAIS DE LIVRAISON
        // ========================================

        const fraisLivraison = Number(
          order.delivery?.frais || 0
        );

        // ========================================
        // TOTAL À PAYER
        // ========================================

        const totalAPayer =
          totalOrder + fraisLivraison;

        totalCommandes += totalAPayer;

        // ========================================
        // COMMANDE
        // ========================================

        return {

          // --------------------------------------
          // IDENTIFIANTS
          // --------------------------------------

          id_order:
            order.id_order,

          id_user:
            order.id_user,

          id_payment_method:
            order.id_payment_method,

          id_delivery:
            order.id_delivery,

          // --------------------------------------
          // INFORMATIONS DE LIVRAISON
          // --------------------------------------

          nom_livraison:
            order.nom_livraison,

          prenom_livraison:
            order.prenom_livraison,

          adresse_livraison:
            order.adresse_livraison,

          ville:
            order.ville,

          code_postal:
            order.code_postal,

          telephone:
            order.telephone,

          // --------------------------------------
          // INFORMATIONS COMMANDE
          // --------------------------------------

          date_commande:
            order.date_commande,

          statut_commande:
            order.statut_commande,

          // --------------------------------------
          // ARTICLES
          // --------------------------------------

          items,

          // --------------------------------------
          // TOTAUX
          // --------------------------------------

          total_commande:
            totalOrder.toFixed(2),

          frais_livraison:
            fraisLivraison.toFixed(2),

          total_a_payer:
            totalAPayer.toFixed(2),

          // --------------------------------------
          // LIVRAISON
          // --------------------------------------

          livraison:
            order.delivery?.nom || null,

          // --------------------------------------
          // PAIEMENT
          // --------------------------------------

          paiement:
            order.payment_method?.nom || null

        };

      });

      // ==========================================
      // RÉPONSE
      // ==========================================

      return res.status(200).json({

        total_orders:
          formattedOrders.length,

        total_commandes_utilisateur:
          totalCommandes.toFixed(2),

        orders:
          formattedOrders

      });

    } catch (err) {

      console.error(
        '❌ Erreur récupération commandes utilisateur :',
        err
      );

      return res.status(500).json({
        message: 'Erreur interne serveur'
      });

    }

  }
);

module.exports = router;

