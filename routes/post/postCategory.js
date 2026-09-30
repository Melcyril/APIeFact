const express = require('express');
const { Category } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  let { nom, parent_id, ordre, actif } = req.body;

  try {
    // Vérifier la catégorie parent si fournie
    if (parent_id) {
      const parentExists = await Category.findByPk(parent_id);
      if (!parentExists) {
        return res.status(400).json({ message: 'parent_id invalide.' });
      }
    }

    // Calcul automatique de l'ordre si non fourni
    if (!ordre || ordre <= 0) {
      const lastCategory = await Category.findOne({
        where: { parent_id: parent_id || null },
        order: [['ordre', 'DESC']]
      });
      ordre = lastCategory ? lastCategory.ordre + 1 : 1;
    } else {
      // Vérifier si l'ordre fourni est déjà utilisé
      const alreadyUsed = await Category.findOne({
        where: { parent_id: parent_id || null, ordre }
      });

      if (alreadyUsed) {
        return res.status(400).json({ message: 'Ordre déjà utilisé à ce niveau.' });
      }
    }

    const newCategory = await Category.create({ nom, parent_id, ordre, actif });
    res.status(201).json(newCategory);

  } catch (error) {
    console.error('Erreur création catégorie :', error);
    res.status(500).json({ message: 'Erreur interne serveur.' });
  }
});

module.exports = router;
