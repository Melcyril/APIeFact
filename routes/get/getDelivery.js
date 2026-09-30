const express = require('express');
const router = express.Router();
const { Delivery } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

// 📌 Récupérer toutes les méthodes de livraison
router.get('/', authenticateToken, async (req, res) => {
  try {
    const methods = await Delivery.findAll(); // 👈 plus de filtre
    res.json(methods);
  } catch (error) {
    console.error('❌ Error fetching delivery methods:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
