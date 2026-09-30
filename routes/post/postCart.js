const express = require('express');
const { Cart, Cart_Item, Product, Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

// ➕ Ajouter un produit au panier
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id_product, quantite } = req.body;

    // ==========================
    // 🔒 Validations
    // ==========================
    if (!id_product || !quantite || quantite <= 0) {
      return res.status(400).json({
        message: 'id_product et quantite valides requis'
      });
    }

    // ==========================
    // 📦 Produit + images
    // ==========================
    const product = await Product.findByPk(id_product, {
      include: [
        {
          model: Product_Image,
          as: 'images',
          attributes: ['image_url', 'is_principale']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // ==========================
    // 🔒 Vérification stock (rupture)
    // ==========================
    if (product.stock <= 0) {
      return res.status(409).json({
        message: 'Produit en rupture de stock'
      });
    }

    // ==========================
    // 🛒 Panier utilisateur
    // ==========================
    let cart = await Cart.findOne({
      where: { id_user: req.user.id_user }
    });

    if (!cart) {
      cart = await Cart.create({ id_user: req.user.id_user });
    }

    // ==========================
    // 🧺 Item panier existant
    // ==========================
    let cartItem = await Cart_Item.findOne({
      where: {
        id_cart: cart.id_cart,
        id_product
      }
    });

    const quantiteDejaDansPanier = cartItem ? cartItem.quantite : 0;
    const quantiteTotaleDemandee = quantiteDejaDansPanier + quantite;

    // ==========================
    // 🔒 Vérification stock (quantité)
    // ==========================
    if (quantiteTotaleDemandee > product.stock) {
      return res.status(409).json({
        message: `Stock insuffisant. Stock disponible : ${product.stock}`
      });
    }

    // ==========================
    // ➕ Ajout / mise à jour panier
    // ==========================
    if (cartItem) {
      cartItem.quantite = quantiteTotaleDemandee;
      await cartItem.save();
    } else {
      cartItem = await Cart_Item.create({
        id_cart: cart.id_cart,
        id_product,
        quantite
      });
    }

    // ==========================
    // 💰 Calcul prix TTC
    // ==========================
    const prixHT = parseFloat(product.prixHT) || 0;
    const tva = parseFloat(product.tva) || 0;
    const remise = parseFloat(product.remise) || 0;

    const ttcAvantRemise = prixHT * (1 + tva / 100);
    const prixTTC = +(ttcAvantRemise * (1 - remise / 100)).toFixed(2);

    // ==========================
    // 🖼️ Image principale
    // ==========================
    let mainImage = null;

    if (product.images && product.images.length > 0) {
      const principale = product.images.find(img => img.is_principale);
      mainImage = (principale || product.images[0]).image_url.replace(/\\/g, '/');
    }

    // ==========================
    // 📤 Réponse finale
    // ==========================
    res.json({
      message: 'Produit ajouté au panier',
      cartItem: {
        ...cartItem.toJSON(),
        product: {
          id_product: product.id_product,
          nom: product.nom,
          prixHT,
          tva,
          remise,
          prixTTC,
          main_image_url: mainImage
        },
        totalTTC_item: +(prixTTC * cartItem.quantite).toFixed(2)
      }
    });

  } catch (error) {
    console.error('❌ Erreur ajout au panier :', error);
    res.status(500).json({ message: 'Erreur interne serveur' });
  }
});

module.exports = router;
