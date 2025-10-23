const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.put('/:id', authenticateToken, authorizeRoles(3), async (req, res) => {
  const categoryId = req.params.id;
  const { nom, parent_id, ordre, actif } = req.body;

  try {
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });

    await category.update({ nom, parent_id, ordre, actif });
    res.json(category);
  } catch (error) {
    console.error('Erreur update catégorie :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
