const express = require('express');
const { Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');
const upload = require('../../middlewares/multer'); // Multer pour gérer les fichiers

const router = express.Router();

// Choisir image principale
router.put('/:id_image', authenticateToken, authorizeRoles(3), upload.single('image'), async (req, res) => {
  try {
    const { id_image } = req.params;
    const { is_principale } = req.body;

    const image = await Product_Image.findByPk(id_image);
    if (!image) {
      return res.status(404).json({ message: 'Image introuvable' });
    }

    // ⭐ Si cette image devient principale
    if (is_principale === 'true' || is_principale === true) {
      // Toutes les images du produit passent à false
      await Product_Image.update(
        { is_principale: false },
        { where: { id_product: image.id_product } }
      );

      image.is_principale = true;
    }

    // 🖼️ Mise à jour du fichier si fourni
    if (req.file) {
      image.image_url = req.file.filename;
    }

    await image.save();

    res.json({
      message: 'Image mise à jour avec succès',
      image
    });

  } catch (error) {
    console.error('Erreur updateProduct_Image:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

module.exports = router;
