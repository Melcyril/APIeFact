const express = require('express');
const { Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

// Supprimer une image
router.delete('/:id_image', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    const { id_image } = req.params;

    const image = await Product_Image.findByPk(id_image);
    if (!image) return res.status(404).json({ message: 'Image non trouvée.' });

    await image.destroy();
    res.json({ message: 'Image supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
