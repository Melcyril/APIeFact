const express = require('express');
const { Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

// Modifier une image de produit
router.put('/:id_image', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    const { id_image } = req.params;
    const { image_url, is_principale } = req.body;

    const image = await Product_Image.findByPk(id_image);
    if (!image) return res.status(404).json({ message: 'Image non trouvée.' });

    await image.update({ image_url, is_principale });

    res.json({ message: 'Image mise à jour avec succès', image });
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
