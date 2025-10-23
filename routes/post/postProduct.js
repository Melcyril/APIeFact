const express = require('express');
const { Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  const { nom, marque, reference, prix_achat, prixHT, remise, tva, actif, id_category } = req.body;

  try {
    const existing = await Product.findOne({ where: { reference } });
    if (existing) return res.status(400).json({ message: 'Référence déjà utilisée' });

    const product = await Product.create({
      nom, marque, reference, prix_achat, prixHT, remise, tva, actif, id_category
    });

    res.status(201).json({ message: 'Produit créé', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;
