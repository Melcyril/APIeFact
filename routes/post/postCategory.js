const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  const { nom, parent_id, ordre, actif } = req.body;

  try {
    const newCategory = await Category.create({ nom, parent_id, ordre, actif });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur création catégorie :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
