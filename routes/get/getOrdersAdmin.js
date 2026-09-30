const express = require('express');
const { Op } = require('sequelize');

const {
  Order,
  Order_Item,
  Product,
  Delivery,
  Payment_Method,
  User
} = require('../../models');

const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {

    try {

      const {
        page = 1,
        limit = 5,
        statut,
        client
      } = req.query;

      const offset =
        (parseInt(page) - 1) * parseInt(limit);

      // ==========================================
      // FILTRES
      // ==========================================

      const whereClause = {};

      if (statut) {
        whereClause.statut_commande = {
          [Op.like]: `%${statut}%`
        };
      }

      // ==========================================
      // RÉCUPÉRATION DES COMMANDES
      // ==========================================

      const {
        count,
        rows: orders
      } = await Order.findAndCountAll({

        where: whereClause,

        distinct: true,

        col: 'id_order',

        include: [

          // ========================================
          // ARTICLES
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
          // PAIEMENT
          // ========================================

          {
            model: Payment_Method,
            as: 'payment_method',

            required: false,

            attributes: [
              'nom'
            ]
          },

          // ========================================
          // CLIENT
          // ========================================

          {
            model: User,
            as: 'user',

            attributes: [
              'id_user',
              'nom',
              'prenom',
              'email'
            ],

            required: !!client,

            where: client
              ? {
                  nom: {
                    [Op.like]: `%${client}%`
                  }
                }
              : undefined
          }

        ],

        // ========================================
        // TRI
        // ========================================

        order: [
          ['date_commande', 'DESC']
        ],

        offset,

        limit: parseInt(limit)

      });

      // ==========================================
      // FORMATAGE
      // ==========================================

      const formattedOrders = orders.map(order => {

        let totalOrder = 0;

        // ========================================
        // ARTICLES
        // ========================================

        const items = (order.items || []).map(item => {

          const prixTTC =
            Number(item.prixTTC);

          const quantite =
            Number(item.quantite);

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

        const fraisLivraison =
          Number(order.delivery?.frais || 0);

        // ========================================
        // TOTAL
        // ========================================

        const totalAPayer =
          totalOrder + fraisLivraison;

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
          // INFORMATIONS LIVRAISON
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
          // CLIENT
          // --------------------------------------

          client:
            order.user
              ? {
                  id_user:
                    order.user.id_user,

                  nom:
                    order.user.nom,

                  prenom:
                    order.user.prenom,

                  email:
                    order.user.email
                }
              : null,

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

        page:
          parseInt(page),

        limit:
          parseInt(limit),

        total_orders:
          count,

        total_pages:
          Math.ceil(
            count / parseInt(limit)
          ),

        orders:
          formattedOrders

      });

    } catch (err) {

      console.error(
        '❌ Erreur récupération commandes admin :',
        err
      );

      return res.status(500).json({
        message: 'Erreur interne serveur'
      });

    }

  }
);

module.exports = router;