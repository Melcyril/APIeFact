const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');

const router = express.Router();

/**
 * 🔥 Récupère TOUTES les catégories actives et reconstruit l’arbre récursivement
 */
router.get('/', async (req, res) => {
  try {
    // 1️⃣ On récupère TOUTES les catégories actives (à plat)
    const categories = await Category.findAll({
      where: { actif: true },
      order: [['ordre', 'ASC']]
    });

    // 2️⃣ Fonction récursive pour construire l’arbre
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item.toJSON(),
          subcategories: buildTree(items, item.id_category)
        }));
    };

    // 3️⃣ Construction de l’arbre depuis les racines
    const tree = buildTree(categories);

    res.json(tree);
  } catch (error) {
    console.error('Erreur récupération catégories actives :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
