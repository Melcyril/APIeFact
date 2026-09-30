const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.delete('/:id', authenticateToken, authorizeRoles(3), async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: 'Catégorie non trouvée' });

    await category.destroy();
    res.json({ message: 'Catégorie supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur suppression catégorie :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
