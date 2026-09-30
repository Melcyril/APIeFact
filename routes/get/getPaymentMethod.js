const express = require('express');
const router = express.Router();
const {Payment_Method } = require('../../models');
const authenticateToken = require('../../middlewares/auth');


// 📌 Récupérer toutes les méthodes de paiement
router.get('/',authenticateToken, async (req, res) => {
  try {
    const methods = await Payment_Method.findAll({
      where: { actif: true }   // si tu veux seulement les actives
    });
    res.json(methods);
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
