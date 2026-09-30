const express = require('express');
const { Product_Image } = require('../../models');
const authenticateToken = require('../../middlewares/auth');
const authorizeRoles = require('../../middlewares/role');
const upload = require('../../middlewares/multer');

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles(3),
  upload.single('image'),
  async (req, res) => {
    try {
      const { id_product, is_principale } = req.body;

      if (!id_product || !req.file) {
        return res.status(400).json({ message: 'id_product et image requis.' });
      }

      // 🔒 normalisation booléen
      const isPrincipale =
        is_principale === 'true' || is_principale === true;

      // ⭐ désactiver anciennes images principales si besoin
      if (isPrincipale) {
        await Product_Image.update(
          { is_principale: false },
          { where: { id_product } }
        );
      }

      // 📁 chemins fichiers
      const oldPath = path.join(
        __dirname,
        '../../uploads',
        req.file.filename
      );

      const baseName = path.parse(req.file.filename).name;
      const newFilename = `${baseName}.webp`;

      const newPath = path.join(
        __dirname,
        '../../uploads',
        newFilename
      );

      // 🔥 compression + resize
      await sharp(oldPath)
        .resize(800)
        .webp({ quality: 80 })
        .toFile(newPath);

      // ❗ suppression SAFE (Windows compatible)
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.warn("⚠️ Impossible de supprimer l'image originale :", err.message);
        }
      });

      // 💾 DB
      const newImage = await Product_Image.create({
        id_product,
        image_url: newFilename,
        is_principale: isPrincipale
      });

      res.status(201).json({
        message: 'Image ajoutée et optimisée avec succès',
        newImage
      });

    } catch (error) {
      console.error('Erreur lors de l’ajout de l’image :', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  }
);

module.exports = router;