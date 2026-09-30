const express = require('express');
const { Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.put('/:id', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

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

    // Validation
    if (
      (prixHT !== undefined && prixHT < 0) ||
      (prix_achat !== undefined && prix_achat < 0) ||
      (tva !== undefined && tva < 0) ||
      (remise !== undefined && remise < 0) ||
      (stock !== undefined && stock < 0)
    ) {
      return res.status(400).json({
        message: 'Les valeurs ne peuvent pas être négatives.'
      });
    }

    // Sécurisation valeurs
    const safePrixHT = prixHT !== undefined ? parseFloat(prixHT) : product.prixHT;
    const safeRemise = remise !== undefined ? parseFloat(remise) : product.remise || 0;
    const safeTVA = tva !== undefined ? parseFloat(tva) : product.tva || 20;

    // 🔥 recalcul prixTTC
    const prixTTC = +(safePrixHT * (1 - safeRemise / 100) * (1 + safeTVA / 100)).toFixed(2);

    // Mise à jour
    await product.update({
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
      stock
    });

    res.json({
      message: 'Produit mis à jour avec succès',
      product
    });

  } catch (err) {
    console.error('Erreur lors de la mise à jour du produit :', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;