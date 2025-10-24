const express = require('express');
const { Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');

const router = express.Router();

// Ajouter une image à un produit
router.post('/', authenticateToken, authorizeRoles(3), async (req, res) => {
  try {
    const { id_product, image_url, is_principale } = req.body;

    if (!id_product || !image_url) {
      return res.status(400).json({ message: 'id_product et image_url sont requis.' });
    }

    const newImage = await Product_Image.create({
      id_product,
      image_url,
      is_principale: is_principale || false
    });

    res.status(201).json({ message: 'Image ajoutée avec succès', newImage });
  } catch (error) {
    console.error('Erreur lors de l’ajout de l’image :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
