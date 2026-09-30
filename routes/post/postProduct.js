const express = require('express');
const { Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  const {
    nom,
    marque,
    reference,
    description,
    prix_achat,
    prixHT,
    remise = 0,
    tva = 20,
    actif,
    id_category,
    stock
  } = req.body;

  try {
    // Vérification référence unique
    const existing = await Product.findOne({ where: { reference } });
    if (existing) {
      return res.status(400).json({ message: 'Référence déjà utilisée' });
    }

    // Sécurisation stock
    const safeStock = stock !== undefined && stock >= 0 ? stock : 0;

    // Sécurisation valeurs numériques
    const safePrixHT = parseFloat(prixHT) || 0;
    const safeRemise = parseFloat(remise) || 0;
    const safeTVA = parseFloat(tva) || 20;

    // 🔥 calcul prixTTC
    const prixTTC = +(safePrixHT * (1 - safeRemise / 100) * (1 + safeTVA / 100)).toFixed(2);

    const product = await Product.create({
      nom,
      marque,
      reference,
      description,
      prix_achat,
      prixHT: safePrixHT,
      remise: safeRemise,
      tva: safeTVA,
      prixTTC,
      actif,
      id_category,
      stock: safeStock
    });

    res.status(201).json({
      message: 'Produit créé',
      product
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;