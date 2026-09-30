const express = require('express');

const {
  Order,
  Order_Item,
  Cart,
  Cart_Item,
  Product,
  Payment_Method,
  Delivery,
  User
} = require('../../models');

const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const {
  sendOrderConfirmationEmail
} = require('../../services/emailService');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(2, 3), async (req, res) => {

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

    // =====================================================
    // 👤 UTILISATEUR CONNECTÉ
    // =====================================================

    const userId = req.user?.id_user;

    if (!userId) {
      return res.status(400).json({
        message: 'Utilisateur non authentifié'
      });
    }

    console.log('👤 Création commande pour user :', userId);

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({
        message: 'Utilisateur introuvable'
      });
    }

    console.log('📧 Email utilisateur :', user.email);


    // =====================================================
    // 💳 MÉTHODE DE PAIEMENT
    // =====================================================

    const paymentMethod = await Payment_Method.findByPk(
      id_payment_method
    );

    if (!paymentMethod || !paymentMethod.actif) {
      return res.status(400).json({
        message: 'Méthode de paiement invalide.'
      });
    }


    // =====================================================
    // 🚚 MÉTHODE DE LIVRAISON
    // =====================================================

    const delivery = await Delivery.findByPk(id_delivery);

    if (!delivery) {
      return res.status(400).json({
        message: 'Livraison invalide.'
      });
    }


    // =====================================================
    // 🛒 PANIER
    // =====================================================

    const cart = await Cart.findOne({
      where: {
        id_user: userId
      }
    });

    if (!cart) {
      return res.status(400).json({
        message: 'Panier introuvable.'
      });
    }


    // =====================================================
    // 🛍️ PRODUITS DU PANIER
    // =====================================================

    const cartItems = await Cart_Item.findAll({
      where: {
        id_cart: cart.id_cart
      },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!cartItems.length) {
      return res.status(400).json({
        message: 'Votre panier est vide.'
      });
    }

    console.log('🛒 Nombre de produits dans le panier :', cartItems.length);


    // =====================================================
    // 📦 CRÉATION DE LA COMMANDE
    // =====================================================

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
      statut_commande: 'en cours',
      date_commande: new Date()
    });

    console.log('✅ Commande créée :', order.id_order);


    // =====================================================
    // 💰 CALCUL DES TOTAUX
    // =====================================================

    let totalProduits = 0;
    let totalRemise = 0;

    const orderItemsList = [];


    // =====================================================
    // 🔁 CRÉATION DES LIGNES DE COMMANDE
    // =====================================================

    for (const item of cartItems) {

      const produit = item.product;

      if (!produit) {
        console.error(
          '❌ Produit introuvable pour Cart_Item :',
          item.id_cart_item
        );

        continue;
      }

      const prixHT = Number(produit.prixHT || 0);
      const tva = Number(produit.tva || 0);
      const remisePct = Number(produit.remise || 0);

      // Prix TTC avant remise
      const prixTTC = +(
        prixHT * (1 + tva / 100)
      ).toFixed(2);

      // Montant de la remise
      const montantRemise = +(
        prixTTC * (remisePct / 100)
      ).toFixed(2);

      // Prix final TTC
      const prixFinalTTC = +(
        prixTTC - montantRemise
      ).toFixed(2);


      // =================================================
      // 📦 AJOUT DE LA LIGNE DE COMMANDE
      // =================================================

      await Order_Item.create({
        id_order: order.id_order,
        id_product: produit.id_product,
        quantite: item.quantite,
        prixTTC: prixFinalTTC.toFixed(2)
      });


      // =================================================
      // 📉 MISE À JOUR DU STOCK
      // =================================================

      await produit.update({
        stock: Math.max(
          produit.stock - item.quantite,
          0
        )
      });


      // =================================================
      // 💰 TOTAUX
      // =================================================

      totalProduits += (
        prixFinalTTC * item.quantite
      );

      totalRemise += (
        montantRemise * item.quantite
      );


      // =================================================
      // 📧 DONNÉES POUR L'EMAIL
      // =================================================

      orderItemsList.push({
        nom: produit.nom,
        quantite: item.quantite,
        prixTTC,
        montantRemise,
        prixTTCfinal: prixFinalTTC
      });

    }


    // =====================================================
    // 🚚 FRAIS DE LIVRAISON
    // =====================================================

    const fraisLivraison = Number(
      delivery.frais || 0
    );


    // =====================================================
    // 💵 TOTAL FINAL
    // =====================================================

    totalProduits = +totalProduits.toFixed(2);
    totalRemise = +totalRemise.toFixed(2);

    const totalAPayer = +(
      totalProduits + fraisLivraison
    ).toFixed(2);


    console.log('💰 Total produits :', totalProduits);
    console.log('🎁 Total remise :', totalRemise);
    console.log('🚚 Frais livraison :', fraisLivraison);
    console.log('💳 Total à payer :', totalAPayer);


    // =====================================================
    // 🗑️ VIDER LE PANIER
    // =====================================================

    await Cart_Item.destroy({
      where: {
        id_cart: cart.id_cart
      }
    });

    console.log('🗑️ Panier vidé');


    // =====================================================
    // 📧 ENVOI EMAIL DE CONFIRMATION
    // =====================================================

    console.log('');
    console.log('========================================');
    console.log('📧 TENTATIVE ENVOI EMAIL');
    console.log('👤 User ID :', userId);
    console.log('📨 Destinataire :', user.email);
    console.log('📦 Commande :', order.id_order);
    console.log('🛒 Articles :', orderItemsList.length);
    console.log('========================================');


    try {

      const emailResult = await sendOrderConfirmationEmail(
        user.email,
        {
          id: order.id_order,

          nom_client: user.nom,

          items: orderItemsList,

          total_remise: totalRemise.toFixed(2),

          frais_livraison: fraisLivraison.toFixed(2),

          total_ttc: totalProduits.toFixed(2),

          total_a_payer: totalAPayer.toFixed(2),

          nom_livraison,
          prenom_livraison,
          adresse_livraison,
          ville,
          code_postal,
          telephone
        }
      );


      console.log('');
      console.log('========================================');
      console.log('✅ EMAIL COMMANDE ENVOYÉ');
      console.log('📨 Message ID :', emailResult?.messageId);
      console.log('📬 Réponse SMTP :', emailResult?.response);
      console.log('========================================');
      console.log('');

    } catch (emailErr) {

      console.error('');
      console.error('========================================');
      console.error('❌ ERREUR EMAIL COMMANDE');
      console.error('Code :', emailErr?.code);
      console.error('Command :', emailErr?.command);
      console.error('Message :', emailErr?.message);
      console.error('Stack :', emailErr?.stack);
      console.error('========================================');
      console.error('');

    }


    // =====================================================
    // ✅ RÉPONSE API
    // =====================================================

    return res.status(201).json({

      message: 'Commande créée avec succès.',

      order_id: order.id_order,

      total_remise: totalRemise.toFixed(2),

      total_ttc: totalProduits.toFixed(2),

      frais_livraison: fraisLivraison.toFixed(2),

      total_a_payer: totalAPayer.toFixed(2),

      items: orderItemsList

    });


  } catch (err) {

    console.error('');
    console.error('========================================');
    console.error('❌ ERREUR CRÉATION COMMANDE');
    console.error('Message :', err?.message);
    console.error('Stack :', err?.stack);
    console.error('========================================');
    console.error('');

    return res.status(500).json({
      message: 'Erreur interne'
    });

  }

});


module.exports = router;

