const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * Récupère TOUTES les catégories et reconstruit l’arbre
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['ordre', 'ASC']]
    });

    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item.toJSON(),
          subcategories: buildTree(items, item.id_category)
        }));
    };

    const tree = buildTree(categories);

    res.json(tree);
  } catch (error) {
    console.error('Erreur récupération catégories :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
