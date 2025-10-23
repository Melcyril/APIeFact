const express = require('express');
const { Product } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.put('/:id', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    await product.update(req.body); // Met à jour tous les champs reçus

    res.json({ message: 'Produit mis à jour', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

module.exports = router;
